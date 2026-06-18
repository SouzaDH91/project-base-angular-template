import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-custom-button',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button 
      [type]="type" 
      [className]="'btn ' + btnClass" 
      [disabled]="disabled"
      [attr.data-bs-toggle]="dataBsToggle"
      [attr.data-bs-target]="dataBsTarget"
      [attr.data-bs-dismiss]="dataBsDismiss"
      [attr.id]="attrId ? attrId : null"
      (click)="onBtnClick($event)">
      
      @if (iconClass) {
        <i [className]="iconClass + (text ? ' me-1' : '')"></i>
      }
      
      @if (text) {
        <span>{{ text }}</span>
      }
    </button>
  `
})
export class CustomButtonComponent {
    @Input() text: string = '';                          // Texto do botão
    @Input() btnClass: string = 'btn-primary';           // Classes do Velzon (ex: 'btn-success', 'btn-danger w-100')
    @Input() iconClass?: string;
    @Input() type: 'button' | 'submit' | 'reset' = 'button'; // Tipo nativo do botão
    @Input() disabled: boolean = false;                  // Estado de desabilitado

    @Input() attrId?: string;
    @Input() dataBsToggle?: string;
    @Input() dataBsTarget?: string;
    @Input() dataBsDismiss?: string;

    @Output() btnClick = new EventEmitter<MouseEvent>(); // Emissor do evento de clique

    onBtnClick(event: MouseEvent) {
        // Se não houver nada escutando o evento de clique (ou se estiver disabled), o botão não faz nada
        if (!this.disabled && this.btnClick.observed) {
            this.btnClick.emit(event);
        }
    }
}