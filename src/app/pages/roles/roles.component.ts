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
import { Role } from "../../core/models/role.models";
import {TableColumn, TableComponent} from "../../shared/table/table.component";

// Imports das suas Actions e Selectors do escopo de Role
import {
  addRole, deleteRole,
  deleteRoleSuccess,
  fetchRoleListData, updateRole
} from '../../store/Role/role.action';
import { selectRoleData, selectRoleLoading } from '../../store/Role/role.selector';
import {GlobalComponent} from "../../global-component";
import {ofType} from "@ngrx/effects";
import {take} from "rxjs";
import {selectPermissionData, selectPermissionLoading} from "../../store/Permission/permission.selector";
import {fetchPermissionListData} from "../../store/Permission/permission.action";
import {SharedModule} from "../../shared/shared.module";
import {CustomButtonComponent} from "../../shared/custom-button/custom-button.component";
import {FlatpickrModule} from "angularx-flatpickr";
import {NgClass} from "@angular/common";
import {HasPermissionDirective} from "../../core/directives/has-permission.directive";

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
  imports: [
    SharedModule,
    CustomButtonComponent,
    FormsModule,
    FlatpickrModule,
    TableComponent,
    NgbTooltip,
    NgbPagination,
    ReactiveFormsModule,
    NgbAccordionDirective,
    NgbAccordionItem,
    NgbAccordionHeader,
    NgbAccordionButton,
    NgbAccordionCollapse,
    NgbAccordionBody,
    NgClass,
    HasPermissionDirective
  ],
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RolesComponent implements OnInit {
  private toastService = inject(ToastService);
  protected service = inject(PaginationService); // Vinculado ao 'service' usado no HTML
  private modalService = inject(NgbModal);
  private formBuilder = inject(UntypedFormBuilder);
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  private actionsSubject = inject(ScannedActionsSubject);

  title: string = 'Roles';
  breadCrumbItems!: Array<{}>;
  submitted = false;
  roleForm!: UntypedFormGroup;

  // Listas para controle e renderização de dados
  roles: any[] = [];       // Dados exibidos na página atual da tabela
  permissions: any[] = [];
  roleList: Role[] = [];   // Lista master total vinda da Store
  searchResults: Role[] = [];       // Cache usado para buscas, ordenações e filtros
  checkedValGet: any[] = [];       // Itens selecionados via checkbox na tabela
  permissionsCheckedsValGet: any[] = [];

  searchTerm: string = '';
  filterDate: any;
  status: any = '';
  loading: boolean = false;
  idRoleSuperAdmin: string = 'E24DC9E5-8861-4D3B-954F-29197DD555C3';

  deleteId: any;

  itemColumns: TableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'actions', label: 'Actions', isAction: true }
  ];

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard', link: '/dashboard', active: false },
      { label: this.title, active: true }
    ];

    this.roleForm = this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required]],
      permissionsSelected: ['']
    });

    this.initNgRxStore();
    this.initNgRxStorePermissions();
  }

  /**
   * Inicializa e escuta os seletores reativos da Store do NgRx
   */
  initNgRxStore() {
    this.store.select(selectRoleLoading).subscribe(isLoading => this.loading = isLoading);
    this.store.dispatch(fetchRoleListData());

    this.store.select(selectRoleData).subscribe({
      next: (data: any) => {
        // Descobre se o nó da store veio envelopado ou se é o array direto
        const roleArray = (data && data.data) ? data.data : data;

        // Se roleArray for nulo ou não for array, limpa a tela e para aqui
        if (!Array.isArray(roleArray)) {
          this.clearList();
          return;
        }

        // Se o array existir (mesmo vazio), fazemos o mapeamento para refletir mudanças como o 'status'
        const mappedRoles = roleArray.map((item: any) => ({
          id: item.id,
          name: item.name,
          dbStatus: item.dbStatus,
          created: item.created,
          isSelected: !!item.isSelected,
          permissionsSelected: item.permissionsSelected,
        }));

        // Atualiza TODAS as referências locais que alimentam a paginação e a tabela
        this.roleList = mappedRoles;
        this.searchResults = mappedRoles;

        // CORREÇÃO CRUCIAL: Atualiza a lista que a paginação/tabela usa para renderizar as linhas atuais
        this.roles = [...mappedRoles];

        // Força o método de paginação a recalcular e empurrar o novo status para o HTML
        this.changePage();
      },
      error: (err) => {
        this.toastService.error(err?.message || 'Error loading roles state.');
      }
    });
  }

  initNgRxStorePermissions() {
    this.store.select(selectPermissionLoading).subscribe(isLoading => this.loading = isLoading);
    this.store.dispatch(fetchPermissionListData());

    this.store.select(selectPermissionData).subscribe({
      next: (data: any) => {
        // Descobre se o nó da store veio envelopado ou se é o array direto
        const permissionsArray = (data && data.data) ? data.data : data;

        // Se roleArray for nulo ou não for array, limpa a tela e para aqui
        if (!Array.isArray(permissionsArray)) {
          this.clearList();
          return;
        }

        // Se o array existir (mesmo vazio), fazemos o mapeamento para refletir mudanças como o 'status'
        const mappedGroupedPermissions = permissionsArray.map((item: any) => ({
          permissionName: item.permissionName,
          permissions: item.permissions
        }));

        this.permissions = [...mappedGroupedPermissions];

        // Força o método de paginação a recalcular e empurrar o novo status para o HTML
        this.changePage();
      },
      error: (err) => {
        this.toastService.error(err?.message || 'Error loading permissions state.');
      }
    });
  }

  /**
   * Filtra e higieniza a lista de permissões antes de renderizar no HTML
   */
  getValidPermissions(permissions: any): any[] {
    try {
      // 1. Defesa absoluta contra nulos ou tipos primitivos
      if (!permissions || typeof permissions !== 'object') return [];

      // 2. Converte para array com segurança
      const permissionsArray = Array.isArray(permissions) ? permissions : Object.values(permissions);

      // 3. Filtro ultra-defensivo usando Optional Chaining (?.)
      return permissionsArray.filter(p => {
        // Se 'p' for null ou undefined de alguma forma, o ?. impede o crash e retorna undefined (que o filter remove)
        return p?.permission && p?.name;
      });

    } catch (error) {
      // Se o Angular passar algo bizarro que quebre a lógica de cima,
      // o catch captura e evita o erro vermelho no console, retornando um array vazio.
      console.warn('Evitado um crash de renderização no Accordion:', error);
      return [];
    }
  }

