import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { ApiError, normalizarErro } from '../../core/http/api-error';
import { Medicao } from '../../core/models/api.models';
import { MedicoesService } from '../../core/services/medicoes.service';
import { AlertaComponent } from '../../shared/alerta.component';
import { IconeComponent } from '../../shared/icone.component';
import { DataHoraPipe, NumeroPipe, TurnoPipe } from '../../shared/pipes';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { GraficoGlicoseComponent } from './grafico-glicose.component';

@Component({
  selector: 'vs-historico',
  standalone: true,
  imports: [
    RouterLink, AlertaComponent, IconeComponent, StatusBadgeComponent, GraficoGlicoseComponent,
    DataHoraPipe, NumeroPipe, TurnoPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cabecalho-pagina">
      <div>
        <h1 class="titulo">Histórico</h1>
        <p class="subtitulo">Suas medições, da mais recente para a mais antiga.</p>
      </div>
      <a routerLink="/app/medicoes/nova" class="btn btn-primario btn-grande"><vs-icone nome="mais" /> Registrar medição</a>
    </div>

    @if (carregando() && medicoes() === null) {
      <div class="carregando" role="status" aria-live="polite">
        <span class="girando" aria-hidden="true"></span> Carregando histórico…
      </div>
    } @else if (erro()) {
      <vs-alerta tipo="erro" titulo="Não foi possível carregar o histórico">
        <p>{{ erro()?.mensagem }}</p>
        <button type="button" class="btn btn-secundario" (click)="carregar()" [disabled]="carregando()">
          <vs-icone nome="atualizar" /> Tentar novamente
        </button>
      </vs-alerta>
    } @else if (medicoes()) {
      @let lista = medicoes()!;
      @if (lista.length === 0) {
        <section class="cartao vazio" aria-labelledby="titulo-vazio">
          <span class="vazio-icone"><vs-icone nome="lista" [tamanho]="40" /></span>
          <h2 id="titulo-vazio" class="titulo-secao">Nenhuma medição por aqui ainda</h2>
          <p>Quando você registrar, ela aparece nesta lista.</p>
          <a routerLink="/app/medicoes/nova" class="btn btn-primario btn-grande"><vs-icone nome="mais" /> Registrar primeira medição</a>
        </section>
      } @else {
        <ul class="contagem" aria-label="Contagem por status">
          <li data-status="NORMAL"><strong>{{ contagem().NORMAL }}</strong> normal</li>
          <li data-status="ATENCAO"><strong>{{ contagem().ATENCAO }}</strong> atenção</li>
          <li data-status="CRITICO"><strong>{{ contagem().CRITICO }}</strong> crítico</li>
        </ul>

        @if (lista.length >= 2) {
          <vs-grafico-glicose [medicoes]="lista" />
        }

        <div class="tabela-envoltorio">
          <table class="tabela">
            <caption>{{ lista.length }} {{ lista.length === 1 ? 'medição' : 'medições' }} registradas</caption>
            <thead>
              <tr>
                <th scope="col">Data e hora</th>
                <th scope="col">Turno</th>
                <th scope="col">Glicose</th>
                <th scope="col">Pressão</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              @for (m of lista; track m.id) {
                <tr [attr.data-status]="m.statusAlerta">
                  <th scope="row" data-rotulo="Data e hora">{{ m.dataHoraMedicao | dataHora }}</th>
                  <td data-rotulo="Turno">{{ m.turno | turno }}</td>
                  <td data-rotulo="Glicose"><span><strong>{{ m.glicose | numero: 1 }}</strong><span class="unidade">mg/dL</span></span></td>
                  <td data-rotulo="Pressão">
                    <span><strong>{{ m.pressaoSistolica }}/{{ m.pressaoDiastolica }}</strong><span class="unidade">mmHg</span></span>
                  </td>
                  <td data-rotulo="Status"><vs-status-badge [status]="m.statusAlerta" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <p class="atualizado">
          @if (atualizadoEm(); as quando) { Última atualização: {{ quando | dataHora: 'hora' }}. }
          <button type="button" class="btn btn-fantasma btn-pequeno" (click)="carregar()" [disabled]="carregando()"
            [attr.aria-busy]="carregando()">
            <vs-icone nome="atualizar" [tamanho]="20" /> {{ carregando() ? 'Atualizando…' : 'Atualizar' }}
          </button>
        </p>
      }
    }
  `,
})
export class HistoricoComponent implements OnInit {
  private readonly service = inject(MedicoesService);
  private readonly destroyRef = inject(DestroyRef);

  readonly carregando = signal(false);
  readonly erro = signal<ApiError | null>(null);
  readonly medicoes = signal<Medicao[] | null>(null);
  readonly atualizadoEm = signal<Date | null>(null);

  readonly contagem = computed(() => {
    const c = { NORMAL: 0, ATENCAO: 0, CRITICO: 0 };
    for (const m of this.medicoes() ?? []) c[m.statusAlerta] = (c[m.statusAlerta] ?? 0) + 1;
    return c;
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    if (this.carregando()) return;
    this.carregando.set(true);
    this.erro.set(null);
    this.service
      .listar()
      .pipe(
        finalize(() => this.carregando.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (lista) => {
          this.medicoes.set(lista ?? []);
          this.atualizadoEm.set(new Date());
        },
        error: (e) => {
          const erro = normalizarErro(e);
          if (erro.status !== 401 && erro.status !== 403) this.erro.set(erro);
        },
      });
  }
}
