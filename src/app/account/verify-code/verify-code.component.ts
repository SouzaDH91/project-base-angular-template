import {Component, signal, computed, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import {AuthenticationService} from "../../core/services/auth.service";

@Component({
    selector: 'app-verify-code',
    templateUrl: './verify-code.component.html',
    styleUrls: ['./verify-code.component.scss'],
    standalone: false
})

/**
 * Two Step Basic Component
 */
export class VerifyCodeComponent implements OnInit, OnDestroy {

  email: string | null = null;
  codeForm!: UntypedFormGroup;
  submitted = false;
  disableResendCode: boolean = true;
  timeLeft = signal(60);
  intervalId: any;

  constructor(private route: ActivatedRoute, private formBuilder: UntypedFormBuilder, private authenticationService: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
      this.email = this.route.snapshot.paramMap.get('email');

      /**
       * Form Validatyion
       */
      this.codeForm = this.formBuilder.group({
          code: ['', [Validators.required]],
      });

      this.startTimer();
  }

    // convenience getter for easy access to form fields
    get f() { return this.codeForm.controls; }

    onOtpChange(otp: string) {
        this.codeForm.patchValue({
            code: otp
        });
    }

    onSubmit() {
        this.submitted = true;

        // stop here if form is invalid
        if (this.codeForm.invalid) {
            return;
        } else {
            this.authenticationService.verifyCode(this.email, this.f['code'].value).subscribe((data:any) => {
                //console.log('xxx ', data);
                this.resetPassword(this.f['code'].value, this.email);
            });
        }
    }

    resetPassword(code: string, email: string | null) {
        this.authenticationService.resetPassword(code, email).subscribe((data:any) => {
            //console.log('xxx ', data);
            this.router.navigate(['/auth/reset-success']);
        });
    }

    displayTime = computed(() => {
        const minutes = Math.floor(this.timeLeft() / 60);
        const seconds = this.timeLeft() % 60;

        // O padStart(2, '0') garante que sempre tenha 2 dígitos (ex: 09 em vez de 9)
        const m = String(minutes).padStart(2, '0');
        const s = String(seconds).padStart(2, '0');

        return `${m}:${s}`;
    });

    startTimer() {
        if (this.intervalId) return;

        this.intervalId = setInterval(() => {
            if (this.timeLeft() > 0) {
                this.timeLeft.update(v => v - 1);
            } else {
                this.stopTimer();
                this.disableResendCode = false;
            }
        }, 1000);
    }

    stopTimer() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    resetTimer() {
        this.timeLeft.set(60);
        this.startTimer();
        this.disableResendCode = true;
        this.resendCode();
    }

    // Boa prática: limpar o intervalo se o componente for destruído
    ngOnDestroy() {
        this.stopTimer();
    }

    /**
     * Resend code
     */
    resendCode() {
        this.authenticationService.resendCode(this.email).subscribe();
    }

   /**
   * Confirm Otp Verification
   */
    config = {
      allowNumbersOnly: true,
      length: 6,
      isPasswordInput: false,
      disableAutoFocus: false,
      placeholder: '',
      inputStyles: {
        'width': '58px',
        'height': '50px'
      }
    };

}
