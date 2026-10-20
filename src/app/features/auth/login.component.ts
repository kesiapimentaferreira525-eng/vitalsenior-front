import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { aplicarErrosNoFormulario, normalizarErro } from '../../core/http/api-error';
import { AlertaComponent } from '../../shared/alerta.component';
import { ErroCampoComponent } from '../../shared/erro-campo.component';
import { IconeComponent } from '../../shared/icone.component';

@Component({
  selector: 'vs-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AlertaComponent, ErroCampoComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <section class="cartao cartao-form" aria-labelledby="titulo-login">
      <h1 id="titulo-login" class="titulo">Entrar</h1>
      <p class="subtitulo">Use o e-mail e a senha que você cadastrou.</p>

      @if (avisoRota(); as aviso) {
        <vs-alerta [tipo]="aviso.tipo">{{ aviso.texto }}</vs-alerta>
      }
      @if (erroGeral()) {
        <vs-alerta tipo="erro" [titulo]="tituloErro()">{{ erroGeral() }}</vs-alerta>
      }

      <form [formGroup]="form" (ngSubmit)="enviar()" novalidate>
        <div class="campo">
          <label for="email">E-mail <span class="obrigatorio">(obrigatório)</span></label>
          <input id="email" type="email" formControlName="email" autocomplete="email" inputmode="email"
            [attr.aria-invalid]="invalido('email')" aria-describedby="email-erro" />
          <vs-erro-campo alvoId="email-erro" [controle]="form.controls.email"
            [mensagens]="{ required: 'Digite seu e-mail.', email: 'Digite um e-mail válido, como maria@exemplo.com.' }" />
        </div>

        <div class="campo">
          <label for="senha">Senha <span class="obrigatorio">(obrigatório)</span></label>
          <div class="campo-senha">
            <input id="senha" [type]="mostrarSenha() ? 'text' : 'password'" formControlName="senha"
              autocomplete="current-password" [attr.aria-invalid]="invalido('senha')" aria-describedby="senha-erro" />
            <button type="button" class="btn btn-fantasma btn-olho" (click)="mostrarSenha.set(!mostrarSenha())"
              [attr.aria-pressed]="mostrarSenha()">
              <vs-icone [nome]="mostrarSenha() ? 'olho-fechado' : 'olho'" />
              {{ mostrarSenha() ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
          <vs-erro-campo alvoId="senha-erro" [controle]="form.controls.senha"
            [mensagens]="{ required: 'Digite sua senha.' }" />
        </div>

        <button type="submit" class="btn btn-primario btn-bloco" [disabled]="enviando()" [attr.aria-busy]="enviando()">
          @if (enviando()) { <span class="girando" aria-hidden="true"></span> Entrando… } @else { Entrar }
        </button>
      </form>

      <p class="rodape-form">
        Ainda não tem conta? <a routerLink="/cadastro">Criar conta</a>
      </p>
    </section>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  /** Query params (?motivo=…&voltar=…) via withComponentInputBinding. */
  readonly motivo = input<string>();
  readonly voltar = input<string>();

  readonly enviando = signal(false);
  readonly erroGeral = signal<string | null>(null);
  readonly tituloErro = signal('Não foi possível entrar');
  readonly mostrarSenha = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: [(history.state?.email as string) ?? '', [Validators.required, Validators.email]],
    senha: ['', [Validators.required]],
  });

  readonly avisoRota = computed<{ tipo: 'info' | 'sucesso' | 'aviso'; texto: string } | null>(() => {
    switch (this.motivo()) {
      case 'sessao-expirada':
        return { tipo: 'aviso', texto: 'Sua sessão terminou. Por segurança, entre novamente.' };
      case 'saiu':
        return { tipo: 'info', texto: 'Você saiu da sua conta com segurança.' };
      case 'cadastro':
        return { tipo: 'sucesso', texto: 'Conta criada! Agora entre com seu e-mail e senha.' };
      default:
        return null;
    }
  });

  invalido(nome: 'email' | 'senha'): boolean {
    const c = this.form.controls[nome];
    return c.invalid && (c.touched || c.dirty);
  }

  enviar(): void {
    if (this.enviando()) return;
    // Normaliza apenas espaços nas pontas, sem alterar o conteúdo.
    this.form.controls.email.setValue(this.form.controls.email.value.trim());
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.focarPrimeiroInvalido();
      return;
    }

    this.erroGeral.set(null);
    this.enviando.set(true);
    this.auth
      .entrar(this.form.getRawValue())
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          const destino = this.voltar();
          this.router.navigateByUrl(destino && destino.startsWith('/app') ? destino : '/app/dashboard');
        },
        error: (e) => {
          const erro = normalizarErro(e);
          if (erro.status === 401) {
            this.tituloErro.set('E-mail ou senha incorretos');
            this.erroGeral.set('Confira os dados e tente novamente.');
          } else {
            this.tituloErro.set('Não foi possível entrar');
            const extras = aplicarErrosNoFormulario(this.form, erro.campos);
            this.erroGeral.set([erro.mensagem, ...extras].join(' '));
          }
        },
      });
  }

  private focarPrimeiroInvalido(): void {
    queueMicrotask(() => (document.querySelector('form input.ng-invalid') as HTMLElement | null)?.focus());
  }
}
