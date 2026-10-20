import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { ApiError, normalizarErro } from '../../core/http/api-error';
import { DashboardResumo } from '../../core/models/api.models';
import { STATUS_DESCRICAO } from '../../core/models/labels';
import { LowerCasePipe } from '@angular/common';
import { DashboardService } from '../../core/services/dashboard.service';
import { AlertaComponent } from '../../shared/alerta.component';
import { IconeComponent } from '../../shared/icone.component';
import { DataHoraPipe, NumeroPipe, TurnoPipe } from '../../shared/pipes';
import { StatusBadgeComponent } from '../../shared/status-badge.component';

@Component({
  selector: 'vs-dashboard',
  standalone: true,
  imports: [RouterLink, LowerCasePipe, AlertaComponent, IconeComponent, StatusBadgeComponent, DataHoraPipe, NumeroPipe, TurnoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cabecalho-pagina">
      <div>
        <h1 class="titulo">Olá, {{ auth.primeiroNome() }}</h1>
        <p class="subtitulo">Este é o resumo das suas medições.</p>
      </div>
      <a routerLink="/app/medicoes/nova" class="btn btn-primario btn-grande">
        <vs-icone nome="mais" /> Registrar medição
      </a>
    </div>

    @if (carregando() && !resumo()) {
      <div class="carregando" role="status" aria-live="polite">
        <span class="girando" aria-hidden="true"></span> Carregando seu resumo…
      </div>
    } @else if (erro()) {
      <vs-alerta tipo="erro" titulo="Não foi possível carregar o resumo">
        <p>{{ erro()?.mensagem }}</p>
        <button type="button" class="btn btn-secundario" (click)="carregar()" [disabled]="carregando()">
          <vs-icone nome="atualizar" /> Tentar novamente
        </button>
      </vs-alerta>
    } @else if (resumo()) {
      @let r = resumo()!;
      @if (r.totalMedicoes === 0 || !r.ultimaMedicao) {
        <section class="cartao vazio" aria-labelledby="titulo-vazio">
          <span class="vazio-icone"><vs-icone nome="pulso" [tamanho]="40" /></span>
          <h2 id="titulo-vazio" class="titulo-secao">Você ainda não tem medições</h2>
          <p>Registre sua glicose e pressão para começar a acompanhar sua saúde.</p>
          <a routerLink="/app/medicoes/nova" class="btn btn-primario btn-grande">
            <vs-icone nome="mais" /> Registrar primeira medição
          </a>
        </section>
      } @else {
        <div class="grade-resumo">
          <section class="cartao cartao-total" aria-labelledby="titulo-total">
            <h2 id="titulo-total" class="rotulo-pequeno">Total de medições</h2>
            <p class="numero-grande">{{ r.totalMedicoes }}</p>
            <a routerLink="/app/historico" class="link-forte">Ver histórico completo →</a>
          </section>

          @if (r.ultimaMedicao; as m) {
            <section class="cartao cartao-ultima" [attr.data-status]="m.statusAlerta" aria-labelledby="titulo-ultima">
              <div class="cartao-ultima-topo">
                <div>
                  <h2 id="titulo-ultima" class="rotulo-pequeno">Última medição</h2>
                  <p class="data-medicao">
                    <vs-icone [nome]="m.turno === 'MANHA' ? 'sol' : 'lua'" [tamanho]="20" />
                    {{ m.dataHoraMedicao | dataHora: 'longa' }} · Turno da {{ m.turno | turno | lowercase }}
                  </p>
                </div>
                <vs-status-badge [status]="m.statusAlerta" [grande]="true" />
              </div>

              <dl class="valores">
                <div class="valor">
                  <dt><vs-icone nome="gota" [tamanho]="20" /> Glicose</dt>
                  <dd><strong>{{ m.glicose | numero: 1 }}</strong> <span class="unidade">mg/dL</span></dd>
                </div>
                <div class="valor">
                  <dt><vs-icone nome="coracao" [tamanho]="20" /> Pressão (sistólica/diastólica)</dt>
                  <dd>
                    <strong>{{ m.pressaoSistolica }}/{{ m.pressaoDiastolica }}</strong> <span class="unidade">mmHg</span>
                  </dd>
                </div>
              </dl>
              <p class="status-descricao">{{ descricoes[m.statusAlerta] }}</p>
            </section>
          }
        </div>
      }

      <p class="atualizado">
        @if (atualizadoEm(); as quando) { Última atualização: {{ quando | dataHora: 'hora' }}. }
        <button type="button" class="btn btn-fantasma btn-pequeno" (click)="carregar()" [disabled]="carregando()"
          [attr.aria-busy]="carregando()">
          <vs-icone nome="atualizar" [tamanho]="20" /> {{ carregando() ? 'Atualizando…' : 'Atualizar' }}
        </button>
      </p>
    }
  `,
})
export class DashboardComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  protected readonly descricoes = STATUS_DESCRICAO;
  private readonly service = inject(DashboardService);
  private readonly destroyRef = inject(DestroyRef);

  readonly carregando = signal(false);
  readonly erro = signal<ApiError | null>(null);
  readonly resumo = signal<DashboardResumo | null>(null);
  readonly atualizadoEm = signal<Date | null>(null);

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    if (this.carregando()) return;
    this.carregando.set(true);
    this.erro.set(null);
    this.service
      .obterResumo()
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (r) => {
          this.resumo.set(r);
          this.atualizadoEm.set(new Date());
        },
        error: (e) => {
          const erro = normalizarErro(e);
          // 401/403 já redirecionam ao login pelo interceptor.
          if (erro.status !== 401 && erro.status !== 403) this.erro.set(erro);
        },
      });
  }
}
