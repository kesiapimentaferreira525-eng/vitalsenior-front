import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Medicao } from '../../core/models/api.models';
import { DataHoraPipe } from '../../shared/pipes';

const LARGURA = 640;
const ALTURA = 220;
const MARGEM = { topo: 16, dir: 16, base: 32, esq: 44 };
const MAX_PONTOS = 14;

/**
 * Gráfico complementar da glicose (últimas medições).
 * É decorativo para leitores de tela: a tabela abaixo traz os mesmos dados.
 */
@Component({
  selector: 'vs-grafico-glicose',
  standalone: true,
  imports: [DataHoraPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <figure class="cartao grafico">
      <figcaption>
        <strong>Glicose nas últimas {{ pontos().length }} medições (mg/dL)</strong>
        <span class="campo-ajuda">A tabela abaixo mostra os mesmos valores em texto.</span>
      </figcaption>
      <svg [attr.viewBox]="'0 0 ' + largura + ' ' + altura" role="img" aria-hidden="true" focusable="false">
        <!-- faixa de referência configurada no backend (80–140 mg/dL) -->
        <rect class="grafico-faixa" [attr.x]="m.esq" [attr.width]="largura - m.esq - m.dir"
          [attr.y]="y(140)" [attr.height]="y(80) - y(140)" />
        @for (t of marcas(); track t) {
          <line class="grafico-grade" [attr.x1]="m.esq" [attr.x2]="largura - m.dir" [attr.y1]="y(t)" [attr.y2]="y(t)" />
          <text class="grafico-texto" [attr.x]="m.esq - 8" [attr.y]="y(t) + 5" text-anchor="end">{{ t }}</text>
        }
        <polyline class="grafico-linha" [attr.points]="linha()" />
        @for (p of pontos(); track p.id; let i = $index) {
          <circle class="grafico-ponto" [attr.data-status]="p.statusAlerta" [attr.cx]="x(i)" [attr.cy]="y(p.glicose)" r="6" />
        }
        @if (pontos().length) {
          <text class="grafico-texto" [attr.x]="x(0)" [attr.y]="altura - 8" text-anchor="start">
            {{ pontos()[0].dataHoraMedicao | dataHora: 'data' }}
          </text>
          <text class="grafico-texto" [attr.x]="x(pontos().length - 1)" [attr.y]="altura - 8" text-anchor="end">
            {{ pontos()[pontos().length - 1].dataHoraMedicao | dataHora: 'data' }}
          </text>
        }
      </svg>
      <p class="grafico-legenda">
        <span><span class="legenda-faixa" aria-hidden="true"></span> Faixa sem alerta de glicose (80 a 140)</span>
      </p>
    </figure>
  `,
})
export class GraficoGlicoseComponent {
  readonly medicoes = input.required<Medicao[]>();

  readonly largura = LARGURA;
  readonly altura = ALTURA;
  readonly m = MARGEM;

  /** Ordem cronológica (a API devolve da mais recente para a mais antiga). */
  readonly pontos = computed(() => this.medicoes().slice(0, MAX_PONTOS).reverse());

  private readonly escala = computed(() => {
    const vals = this.pontos().map((p) => p.glicose);
    const min = Math.min(60, ...vals);
    const max = Math.max(200, ...vals);
    return { min: Math.floor(min / 20) * 20, max: Math.ceil(max / 20) * 20 };
  });

  readonly marcas = computed(() => {
    const { min, max } = this.escala();
    const passo = max - min > 300 ? 100 : 40;
    const out: number[] = [];
    for (let v = Math.ceil(min / passo) * passo; v <= max; v += passo) out.push(v);
    return out;
  });

  readonly linha = computed(() => this.pontos().map((p, i) => `${this.x(i)},${this.y(p.glicose)}`).join(' '));

  x(i: number): number {
    const n = this.pontos().length;
    const util = LARGURA - MARGEM.esq - MARGEM.dir - 12;
    return MARGEM.esq + 6 + (n <= 1 ? util / 2 : (i * util) / (n - 1));
  }

  y(v: number): number {
    const { min, max } = this.escala();
    const util = ALTURA - MARGEM.topo - MARGEM.base;
    const lim = Math.max(min, Math.min(max, v));
    return MARGEM.topo + util - ((lim - min) / (max - min)) * util;
  }
}
