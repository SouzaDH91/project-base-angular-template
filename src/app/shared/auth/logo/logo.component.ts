import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from "@angular/router";
import {GlobalComponent} from "../../../global-component";

@Component({
    selector: 'app-auth-logo',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <div class="row">
            <div class="col-lg-12">
                <div class="text-center mt-sm-5 mb-4 text-white-50">
                    <div>
                        <a routerLink="/auth/login" class="d-inline-block auth-logo">
                            <img src="assets/images/logo-light.png" alt="{{appName}} logo" height="37" />
                        </a>
                    </div>
                    <!--<p class="mt-3 fs-15 fw-medium">Premium Admin & Dashboard Template</p>-->
                </div>
            </div>
        </div>
        <!-- end row -->
  `
})
export class AuthLogoComponent {
    appName: string = GlobalComponent.appName;

    constructor() {}
}