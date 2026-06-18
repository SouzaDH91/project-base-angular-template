import {ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit} from '@angular/core';
import {
  NgbAccordionBody,
  NgbAccordionButton, NgbAccordionCollapse,
  NgbAccordionDirective,
  NgbAccordionHeader,
  NgbAccordionItem,
  NgbModal,
  NgbPagination,
  NgbTooltip
} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { Store, ScannedActionsSubject } from '@ngrx/store';
import Swal from 'sweetalert2';
import { ngxCsv } from 'ngx-csv/ngx-csv';

import { PaginationService } from 'src/app/core/services/pagination.service';
import { ToastService } from "../../core/services/toast.service";
import { Shortcut } from "../../core/models/shortcut.models";
import {TableColumn, TableComponent} from "../../shared/table/table.component";

// Imports das suas Actions e Selectors do escopo de Role
import {
  addShortcut, deleteShortcut,
  deleteShortcutSuccess,
  fetchShortcutListData, updateShortcut
} from '../../store/Shortcut/shortcut.action';
import { selectShortcutData, selectShortcutLoading } from '../../store/Shortcut/shortcut.selector';
import {ofType} from "@ngrx/effects";
import {take} from "rxjs";
import {SharedModule} from "../../shared/shared.module";
import {CustomButtonComponent} from "../../shared/custom-button/custom-button.component";
import {FlatpickrModule} from "angularx-flatpickr";
import {NgClass} from "@angular/common";
import {HasPermissionDirective} from "../../core/directives/has-permission.directive";

