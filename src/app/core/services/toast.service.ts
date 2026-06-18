/*
import { Injectable, TemplateRef } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: any[] = [];

  show(textOrTpl: string | TemplateRef<any>, options: any = {}) {
    this.toasts.push({ textOrTpl, ...options });
  }

  remove(toast: any) {
    this.toasts = this.toasts.filter(t => t !== toast);
  }
}*/

import { Injectable, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: any[] = [];

  show(text: string, options: any = {}) {
    this.toasts.push({ text, ...options });

    // Cria o elemento HTML do Toast dinamicamente no body do sistema
    this.renderToast(text, options.classname || 'bg-success text-white', options.delay || 5000);
  }

  // Atalhos diretos para você usar nas controllers
  success(message: string) {
    this.show(message, { classname: 'bg-success text-white', delay: 5000 });
  }

  error(message: string) {
    this.show(message, { classname: 'bg-danger text-white', delay: 5000 });
  }

  private renderToast(message: string, className: string, delay: number) {
    // 1. Cria a estrutura do Toast idêntica à do Bootstrap do Velzon
    const containerId = 'global-toast-container';
    let container = document.getElementById(containerId);

    if (!container) {
      container = document.createElement('div');
      container.id = containerId;
      container.className = 'toast-container position-fixed top-0 end-0 p-3';
      container.style.zIndex = '2000'; // Fica por cima de absolutamente tudo
      document.body.appendChild(container);
    }

    const toastElement = document.createElement('div');
    toastElement.className = `toast show align-items-center ${className} border-0`;
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');

    toastElement.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    container.appendChild(toastElement);

    // Fecha o botão manualmente se o usuário clicar no 'X'
    const closeBtn = toastElement.querySelector('.btn-close');
    closeBtn?.addEventListener('click', () => toastElement.remove());

    // Remove o toast sozinho após o tempo do delay
    setTimeout(() => {
      if (toastElement.parentNode) {
        toastElement.remove();
      }
    }, delay);
  }
}