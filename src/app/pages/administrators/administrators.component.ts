import {ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit} from '@angular/core';
import {NgbModal, NgbPagination, NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import {FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { Store } from '@ngrx/store';
import Swal from 'sweetalert2';
import { ngxCsv } from 'ngx-csv/ngx-csv';

import { PaginationService } from 'src/app/core/services/pagination.service';
import { ToastService } from "../../core/services/toast.service";
import { User } from "../../store/User/user.models";
import {TableColumn, TableComponent} from "../../shared/table/table.component";

// Imports das suas Actions e Selectors do escopo de Administrator
import {
  addAdministrator, deleteAdministrator,
  deleteAdministratorSuccess,
  fetchAdministratorListData, resetPasswordAdministrator, updateAdministrator, updateStatusAdministrator
} from '../../store/Administrator/administrator.action';
import { selectAdministratorData, selectAdminLoading } from '../../store/Administrator/administrator.selector';
import {GlobalComponent} from "../../global-component";
import {HasPermissionDirective} from "../../core/directives/has-permission.directive";
import {CustomButtonComponent} from "../../shared/custom-button/custom-button.component";
import {FlatpickrModule} from "angularx-flatpickr";
import {SharedModule} from "../../shared/shared.module";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-administrators',
  templateUrl: './administrators.component.html',
  styleUrls: ['./administrators.component.scss'],
  standalone: true,
  imports: [
    HasPermissionDirective,
    TableComponent,
    NgbTooltip,
    CustomButtonComponent,
    FlatpickrModule,
    FormsModule,
    SharedModule,
    NgbPagination,
    ReactiveFormsModule,
    NgClass
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdministratorsComponent implements OnInit {
  private toastService = inject(ToastService);
  protected service = inject(PaginationService); // Vinculado ao 'service' usado no HTML
  private modalService = inject(NgbModal);
  private formBuilder = inject(UntypedFormBuilder);
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);

  title: string = 'Administrators';
  breadCrumbItems!: Array<{}>;
  submitted = false;
  administratorForm!: UntypedFormGroup;

  // Listas para controle e renderização de dados
  administrators: any[] = [];       // Dados exibidos na página atual da tabela
  administratorList: User[] = [];   // Lista master total vinda da Store
  searchResults: User[] = [];       // Cache usado para buscas, ordenações e filtros
  checkedValGet: any[] = [];       // Itens selecionados via checkbox na tabela

  searchTerm: string = '';
  filterDate: any;
  status: any = '';
  loading: boolean = false;
  idSuperAdmin: string = 'e57aa437-0ccc-4e41-8726-8993b4f82de6';

  deleteId: any;
  econtent?: User;

  adminColumns: TableColumn[] = [
    { key: 'name', label: 'Name', isCombo: true, imageKey: 'avatar', imageAltKey: 'name', imageClass: 'rounded-circle avatar-xs material-shadow', defaultImage: 'assets/images/users/user.png', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'status', label: 'Status', isStatus: true, sortable: true },
    { key: 'actions', label: 'Actions', isAction: true }
  ];

  ngOnInit(): void {
    this.breadCrumbItems = [
      { label: 'Dashboard', link: '/dashboard', active: false },
      { label: 'Administrators', active: true }
    ];

    this.administratorForm = this.formBuilder.group({
      id: [''],
      name: ['', [Validators.required]],
      email: ['', [Validators.required]],
      selectAvatar: ['']
    });

    this.initNgRxStore();
  }

  /**
   * Inicializa e escuta os seletores reativos da Store do NgRx
   */
  initNgRxStore() {
    this.store.select(selectAdminLoading).subscribe(isLoading => this.loading = isLoading);
    this.store.dispatch(fetchAdministratorListData());

    this.store.select(selectAdministratorData).subscribe({
      next: (data: any) => {
        // Descobre se o nó da store veio envelopado ou se é o array direto
        const adminArray = (data && data.data) ? data.data : data;

        // Se adminArray for nulo ou não for array, limpa a tela e para aqui
        if (!Array.isArray(adminArray)) {
          this.clearList();
          return;
        }

        // Se o array existir (mesmo vazio), fazemos o mapeamento para refletir mudanças como o 'status'
        const mappedUsers = adminArray.map((item: any) => ({
          id: item.id,
          name: item.name,
          avatar: item.avatar,
          userName: item.userName,
          email: item.email,
          roleName: item.roleName,
          dbStatus: item.dbStatus, // Agora vai atualizar de 0 para 1 em tempo real
          _status: item._status || item._Status,
          created: item.created,
          isSelected: !!item.isSelected
        }));

        // Atualiza TODAS as referências locais que alimentam a paginação e a tabela
        this.administratorList = mappedUsers;
        this.searchResults = mappedUsers;

        // CORREÇÃO CRUCIAL: Atualiza a lista que a paginação/tabela usa para renderizar as linhas atuais
        this.administrators = [...mappedUsers];

        // Força o método de paginação a recalcular e empurrar o novo status para o HTML
        this.changePage();
      },
      error: (err) => {
        this.toastService.error(err?.message || 'Error loading administrators state.');
      }
    });
  }

// Método auxiliar para manter o código limpo
  private clearList() {
    this.administratorList = [];
    this.searchResults = [];
    this.administrators = [];
    this.changePage();
  }

  /**
   * Recalcula a página atual através do PaginationService do Velzon
   */
  changePage() {
    this.administrators = this.service.changePage(this.searchResults);
  }

  /**
   * Filtro de Pesquisa por Texto (Name/Email) protegido contra valores nulos
   */
  performSearch(): void {
    this.searchResults = this.administratorList.filter((item: User) => {
      const name = item.name?.toLowerCase() || '';
      const email = item.email?.toLowerCase() || '';
      const search = this.searchTerm?.toLowerCase() || '';
      return name.includes(search) || email.includes(search);
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

      this.searchResults = this.administratorList.filter((admin: User) => {
        if (!admin.created) return false;
        const adminDate = new Date(admin.created);
        return adminDate >= startDate && adminDate <= endDate;
      });
    } else {
      this.searchResults = this.administratorList;
    }
    this.changePage();
  }

  /**
   * Filtro de Status (Active/Inactive)
   */
  statusFilter() {
    if (this.status !== '') {
      this.searchResults = this.administratorList.filter((admin: User) => admin.status == this.status);
    } else {
      this.searchResults = this.administratorList;
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
    this.administratorForm.reset();
    this.modalService.open(content, { size: 'xl', centered: true });
  }

  // Crie uma propriedade na classe para guardar o arquivo que vai para o .NET
  fileToUpload: File | null = null;
  imageURL: string | undefined = '/assets/images/users/user.png';
  onChangeSelecAvatar(event: any) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file: File = input.files[0];
      this.fileToUpload = file; // <-- Guarda o arquivo bruto aqui para usar no submit

      const reader = new FileReader();
      reader.onload = () => {
        this.imageURL = reader.result as string;

        // Atualiza o preview de forma segura
        const preview = document.getElementById('preview-image') as HTMLImageElement;
        if (preview) {
          preview.src = this.imageURL;
        }

        // CORREÇÃO: Em vez de passar o 'file' inteiro para o control que está amarrado no HTML,
        // você pode passar apenas o nome do arquivo (string) ou simplesmente NÃO usar formControlName no input de arquivo.
        this.administratorForm.get('selectAvatar')?.setValue(this.fileToUpload, { emitEvent: false });
      };
      reader.readAsDataURL(file);
    }
  }

  editDataGet(entity: any, content: any) {
    this.submitted = false;
    this.modalService.open(content, { size: 'xl', centered: true });

    // Modifica os títulos do modal injetado de forma segura
    setTimeout(() => {
      const modelTitle = document.querySelector('.modal-title') as HTMLElement;
      if (modelTitle) modelTitle.innerHTML = 'Edit Admin';
      const updateBtn = document.getElementById('add-btn') as HTMLElement;
      if (updateBtn) updateBtn.innerHTML = "Update";
    }, 50);

    this.administratorForm.patchValue({
      name: entity?.name,
      email: entity?.email,
      id: entity?.id
    });
    this.imageURL = entity?.avatar != null ? `${GlobalComponent.API_URL}/${entity?.avatar}` : '/assets/images/users/user.png';
  }

  saveUser() {
    this.submitted = true;
    this.loading = true;

    if (this.administratorForm.valid) {
      const data = this.administratorForm.value;

      let formData = new FormData();
      formData.append('id', data.id);
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('selectAvatar', data.selectAvatar);

      if (data.id) {
        // console.log('Disparar Action de UPDATE para a Store:', formData);
        this.store.dispatch(updateAdministrator({ id: data.id, updatedData: formData }));
      } else {
        // console.log('Disparar Action de ADD para a Store:', formData);
        this.store.dispatch(addAdministrator({ newData: formData }));
      }

      this.modalService.dismissAll();
      this.administratorForm.reset();
      this.submitted = false;
      let isUpdate = data.id ? 'updated' : 'registered';
      this.toastService.success(`Administrator successfully ${isUpdate}`);
      this.loading = false;
    }
  }

  resetPassword(entity: any) {
    this.store.dispatch(resetPasswordAdministrator({ userId: entity.id }));
    this.toastService.success(`The new password has been sent to the email address: ${entity.email}.`);
  }

  /**
   * Captura a emissão de checkboxes marcados vindos de dentro da tabela genérica
   */
  onTableSelectionChange(selectedItems: any[]) {
    // Atualiza a variável forçando uma nova referência
    this.checkedValGet = [...selectedItems];
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
      // Deleção única
      idsToDelete = this.deleteId.toString();
    } else {
      // Deleção em lote (Baseado no JSON que você postou no log)
      idsToDelete = this.checkedValGet
          .filter((item): item is { id: string } => !!(item && item.id)) // Garante que o objeto e o id existem
          .map(item => item.id); // Extrai o GUID string do objeto
    }

    // Verificação robusta que aceita string direta ou array preenchido
    const hasItems = Array.isArray(idsToDelete) ? idsToDelete.length > 0 : !!idsToDelete;

    if (hasItems) {
      // Dispara para o Effect que gerencia o forkJoin para o .NET Core 10
      this.store.dispatch(deleteAdministrator({ id: idsToDelete }));

      // Fecha o modal de confirmação e limpa o estado do componente pai
      this.modalService.dismissAll();
      this.toastService.success('Record(s) deleted successfully');

      this.checkedValGet = [];
      this.deleteId = '';
    }
  }

  onStatusChanged(updatedAdmin: User) {
    if (updatedAdmin && updatedAdmin.id) {
      this.store.dispatch(updateStatusAdministrator({ userId: updatedAdmin.id }));
      this.toastService.success(`Status successfully updated!`);
    } else {
      this.toastService.error('Unable to update the status: Invalid administrator ID.');
    }

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
      title: 'Administrator Data',
      useBom: true,
      noDownload: false,
      headers: ["ID", "Name", "Username", "Email", "Role", "Status"]
    };

    const dataToExport = this.searchResults.map(admin => ({
      id: admin.id,
      name: admin.name,
      userName: admin.userName,
      email: admin.email,
      roleName: admin.roleName,
      status: admin._status
    }));

    new ngxCsv(dataToExport, "administrators_report", csvOptions);
  }

  get form() {
    return this.administratorForm.controls;
  }
}