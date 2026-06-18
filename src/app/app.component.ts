import {Component, inject, OnInit} from '@angular/core';
import {RouterOutlet} from "@angular/router";
import {Store} from "@ngrx/store";
import {loadUserPermissions} from "./store/Permission/permission.action";
import {GlobalComponent} from "./global-component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit {
  title = GlobalComponent.appName;

    private store = inject(Store);

    ngOnInit() {
        // Dispara a busca assim que a aplicação ou o layout principal inicializa
        this.store.dispatch(loadUserPermissions());
    }
}
