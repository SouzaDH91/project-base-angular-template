import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import {AuthenticationService} from "../../core/services/auth.service";
import {Router} from "@angular/router";
import {GlobalComponent} from "../../global-component";

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    standalone: false
})

/**
 * Pass-Reset Forgot Password Component
 */
export class ForgotPasswordComponent implements OnInit {
    appName: string = GlobalComponent.appName;

  // Login Form
  passresetForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = '';
  returnUrl!: string;

  constructor(private formBuilder: UntypedFormBuilder, private authenticationService: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
    /**
     * Form Validatyion
     */
     this.passresetForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  // convenience getter for easy access to form fields
  get f() { return this.passresetForm.controls; }

  /**
   * Form submit
   */
   onSubmit() {
    this.submitted = true;

    // stop here if form is invalid
    if (this.passresetForm.invalid) {
      return;
    } else {
        this.authenticationService.forgotPassword(this.f['email'].value).subscribe((data:any) => {
            //console.log('xxx ', data);
            this.router.navigate(['/auth/verify-code/email', this.f['email'].value]);
        });
    }
  }

}
