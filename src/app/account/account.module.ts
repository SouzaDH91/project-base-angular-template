import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

// Load Icons
import { defineElement } from "@lordicon/element";
import lottie from 'lottie-web';

import { AccountRoutingModule } from './account-routing.module';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from "./forgot-password/forgot-password.component";
import { VerifyCodeComponent } from "./verify-code/verify-code.component";
import {NgOtpInputModule} from "ng-otp-input";
import {ResetSuccessComponent} from "./reset-success/reset-success.component";
import {AuthLogoComponent} from "../shared/auth/logo/logo.component";
import {AuthFooterComponent} from "../shared/auth/footer/footer.component";

@NgModule({
  declarations: [
    RegisterComponent,
    LoginComponent,
    ForgotPasswordComponent,
    VerifyCodeComponent,
    ResetSuccessComponent
  ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        NgbToastModule,
        AccountRoutingModule,
        NgOtpInputModule,
        NgOptimizedImage,
        AuthLogoComponent,
        AuthFooterComponent
    ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AccountModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
