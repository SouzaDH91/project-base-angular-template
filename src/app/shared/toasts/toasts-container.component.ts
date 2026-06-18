/*
import {Component, inject, TemplateRef} from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
import { NgbToast } from "@ng-bootstrap/ng-bootstrap";
import { NgTemplateOutlet } from "@angular/common";

@Component({
    selector: 'app-toasts',
    standalone: true,
    imports: [
        NgbToast,
        NgTemplateOutlet
    ],
    host: {
        'class': 'toast-container position-fixed top-0 end-0 p-3',
        'style': 'z-index: 1200'
    },
    template: `
        @for (toast of toastService.toasts; track $index) {
            <ngb-toast
                [class]="toast.classname"
                [autohide]="true"
                [delay]="toast.delay || 5000"
                (hidden)="toastService.remove(toast)"
            >
                @if (isTemplate(toast)) {
                    <ng-container *ngTemplateOutlet="toast.textOrTpl"></ng-container>
                } @else {
                    {{ toast.textOrTpl }}
                }
            </ngb-toast>
        }
    `
})
export class ToastsContainer {
    public toastService = inject(ToastService);

    isTemplate(toast: any): boolean {
        return toast.textOrTpl instanceof TemplateRef;
    }
}*/
