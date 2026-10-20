import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { aplicarErrosNoFormulario, normalizarErro } from '../../core/http/api-error';
import { Perfil } from '../../core/models/api.models';
import { PERFIL_OPCOES } from '../../core/models/labels';
import { AlertaComponent } from '../../shared/alerta.component';
import { ErroCampoComponent } from '../../shared/erro-campo.component';
import { IconeComponent } from '../../shared/icone.component';

type CampoCadastro = 'nome' | 'email' | 'senha' | 'perfil' | 'emailCuidador';

@Component({
  selector: 'vs-cadastro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AlertaComponent, ErroCampoComponent, IconeComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <section class="cartao cartao-form" aria-labelledby="titulo-cadastro">
      <h1 id="titulo-cadastro" class="titulo">Criar conta</h1>
      <p class="subtitulo">Leva só um minuto. Campos marcados como obrigatórios precisam ser preenchidos.</p>

      @if (erroGeral()) {
        <vs-alerta tipo="erro" titulo="Não foi possível criar a conta">{{ erroGeral() }}</vs-alerta>
      }

      <form [formGroup]="form" (ngSubmit)="enviar()" novalidate>
        <div class="campo">
          <label for="nome">Nome completo <span class="obrigatorio">(obrigatório)</span></label>
          <input id="nome" type="text" formControlName="nome" autocomplete="name" maxlength="120"
            [attr.aria-invalid]="invalido('nome')" aria-describedby="nome-ajuda nome-erro" />
          <p id="nome-ajuda" class="campo-ajuda">{{ form.controls.nome.value.length }} de 120 caracteres</p>
          <vs-erro-campo alvoId="nome-erro" [controle]="form.controls.nome"
            [mensagens]="{ required: 'Digite seu nome.', maxlength: 'Use no máximo 120 caracteres.' }" />
        </div>

        <div class="campo">
          <label for="email">E-mail <span class="obrigatorio">(obrigatório)</span></label>
          <input id="email" type="email" formControlName="email" autocomplete="email" inputmode="email"
            [attr.aria-invalid]="invalido('email')" aria-describedby="email-erro" />
          <vs-erro-campo alvoId="email-erro" [controle]="form.controls.email"
            [mensagens]="{ required: 'Digite seu e-mail.', email: 'Digite um e-mail válido, como maria@exemplo.com.' }" />
        </div>

        <div class="campo">
          <label for="senha">Senha <span class="obrigatorio">(obrigatório)</span></label>
          <p id="senha-ajuda" class="campo-ajuda">Use pelo menos 6 caracteres.</p>
          <div class="campo-senha">
            <input id="senha" [type]="mostrarSenha() ? 'text' : 'password'" formControlName="senha"
              autocomplete="new-password" [attr.aria-invalid]="invalido('senha')"
              aria-describedby="senha-ajuda senha-erro" />
            <button type="button" class="btn btn-fantasma btn-olho" (click)="mostrarSenha.set(!mostrarSenha())"
              [attr.aria-pressed]="mostrarSenha()">
              <vs-icone [nome]="mostrarSenha() ? 'olho-fechado' : 'olho'" />
              {{ mostrarSenha() ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
          <vs-erro-campo alvoId="senha-erro" [controle]="form.controls.senha"
            [mensagens]="{ required: 'Crie uma senha.', minlength: 'A senha precisa ter pelo menos 6 caracteres.' }" />
        </div>

        <fieldset class="campo grupo-opcoes" aria-describedby="perfil-erro">
          <legend>Como você vai usar o VitalSênior? <span class="obrigatorio">(obrigatório)</span></legend>
          @for (opcao of perfis; track opcao.valor) {
            <label class="opcao" [class.selecionada]="form.controls.perfil.value === opcao.valor">
              <input type="radio" formControlName="perfil" [value]="opcao.valor" />
              <span>
                <strong>{{ opcao.rotulo }}</strong>
                <span class="opcao-descricao">{{ opcao.descricao }}</span>
              </span>
            </label>
          }
          <vs-erro-campo alvoId="perfil-erro" [controle]="form.controls.perfil"
            [mensagens]="{ required: 'Escolha uma opção.' }" />
        </fieldset>

        <div class="campo">
          <label for="emailCuidador">E-mail do cuidador <span class="opcional">(opcional)</span></label>
          <p id="cuidador-ajuda" class="campo-ajuda">
            Se uma medição ficar crítica, essa pessoa recebe um aviso por e-mail.
          </p>
          <input id="emailCuidador" type="email" formControlName="emailCuidador" autocomplete="off" inputmode="email"
            [attr.aria-invalid]="invalido('emailCuidador')" aria-describedby="cuidador-ajuda cuidador-erro" />
          <vs-erro-campo alvoId="cuidador-erro" [controle]="form.controls.emailCuidador"
            [mensagens]="{ email: 'Digite um e-mail válido ou deixe em branco.' }" />
        </div>

        <button type="submit" class="btn btn-primario btn-bloco" [disabled]="enviando()" [attr.aria-busy]="enviando()">
          @if (enviando()) { <span class="girando" aria-hidden="true"></span> Criando conta… } @else { Criar conta }
        </button>
      </form>

      <p class="rodape-form">Já tem conta? <a routerLink="/login">Entrar</a></p>
    </section>
  `,
})
export class CadastroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly perfis = PERFIL_OPCOES;
  readonly enviando = signal(false);
  readonly erroGeral = signal<string | null>(null);
  readonly mostrarSenha = signal(false);

  readonly form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
    perfil: ['' as Perfil | '', [Validators.required]],
    emailCuidador: ['', [Validators.email]],
  });

  invalido(nome: CampoCadastro): boolean {
    const c = this.form.controls[nome];
    return c.invalid && (c.touched || c.dirty);
  }

  enviar(): void {
    if (this.enviando()) return;
    const c = this.form.controls;
    c.email.setValue(c.email.value.trim());
    c.emailCuidador.setValue(c.emailCuidador.value.trim());
    if (/^\s+$/.test(c.nome.value)) c.nome.setValue('');

    this.form.markAllAsTouched();
    if (this.form.invalid) {
      queueMicrotask(() => (document.querySelector('form input.ng-invalid') as HTMLElement | null)?.focus());
      return;
    }

    const v = this.form.getRawValue();
    this.erroGeral.set(null);
    this.enviando.set(true);
    this.auth
      .cadastrar({
        nome: v.nome.trim(),
        email: v.email,
        senha: v.senha,
        perfil: v.perfil as Perfil,
        emailCuidador: v.emailCuidador || null,
      })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          // Não guardamos a senha: a pessoa entra em seguida pela tela de login.
          this.router.navigate(['/login'], { queryParams: { motivo: 'cadastro' }, state: { email: v.email } });
        },
        error: (e) => {
          const erro = normalizarErro(e);
          const extras = aplicarErrosNoFormulario(this.form, erro.campos);
          this.erroGeral.set([erro.mensagem, ...extras].join(' '));
        },
      });
  }
}
