import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { StatusAlerta } from '../core/models/api.models';
import { STATUS_DESCRICAO, STATUS_ROTULO } from '../core/models/labels';
import { IconeComponent, NomeIcone } from './icone.component';

/**
 * Status de alerta retornado pelo servidor.
 * Nunca depende só da cor: sempre há ícone + texto.
 */
@Component({
  selector: 'vs-status-badge',
  standalone: true,
  imports: [IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="status" [attr.data-status]="status()">
      <vs-icone [nome]="icone()" [tamanho]="grande() ? 28 : 20" />
      <span><span class="sr-only">Status: </span>{{ rotulo() }}</span>
    </span>
    @if (mostrarDescricao()) {
      <p class="status-descricao">{{ descricao() }}</p>
    }
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<StatusAlerta>();
  readonly mostrarDescricao = input(false);
  readonly grande = input(false);

  readonly rotulo = computed(() => STATUS_ROTULO[this.status()] ?? this.status());
  readonly descricao = computed(() => STATUS_DESCRICAO[this.status()] ?? '');
  readonly icone = computed<NomeIcone>(() =>
    this.status() === 'CRITICO' ? 'critico' : this.status() === 'ATENCAO' ? 'atencao' : 'check',
  );
}