@Component({
  selector: 'app-shortcuts',
  templateUrl: './shortcuts.component.html',
  styleUrls: ['./shortcuts.component.scss'],
  imports: [
    SharedModule,
    CustomButtonComponent,
    FormsModule,
    FlatpickrModule,
    TableComponent,
    NgbTooltip,
    NgbPagination,
    ReactiveFormsModule,
    NgClass,
    HasPermissionDirective
  ],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ShortcutsComponent implements OnInit {
  private toastService = inject(ToastService);
  protected service = inject(PaginationService); // Vinculado ao 'service' usado no HTML
  private modalService = inject(NgbModal);
  private formBuilder = inject(UntypedFormBuilder);
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  private actionsSubject = inject(ScannedActionsSubject);

  title: string = 'Shortcuts';
  breadCrumbItems!: Array<{}>;
  submitted = false;
  shortcutForm!: UntypedFormGroup;

  // Listas para controle e renderização de dados
  shortcuts: any[] = [];       // Dados exibidos na página atual da tabela
  permissions: any[] = [];
  shortcutList: Shortcut[] = [];   // Lista master total vinda da Store
  searchResults: Shortcut[] = [];       // Cache usado para buscas, ordenações e filtros
  checkedValGet: any[] = [];       // Itens selecionados via checkbox na tabela

  searchTerm: string = '';
  filterDate: any;
  status: any = '';
  loading: boolean = false;

  deleteId: any;

  itemColumns: TableColumn[] = [
    { key: 'title', label: 'Title', sortable: true },
    { key: 'icon', label: 'Icon', sortable: true },
    { key: 'link', label: 'Link', sortable: true },
    { key: 'actions', label: 'Actions', isAction: true }
  ];

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard', link: '/dashboard', active: false },
      { label: this.title, active: true }
    ];

    this.shortcutForm = this.formBuilder.group({
      id: [''],
      title: ['', [Validators.required]],
      icon: ['', [Validators.required]],
      link: ['', [Validators.required]],
    });

    this.initNgRxStore();
  }

  /**
   * Inicializa e escuta os seletores reativos da Store do NgRx
   */
  initNgRxStore() {
    this.store.select(selectShortcutLoading).subscribe(isLoading => this.loading = isLoading);
    this.store.dispatch(fetchShortcutListData());

    this.store.select(selectShortcutData).subscribe({
      next: (data: any) => {
        // Descobre se o nó da store veio envelopado ou se é o array direto
        const shortcutArray = (data && data.data) ? data.data : data;

        // Se shortcutArray for nulo ou não for array, limpa a tela e para aqui
        if (!Array.isArray(shortcutArray)) {
          this.clearList();
          return;
        }

        // Se o array existir (mesmo vazio), fazemos o mapeamento para refletir mudanças como o 'status'
        const mappedShortcuts = shortcutArray.map((item: any) => ({
          id: item.id,
          title: item.title,
          icon: item.icon,
          link: item.link,
          dbStatus: item.dbStatus,
          created: item.created,
          isSelected: !!item.isSelected
        }));

        // Atualiza TODAS as referências locais que alimentam a paginação e a tabela
        this.shortcutList = mappedShortcuts;
        this.searchResults = mappedShortcuts;

        // CORREÇÃO CRUCIAL: Atualiza a lista que a paginação/tabela usa para renderizar as linhas atuais
        this.shortcuts = [...mappedShortcuts];

        // Força o método de paginação a recalcular e empurrar o novo status para o HTML
        this.changePage();
      },
      error: (err) => {
        this.toastService.error(err?.message || 'Error loading roles state.');
      }
    });
  }

// Método auxiliar para manter o código limpo
  private clearList() {
    this.shortcutList = [];
    this.searchResults = [];
    this.shortcuts = [];
    this.changePage();
  }

  /**
   * Recalcula a página atual através do PaginationService do Velzon
   */
  changePage() {
    this.shortcuts = this.service.changePage(this.searchResults);
  }

  /**
   * Filtro de Pesquisa por Texto (Name/Email) protegido contra valores nulos
   */
  performSearch(): void {
    this.searchResults = this.shortcutList.filter((item: Shortcut) => {
      const title = item.title?.toLowerCase() || '';
      const search = this.searchTerm?.toLowerCase() || '';
      return title.includes(search);
    });
    this.changePage();
  }

  /**
   * Filtro de Período por Data (Flatpickr)
   */
  dateFilter() {
    if (this.filterDate && Object.values(this.filterDate).length > 1) {
      const startDate = new Date(Object.values(this.filterDate)[0] as string);
      const endDate = new Date(Object.values(this.filterDate)[1] as string);

      this.searchResults = this.shortcutList.filter((item: Shortcut) => {
        if (!item.created) return false;
        const itemDate = new Date(item.created);
        return itemDate >= startDate && itemDate <= endDate;
      });
    } else {
      this.searchResults = this.shortcutList;
    }
    this.changePage();
  }

  /**
   * Filtro de Status (Active/Inactive)
   */
  statusFilter() {
    if (this.status !== '') {
      this.searchResults = this.shortcutList.filter((item: Shortcut) => item.dbStatus == this.status);
    } else {
      this.searchResults = this.shortcutList;
    }
    this.changePage();
  }

  /**
   * Captura o evento de ordenação disparado pelos cabeçalhos da tabela genérica
   */
  onSortChanged(columnKey: string) {
    this.searchResults = [...this.searchResults].sort((a: any, b: any) => {
      return a[columnKey]?.toString().localeCompare(b[columnKey]?.toString());
    });
    this.changePage();
  }

  /**
   * Fluxos de Abertura de Modais de Cadastro e Edição
   */
  openModal(content: any) {
    this.submitted = false;
    this.shortcutForm.reset();
    this.modalService.open(content, { size: 'xl', centered: true });
  }

  editDataGet(entity: any, content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'xl', centered: true });

    // Modifica os títulos do modal injetado de forma segura
    setTimeout(() => {
      const modelTitle = document.querySelector('.modal-title') as HTMLElement;
      if (modelTitle) modelTitle.innerHTML = 'Edit Shortcut';
      const updateBtn = document.getElementById('add-btn') as HTMLElement;
      if (updateBtn) updateBtn.innerHTML = "Update";
    }, 50);

    this.shortcutForm.patchValue({
      title: entity?.title,
      icon: entity?.icon,
      link: entity?.link,
      id: entity?.id
    });
  }

  /**
   * Captura a emissão de checkboxes marcados vindos de dentro da tabela genérica
   */
  onTableSelectionChange(selectedItems: any[]) {
    // Atualiza a variável forçando uma nova referência
    this.checkedValGet = [...selectedItems];
  }

  save() {
    this.submitted = true;
    this.loading = true;

    if (this.shortcutForm.valid) {
      const data = this.shortcutForm.value;

      if (data.id) {
        // console.log('Disparar Action de UPDATE para a Store:', formData);
        this.store.dispatch(updateShortcut({ id: data.id, updatedData: data }));
      } else {
        // console.log('Disparar Action de ADD para a Store:', formData);
        this.store.dispatch(addShortcut({ newData: data }));
      }

      this.modalService.dismissAll();
      this.shortcutForm.reset();
      this.submitted = false;
      let isUpdate = data.id ? 'updated' : 'registered';
      this.clearForm();
      this.toastService.success(`Shortcut successfully ${isUpdate}`);
      this.loading = false;
    }
  }

  /**
   * Fluxo de Confirmação de Deleção (Individual e Múltipla)
   */
  confirm(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  deleteMultiple(content: any) {
    if (this.checkedValGet && this.checkedValGet.length > 0) {
      this.deleteId = ''; // Garante que limpou o ID individual, já que é em lote
      this.modalService.open(content, { centered: true });
    } else {
      Swal.fire({ text: 'Please select at least one checkbox', confirmButtonColor: '#299cdb' });
    }
  }

  deleteData() {
    let idsToDelete: string | string[] = [];

    if (this.deleteId) {
      idsToDelete = this.deleteId.toString();
    } else {
      idsToDelete = this.checkedValGet
          .filter((item): item is { id: string } => !!(item && item.id))
          .map(item => item.id);
    }

    const hasItems = Array.isArray(idsToDelete) ? idsToDelete.length > 0 : !!idsToDelete;

    if (hasItems) {
      // 1. Apenas dispara a ação. Quem decide se deu certo ou errado é o Backend -> Effect
      this.store.dispatch(deleteShortcut({ id: idsToDelete }));

      // 2. Monitora o sucesso para limpar a tela de forma segura
      this.listenToDeleteSuccess();
    }
  }

  /**
   * Escuta o estado ou as ações para fechar o modal e resetar a seleção apenas no sucesso
   */
  private listenToDeleteSuccess() {
    this.actionsSubject.pipe(
        ofType(deleteShortcutSuccess), // Escuta especificamente a action de sucesso disparada pelo Effect
        take(1) // Desinscreve automaticamente após a primeira ocorrência
    ).subscribe(() => {
      // FECHA O MODAL E LIMPA A TELA APENAS SE DEU CERTO NO BACKEND!
      this.modalService.dismissAll();
      this.checkedValGet = [];
      this.deleteId = '';

      // Opcional: Se os seus checkboxes do Velzon guardam estado visual no HTML, resete o checkbox master aqui
      const masterCheckbox = document.getElementById('checkAll') as HTMLInputElement;
      if (masterCheckbox) masterCheckbox.checked = false;
    });
  }

  clearForm() {
    this.deleteId = '';
  }

  get form() {
    return this.shortcutForm.controls;
  }
}