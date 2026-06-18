import { Component, Input, TemplateRef, Output, EventEmitter } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import {GlobalComponent} from "../../global-component";

export interface TableColumn {
    key: string;
    label: string;
    isAction?: boolean;
    isStatus?: boolean;
    isCombo?: boolean;
    imageKey?: string;
    imageAltKey?: string;
    imageClass?: string;
    defaultImage?: string;
    sortable?: boolean;
}

@Component({
    selector: 'app-table',
    styleUrls: ['./table.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <div class="table-responsive table-card mb-1">
            <table class="table">
                <thead class="table-light text-muted">
                <tr>
                    @if (hasCheckbox) {
                        <th scope="col" style="width: 50px;">
                            <div class="form-check">
                                <input
                                        class="form-check-input"
                                        type="checkbox"
                                        id="checkAll"
                                        [(ngModel)]="masterSelected"
                                        (change)="checkUncheckAll()">
                            </div>
                        </th>
                    }

                    @for (column of columns; track column.key) {
                        <th
                                scope="col"
                                [class.sort]="column.sortable"
                                [style.cursor]="column.sortable ? 'pointer' : 'default'"
                                (click)="column.sortable ? onSort(column.key) : null"
                        >
                            {{ column.label }}

                            @if (column.sortable) {
                                <i class="ri-arrow-up-down-line align-middle ms-1 opacity-50"></i>
                            }
                        </th>
                    }
                </tr>
                </thead>
                <tbody>
                    @for (row of data; track row.id; let rowIndex = $index) {
                        <tr id="c_{{row.id}}">
                            @if (hasCheckbox) {
                                <th scope="row">
                                    @if (!isRowDisabled(row.id)) {
                                        <div class="form-check">
                                            <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    name="checkAll"
                                                    [value]="row.id"
                                                    [(ngModel)]="row.isSelected"
                                                    (change)="onCheckboxChange()">
                                        </div>
                                    }
                                </th>
                            }

                            @for (column of columns; track column.key) {
                                <td>
                                    @if (column.isAction) {
                                        @if (actionTemplate) {
                                            <ng-container *ngTemplateOutlet="actionTemplate; context: { $implicit: row, index: rowIndex }"></ng-container>
                                        }
                                    }
                                    @else if (column.isCombo) {
                                        <div class="d-flex align-items-center">
                                            <div class="border-circle me-2">
                                                <img 
                                                        [src]="getImage(row, column)"
                                                        [alt]="getAltText(row, column)"
                                                        [ngClass]="column.imageClass || 'rounded-circle avatar-xs material-shadow'">
                                            </div>
                                            <div class="flex-grow-1">
                                                {{ row[column.key] }}
                                            </div>
                                        </div>
                                    }
                                    @else if (column.isStatus || column.key === 'status') {
                                        <div class="form-check form-switch">
                                            <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    role="switch"
                                                    id="status{{row.id}}"
                                                    [checked]="row.dbStatus == 0"
                                                    [disabled]="isRowDisabled(row.id)"
                                                    (change)="$event.preventDefault(); onStatusToggle(row)" />
                                            <label class="form-check-label ms-2" for="status{{row.id}}">
                                                {{ row.dbStatus == 0 ? 'Active' : 'Inactive' }}
                                            </label>
                                        </div>
                                    } @else {
                                        {{ row[column.key] }}
                                    }
                                </td>
                            }
                        </tr>
                    }
                    @empty {
                        <tr>
                            <td [attr.colspan]="hasCheckbox ? columns.length + 1 : columns.length" class="text-center py-4 text-muted">
                                Data not found.
                            </td>
                        </tr>
                    }
                </tbody>
            </table>
        </div>`
})
export class TableComponent {
    @Input() columns: TableColumn[] = [];
    @Input() data: any[] = [];
    @Input() actionTemplate?: TemplateRef<any>;
    @Input() hasCheckbox: boolean = false;

    @Input() disabledIds: any[] = [];

    @Output() selectedItemsChange = new EventEmitter<any[]>();
    @Output() sortAction = new EventEmitter<string>(); // Emitir evento de ordenação para o pai
    @Output() statusChange = new EventEmitter<any>();

    masterSelected: boolean = false;
    apiUrl: string = GlobalComponent.API_URL;

    getAltText(row: any, column?: TableColumn): string {
        if (row && column && column.imageAltKey) {
            const altKey = String(column.imageAltKey);
            return row[altKey] || '';
        }
        return '';
    }

    isRowDisabled(id: any): boolean {
        if (!id || !this.disabledIds) return false;
        return this.disabledIds.includes(id);
    }

    // 1. Marca ou desmarca todos os itens, mas IGNORA quem estiver desativado (ex: Super Admin)
    checkUncheckAll() {
        this.data.forEach(item => {
            if (!this.isRowDisabled(item.id)) {
                item.isSelected = this.masterSelected;
            } else {
                item.isSelected = false; // Garante que o Super Admin nunca fique marcado
            }
        });
        this.emitSelected();
    }

    // 2. Controla o estado do mestre baseado apenas nas linhas que são modificáveis
    onCheckboxChange() {
        // Filtra apenas as linhas que o usuário realmente consegue interagir
        const interactableRows = this.data.filter(item => !this.isRowDisabled(item.id));

        // O mestre só fica true se TODAS as linhas interatíveis estiverem marcadas
        this.masterSelected = interactableRows.length > 0 &&
            interactableRows.every(item => item.isSelected);

        this.emitSelected();
    }

    // 3. Filtra quem está ativo e notifica a controller principal
    private emitSelected() {
        const selected = this.data.filter(item => item.isSelected);

        // CORREÇÃO: Emitimos uma cópia rasa [...selected] para renovar a referência do array no Pai
        this.selectedItemsChange.emit([...selected]);
    }

    // 4. Repassa o gatilho de ordenação de volta para a sua página principal gerenciar o estado
    onSort(columnKey: string) {
        this.sortAction.emit(columnKey);
    }

    onStatusToggle(row: any) {
        this.statusChange.emit(row);
    }

    getImage(row: any, column: TableColumn): string {
        if (!column || !column.imageKey || !row) {
            return 'assets/images/users/user-dummy-img.jpg';
        }

        const imageKey = column.imageKey;
        const key = String(imageKey);

        // 1. Se o objeto tiver uma foto válida na chave informada, usa ela
        if (row[key] != null && row[key] !== '') {
            return `${this.apiUrl}${row[key]}`;
        }

        // 2. Se não tiver foto, mas a coluna configurou uma imagem padrão customizada, usa ela
        if (column.defaultImage) {
            return column.defaultImage;
        }

        // 3. Rota de fuga: Imagem genérica padrão se ninguém informar nada
        return '';
    }
}