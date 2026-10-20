import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconeComponent, NomeIcone } from './icone.component';

export type TipoAlerta = 'erro' | 'sucesso' | 'info' | 'aviso';

/** Mensagem em bloco, anunciada para leitores de tela. */
@Component({
  selector: 'vs-alerta',
  standalone: true,
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="alerta" [attr.data-tipo]="tipo()" [attr.role]="tipo() === 'erro' ? 'alert' : 'status'"
      [attr.aria-live]="tipo() === 'erro' ? 'assertive' : 'polite'">
      <vs-icone [nome]="icone()" [tamanho]="28" />
      <div class="alerta-corpo">
        @if (titulo()) { <p class="alerta-titulo">{{ titulo() }}</p> }
        <ng-content />
      </div>
    </div>
  `,
})
export class AlertaComponent {
  readonly tipo = input<TipoAlerta>('info');
  readonly titulo = input<string>('');

  readonly icone = computed<NomeIcone>(() => {
    switch (this.tipo()) {
      case 'erro': return 'erro';
      case 'sucesso': return 'check';
      case 'aviso': return 'atencao';
      default: return 'info';
    }
  });
}
