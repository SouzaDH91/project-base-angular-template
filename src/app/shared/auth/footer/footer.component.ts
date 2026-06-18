import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink} from "@angular/router";
import {GlobalComponent} from "../../../global-component";

@Component({
    selector: 'app-auth-footer',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <!-- footer -->
        <footer class="footer">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12">
                        <div class="text-center">
                            <p class="mb-0 text-muted">&copy; {{year}} {{ appName }}. Crafted with <i class="mdi mdi-heart text-danger"></i> by {{developedBy}}</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
        <!-- end Footer -->
  `
})
export class AuthFooterComponent {
    appName: string = GlobalComponent.appName;
    developedBy: string = GlobalComponent.developedBy;
    year: number = new Date().getFullYear();

    constructor() {}
}