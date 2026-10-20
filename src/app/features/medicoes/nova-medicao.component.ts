import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LowerCasePipe } from '@angular/common';
import { finalize } from 'rxjs';

import { aplicarErrosNoFormulario, normalizarErro } from '../../core/http/api-error';
import { Medicao, TurnoMedicao } from '../../core/models/api.models';
import { MedicoesService } from '../../core/services/medicoes.service';
import { AlertaComponent } from '../../shared/alerta.component';
import { ErroCampoComponent } from '../../shared/erro-campo.component';
import { IconeComponent } from '../../shared/icone.component';
import { DataHoraPipe, NumeroPipe, TurnoPipe } from '../../shared/pipes';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

function inteiro(c: AbstractControl): ValidationErrors | null {
  const v = c.value;
  if (v === null || v === '' || v === undefined) return null;
  return Number.isInteger(Number(v)) ? null : { inteiro: true };
}

type CampoMedicao = 'glicose' | 'pressaoSistolica' | 'pressaoDiastolica' | 'turno';

@Component({
  selector: 'vs-nova-medicao',
  standalone: true,
  imports: [
    ReactiveFormsModule, RouterLink, LowerCasePipe, AlertaComponent, ErroCampoComponent, IconeComponent,
    StatusBadgeComponent, DataHoraPipe, NumeroPipe, TurnoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    @if (criada(); as m) {
      <!-- Confirmação com o status devolvido pelo servidor -->
      <section class="cartao confirmacao" [attr.data-status]="m.statusAlerta" aria-labelledby="titulo-sucesso">
        <h1 id="titulo-sucesso" class="titulo" tabindex="-1" #tituloSucesso>
          <vs-icone nome="check" [tamanho]="32" /> Medição registrada
        </h1>
        <p class="subtitulo">{{ m.dataHoraMedicao | dataHora: 'longa' }} · Turno da {{ m.turno | turno | lowercase }}</p>

        <vs-status-badge [status]="m.statusAlerta" [grande]="true" [mostrarDescricao]="true" />

        <dl class="valores">
          <div class="valor">
            <dt><vs-icone nome="gota" [tamanho]="20" /> Glicose</dt>
            <dd><strong>{{ m.glicose | numero: 1 }}</strong> <span class="unidade">mg/dL</span></dd>
          </div>
          <div class="valor">
            <dt><vs-icone nome="coracao" [tamanho]="20" /> Pressão</dt>
            <dd><strong>{{ m.pressaoSistolica }}/{{ m.pressaoDiastolica }}</strong> <span class="unidade">mmHg</span></dd>
          </div>
        </dl>

        <div class="acoes">
          <button type="button" class="btn btn-primario btn-grande" (click)="novaMedicao()">
            <vs-icone nome="mais" /> Registrar outra
          </button>
          <a routerLink="/app/historico" class="btn btn-secundario btn-grande"><vs-icone nome="lista" /> Ver histórico</a>
          <a routerLink="/app/dashboard" class="btn btn-fantasma btn-grande"><vs-icone nome="casa" /> Voltar ao resumo</a>
        </div>
      </section>
    } @else {
      <section class="cartao cartao-form largo" aria-labelledby="titulo-medicao">
        <h1 id="titulo-medicao" class="titulo">Registrar medição</h1>
        <p class="subtitulo">Anote os valores que aparecem nos seus aparelhos. Todos os campos são obrigatórios.</p>

        @if (erroGeral()) {
          <vs-alerta tipo="erro" titulo="A medição não foi salva">
            <p>{{ erroGeral() }}</p>
            @if (erroDeRede()) {
              <p>Seus valores continuam preenchidos. Quando quiser, toque em “Salvar medição” de novo.</p>
            }
          </vs-alerta>
        }

        <form [formGroup]="form" (ngSubmit)="enviar()" novalidate>
          <div class="campo">
            <label for="glicose"><vs-icone nome="gota" [tamanho]="22" /> Glicose</label>
            <p id="glicose-ajuda" class="campo-ajuda">Valor em mg/dL, entre 20 e 1000. Pode usar casa decimal.</p>
            <div class="campo-unidade">
              <input id="glicose" type="number" inputmode="decimal" step="0.1" min="20" max="1000"
                formControlName="glicose" [attr.aria-invalid]="invalido('glicose')"
                aria-describedby="glicose-ajuda glicose-erro" />
              <span class="unidade" aria-hidden="true">mg/dL</span>
            </div>
            <vs-erro-campo alvoId="glicose-erro" [controle]="form.controls.glicose" [mensagens]="{
              required: 'Digite o valor da glicose.',
              min: 'A glicose precisa ser de pelo menos 20 mg/dL.',
              max: 'A glicose precisa ser de no máximo 1000 mg/dL.'
            }" />
          </div>

          <fieldset class="campo">
            <legend><vs-icone nome="coracao" [tamanho]="22" /> Pressão arterial</legend>
            <p class="campo-ajuda">Anote a sistólica (o número maior) e a diastólica (o número menor), em mmHg.</p>
            <div class="pressao">
              <div class="campo">
                <label for="sistolica">Sistólica (maior)</label>
                <div class="campo-unidade">
                  <input id="sistolica" type="number" inputmode="numeric" step="1" min="50"
                    formControlName="pressaoSistolica" [attr.aria-invalid]="invalido('pressaoSistolica')"
                    aria-describedby="sistolica-erro" />
                  <span class="unidade" aria-hidden="true">mmHg</span>
                </div>
                <vs-erro-campo alvoId="sistolica-erro" [controle]="form.controls.pressaoSistolica" [mensagens]="{
                  required: 'Digite a pressão sistólica.',
                  min: 'A sistólica precisa ser de pelo menos 50 mmHg.',
                  inteiro: 'Use um número inteiro, sem vírgula.'
                }" />
              </div>
              <span class="pressao-barra" aria-hidden="true">/</span>
              <div class="campo">
                <label for="diastolica">Diastólica (menor)</label>
                <div class="campo-unidade">
                  <input id="diastolica" type="number" inputmode="numeric" step="1" min="30"
                    formControlName="pressaoDiastolica" [attr.aria-invalid]="invalido('pressaoDiastolica')"
                    aria-describedby="diastolica-erro" />
                  <span class="unidade" aria-hidden="true">mmHg</span>
                </div>
                <vs-erro-campo alvoId="diastolica-erro" [controle]="form.controls.pressaoDiastolica" [mensagens]="{
                  required: 'Digite a pressão diastólica.',
                  min: 'A diastólica precisa ser de pelo menos 30 mmHg.',
                  inteiro: 'Use um número inteiro, sem vírgula.'
                }" />
              </div>
            </div>
          </fieldset>

          <fieldset class="campo grupo-opcoes" aria-describedby="turno-ajuda turno-erro">
            <legend>Turno da medição</legend>
            <p id="turno-ajuda" class="campo-ajuda">Escolha se você mediu de manhã ou à noite.</p>
            <div class="opcoes-lado">
              <label class="opcao" [class.selecionada]="form.controls.turno.value === 'MANHA'">
                <input type="radio" formControlName="turno" value="MANHA" />
                <vs-icone nome="sol" [tamanho]="28" /> <strong>Manhã</strong>
              </label>
              <label class="opcao" [class.selecionada]="form.controls.turno.value === 'NOITE'">
                <input type="radio" formControlName="turno" value="NOITE" />
                <vs-icone nome="lua" [tamanho]="28" /> <strong>Noite</strong>
              </label>
            </div>
            <vs-erro-campo alvoId="turno-erro" [controle]="form.controls.turno"
              [mensagens]="{ required: 'Escolha Manhã ou Noite.' }" />
          </fieldset>

          <button type="submit" class="btn btn-primario btn-bloco btn-grande" [disabled]="enviando()"
            [attr.aria-busy]="enviando()">
            @if (enviando()) { <span class="girando" aria-hidden="true"></span> Salvando… } @else { Salvar medição }
          </button>
        </form>
      </section>
    }
  `,
})
export class NovaMedicaoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(MedicoesService);
  private readonly tituloSucesso = viewChild<ElementRef<HTMLElement>>('tituloSucesso');

  readonly enviando = signal(false);
  readonly erroGeral = signal<string | null>(null);
  readonly erroDeRede = signal(false);
  readonly criada = signal<Medicao | null>(null);

  readonly form = this.fb.group({
    glicose: this.fb.control<number | null>(null, [Validators.required, Validators.min(20), Validators.max(1000)]),
    pressaoSistolica: this.fb.control<number | null>(null, [Validators.required, Validators.min(50), inteiro]),
    pressaoDiastolica: this.fb.control<number | null>(null, [Validators.required, Validators.min(30), inteiro]),
    turno: this.fb.control<TurnoMedicao | null>(this.turnoSugerido(), [Validators.required]),
  });

  invalido(nome: CampoMedicao): boolean {
    const c = this.form.controls[nome];
    return c.invalid && (c.touched || c.dirty);
  }

  enviar(): void {
    if (this.enviando()) return; // evita reenvio por clique repetido
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      queueMicrotask(() => (document.querySelector('form input.ng-invalid') as HTMLElement | null)?.focus());
      return;
    }

    const v = this.form.getRawValue();
    this.erroGeral.set(null);
    this.erroDeRede.set(false);
    this.enviando.set(true);

    this.service
      .registrar({
        glicose: Number(v.glicose),
        pressaoSistolica: Number(v.pressaoSistolica),
        pressaoDiastolica: Number(v.pressaoDiastolica),
        turno: v.turno as TurnoMedicao,
      })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: (m) => {
          this.criada.set(m);
          setTimeout(() => this.tituloSucesso()?.nativeElement.focus());
        },
        error: (e) => {
          const erro = normalizarErro(e);
          if (erro.status === 401) return; // interceptor redireciona
          const extras = aplicarErrosNoFormulario(this.form, erro.campos);
          this.erroDeRede.set(erro.tipo === 'rede' || erro.tipo === 'servidor');
          this.erroGeral.set([erro.mensagem, ...extras].join(' '));
          // Os valores digitados NÃO são apagados.
        },
      });
  }

  novaMedicao(): void {
    this.criada.set(null);
    this.form.reset({ glicose: null, pressaoSistolica: null, pressaoDiastolica: null, turno: this.turnoSugerido() });
  }

  /** Sugestão inicial pelo horário; a pessoa pode trocar. */
  private turnoSugerido(): TurnoMedicao {
    return new Date().getHours() < 14 ? 'MANHA' : 'NOITE';
  }
}
