import { Directive, Input, TemplateRef, ViewContainerRef, inject, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { selectUserPermissions } from '../../store/Permission/permission.selector'; // Ajuste o caminho do seu seletor

@Directive({
  selector: '[appHasPermission]',
  standalone: true // Padrão nativo do Angular 19
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  // Injeções modernas via função inject() do Angular 19
  private templateRef = inject(TemplateRef<any>);
  private viewContainer = inject(ViewContainerRef);
  private store = inject(Store);

  // Controle para evitar memory leak na inscrição do NgRx
  private destroy$ = new Subject<void>();

  // Estados locais da diretiva
  private myPermissions: string[] = [];
  private requiredPermissions: string[] = [];
  private hasView = false;

  // Intercepta a propriedade de entrada [appHasPermission]="item.claim"
  @Input() set appHasPermission(val: string | string[] | undefined) {
    if (!val) {
      this.requiredPermissions = [];
    } else {
      this.requiredPermissions = Array.isArray(val) ? val : [val];
    }
    // Removemos o updateView daqui de dentro
  }

  ngOnInit() {
    // 2. O updateView DEVE ser controlado exclusivamente pelo fluxo reativo do NgRx
    this.store.select(selectUserPermissions)
        .pipe(takeUntil(this.destroy$))
        .subscribe(permissions => {
          // Se a store retornar null/undefined enquanto carrega, tratamos como array vazio provisório
          this.myPermissions = permissions || [];
          this.updateView(); // Força o Angular a recalcular e desenhar o menu assim que o C# responder!
        });
  }

  private updateView() {
    // Regra 1: Se a rota/menu for pública, renderiza direto se já não estiver na tela
    if (this.requiredPermissions.length === 0) {
      this.renderElement();
      return;
    }

    // Regra 2: Verifica se o usuário tem PELO MENOS UMA das permissões exigidas
    const hasAccess = this.requiredPermissions.some(p => this.myPermissions.includes(p));

    if (hasAccess) {
      this.renderElement();
    } else {
      this.clearElement();
    }
  }

  private renderElement() {
    if (!this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    }
  }

  private clearElement() {
    this.viewContainer.clear();
    this.hasView = false;
  }

  ngOnDestroy() {
    // Dispara a limpeza ao destruir o componente da Sidebar
    this.destroy$.next();
    this.destroy$.complete();
  }
}