// Método auxiliar para manter o código limpo
  private clearList() {
    this.roleList = [];
    this.searchResults = [];
    this.roles = [];
    this.changePage();
  }

  /**
   * Recalcula a página atual através do PaginationService do Velzon
   */
  changePage() {
    this.roles = this.service.changePage(this.searchResults);
  }

  /**
   * Filtro de Pesquisa por Texto (Name/Email) protegido contra valores nulos
   */
  performSearch(): void {
    this.searchResults = this.roleList.filter((item: Role) => {
      const name = item.name?.toLowerCase() || '';
      const search = this.searchTerm?.toLowerCase() || '';
      return name.includes(search);
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

      this.searchResults = this.roleList.filter((item: Role) => {
        if (!item.created) return false;
        const itemDate = new Date(item.created);
        return itemDate >= startDate && itemDate <= endDate;
      });
    } else {
      this.searchResults = this.roleList;
    }
    this.changePage();
  }

  /**
   * Filtro de Status (Active/Inactive)
   */
  statusFilter() {
    if (this.status !== '') {
      this.searchResults = this.roleList.filter((item: Role) => item.dbStatus == this.status);
    } else {
      this.searchResults = this.roleList;
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
    this.roleForm.reset();
    this.modalService.open(content, { size: 'xl', centered: true });
  }

  editDataGet(entity: any, content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'xl', centered: true });

    // Modifica os títulos do modal injetado de forma segura
    setTimeout(() => {
      const modelTitle = document.querySelector('.modal-title') as HTMLElement;
      if (modelTitle) modelTitle.innerHTML = 'Edit Role';
      const updateBtn = document.getElementById('add-btn') as HTMLElement;
      if (updateBtn) updateBtn.innerHTML = "Update";
    }, 50);

    this.roleForm.patchValue({
      name: entity?.name,
      id: entity?.id
    });

    this.permissionsCheckedsValGet = entity?.permissionsSelected ? [...entity?.permissionsSelected] : [];
  }

  /**
   * Captura a emissão de checkboxes marcados vindos de dentro da tabela genérica
   */
  onTableSelectionChange(selectedItems: any[]) {
    // Atualiza a variável forçando uma nova referência
    this.checkedValGet = [...selectedItems];
  }

  onPermissionSelectionChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const permissionValue = input.value; // Captura ex: "List_Admin"

    if (!this.permissionsCheckedsValGet) {
      this.permissionsCheckedsValGet = [];
    }

    if (input.checked) {
      this.permissionsCheckedsValGet = [...this.permissionsCheckedsValGet, permissionValue];
    } else {
      this.permissionsCheckedsValGet = this.permissionsCheckedsValGet.filter(
          (item) => item !== permissionValue
      );
    }
  }

  save() {
    this.submitted = true;
    this.loading = true;

    if (this.permissionsCheckedsValGet.length == 0) {
      this.toastService.error(`Select at least one permission!`);
      return;
    }

    this.roleForm.get('permissionsSelected')?.setValue(this.permissionsCheckedsValGet);

    if (this.roleForm.valid) {
      const data = this.roleForm.value;

      if (data.id) {
        // console.log('Disparar Action de UPDATE para a Store:', formData);
        this.store.dispatch(updateRole({ id: data.id, updatedData: data }));
      } else {
        // console.log('Disparar Action de ADD para a Store:', formData);
        this.store.dispatch(addRole({ newData: data }));
      }

      this.modalService.dismissAll();
      this.roleForm.reset();
      this.submitted = false;
      let isUpdate = data.id ? 'updated' : 'registered';
      this.clearForm();
      this.toastService.success(`Role successfully ${isUpdate}`);
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
      this.store.dispatch(deleteRole({ id: idsToDelete }));

      // 2. Monitora o sucesso para limpar a tela de forma segura
      this.listenToDeleteSuccess();
    }
  }

  /**
   * Escuta o estado ou as ações para fechar o modal e resetar a seleção apenas no sucesso
   */
  private listenToDeleteSuccess() {
    this.actionsSubject.pipe(
        ofType(deleteRoleSuccess), // Escuta especificamente a action de sucesso disparada pelo Effect
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
    // 1. Limpa o array de permissões selecionadas
    this.permissionsCheckedsValGet = [];

    // 2. Limpa outras variáveis de controle de ID (se houver)
    this.deleteId = '';

    // 3. Força a desmarcação visual de todos os checkboxes de permissão no HTML
    // Isso garante que mesmo os accordions que estão fechados sejam limpos
    const checkboxes = document.querySelectorAll('input[name="permission"]') as NodeListOf<HTMLInputElement>;
    checkboxes.forEach(cb => cb.checked = false);
  }

  /**
   * Exportação CSV baseada no estado atual de filtros da tela
   */
  csvFileExport() {
    const csvOptions = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: true,
      showTitle: true,
      title: 'Role Data',
      useBom: true,
      noDownload: false,
      headers: ["ID", "Name"]
    };

    const dataToExport = this.searchResults.map(admin => ({
      id: admin.id,
      name: admin.name
    }));

    new ngxCsv(dataToExport, "roles_report", csvOptions);
  }

  get form() {
    return this.roleForm.controls;
  }
}