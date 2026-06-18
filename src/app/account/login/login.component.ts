import {Component, inject, OnInit} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Login Auth
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../core/services/auth.service';
import { AuthfakeauthenticationService } from '../../core/services/authfake.service';
import { Store } from '@ngrx/store';
import {GlobalComponent} from "../../global-component";
import {Authentication} from "../../store/Authentication/auth.models";
import {ToastService} from "../../core/services/toast.service";
import {loadUserPermissions} from "../../store/Permission/permission.action";

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})

/**
 * Login Component
 */
export class LoginComponent implements OnInit {

    private toastService = inject(ToastService);

  appName: string = GlobalComponent.appName;
  developedBy: string = GlobalComponent.developedBy;

  // Login Form
  loginForm!: UntypedFormGroup;
  submitted = false;
  fieldTextType!: boolean;
  error = '';
  returnUrl!: string;
  loading: boolean = false;

  toast!: false;

  // set the current year
  year: number = new Date().getFullYear();

  constructor(private formBuilder: UntypedFormBuilder,private authenticationService: AuthenticationService,private router: Router,
    private authFackservice: AuthfakeauthenticationService, private route: ActivatedRoute, private store: Store) {
      // redirect to home if already logged in
      if (this.authenticationService.currentUserValue) {
        this.router.navigate(['']);
      }
     }

  ngOnInit(): void {
    if(sessionStorage.getItem('currentUser')) {
      this.router.navigate(['']);
    }
    /**
     * Form Validatyion
     */
     this.loginForm = this.formBuilder.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
    // get return url from route parameters or default to '/'
    // this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  /**
   * Form submit
   */
   onSubmit() {
    this.submitted = true;
    this.loading = true;

     // Login Api
     // this.store.dispatch(login({ email: this.f['email'].value, password: this.f['password'].value }));
      this.authenticationService.login(this.f['userName'].value, this.f['password'].value).subscribe({
          next: (data: any) => {
              // Entra aqui se o backend retornar o Ok(...) - HTTP 200
              if (data.success) {
                  // 1. Criamos o objeto exatamente no formato que a classe User do Angular espera
                  const userLogado: Authentication = {
                      id: data.data.user.id,
                      userName: data.data.user.userName,
                      name: data.data.user.name,
                      avatar: data.data.user.avatar,
                      email: data.data.user.email,
                      roleName: data.data.user.roleName,
                      token: data.data.token?.accessToken // <-- Extraímos a string do token direto para cá!
                  };

                  // 2. Salvamos no sessionStorage
                  sessionStorage.setItem('toast', 'true');
                  sessionStorage.setItem('currentUser', JSON.stringify(userLogado));
                  if (userLogado.token != null) {
                      sessionStorage.setItem('token', userLogado.token);
                  } // Mantém a string pura aqui também

                  // 3. Atualizamos o BehaviorSubject do Service (conforme ajustamos no passo anterior)
                  this.authenticationService.setcurrentUserValue(userLogado);

                  this.store.dispatch(loadUserPermissions());

                  this.loading = false;
                  this.router.navigate(['']); // Redireciona para a Home
              }
          },
          error: (err: any) => {
              // Entra aqui se o backend retornar o BadRequest(...) - HTTP 400
              this.loading = false;

              //console.log('Erro recebido na Controller:', err);

              let mensagemErro = 'Ocorreu um erro ao fazer login.';

              // Verificamos se o array 'errors' enviado pelo .NET existe
              if (err && err.errors && err.errors.length > 0) {
                  mensagemErro = err.errors[0]; // Pega a primeira mensagem: "Incorrect username or password!"
              } else if (err && err.message) {
                  mensagemErro = err.message;
              }

              // Exibe o Toast com a mensagem real
              this.toastService.show(mensagemErro, { classname: 'bg-danger text-white', delay: 5000 });
          }
      });
  }

  /**
   * Password Hide/Show
   */
   toggleFieldTextType() {
    this.fieldTextType = !this.fieldTextType;
  }

}
