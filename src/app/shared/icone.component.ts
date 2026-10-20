import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type NomeIcone =
  | 'pulso'
  | 'casa'
  | 'mais'
  | 'lista'
  | 'sair'
  | 'check'
  | 'atencao'
  | 'critico'
  | 'erro'
  | 'info'
  | 'gota'
  | 'coracao'
  | 'sol'
  | 'lua'
  | 'atualizar'
  | 'olho'
  | 'olho-fechado';

/** Ícones SVG decorativos (aria-hidden). O significado sempre vem do texto ao lado. */
@Component({
  selector: 'vs-icone',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'icone', 'aria-hidden': 'true' },
  template: `
    <svg viewBox="0 0 24 24" [attr.width]="tamanho()" [attr.height]="tamanho()" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" focusable="false">
      @switch (nome()) {
        @case ('pulso') { <path d="M3 12h4l2-5 4 10 2-5h6" /> }
        @case ('casa') { <path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /> }
        @case ('mais') { <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" /> }
        @case ('lista') { <path d="M9 6h11M9 12h11M9 18h11" /><circle cx="4.5" cy="6" r="1" /><circle cx="4.5" cy="12" r="1" /><circle cx="4.5" cy="18" r="1" /> }
        @case ('sair') { <path d="M15 4h4v16h-4" /><path d="M10 8l-4 4 4 4" /><path d="M6 12h10" /> }
        @case ('check') { <circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /> }
        @case ('atencao') { <circle cx="12" cy="12" r="9" /><path d="M12 7v6" /><circle cx="12" cy="16.5" r=".6" fill="currentColor" /> }
        @case ('critico') { <path d="M12 3l10 18H2z" /><path d="M12 10v5" /><circle cx="12" cy="18" r=".6" fill="currentColor" /> }
        @case ('erro') { <circle cx="12" cy="12" r="9" /><path d="M9 9l6 6M15 9l-6 6" /> }
        @case ('info') { <circle cx="12" cy="12" r="9" /><path d="M12 11v6" /><circle cx="12" cy="7.5" r=".6" fill="currentColor" /> }
        @case ('gota') { <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /> }
        @case ('coracao') { <path d="M12 20s-7-4.5-9-9a4.8 4.8 0 0 1 9-3 4.8 4.8 0 0 1 9 3c-2 4.5-9 9-9 9z" /> }
        @case ('sol') { <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5" /> }
        @case ('lua') { <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" /> }
        @case ('atualizar') { <path d="M20 11a8 8 0 0 0-14.5-4.5L4 8" /><path d="M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14.5 4.5L20 16" /><path d="M20 20v-4h-4" /> }
        @case ('olho') { <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /> }
        @case ('olho-fechado') { <path d="M3 3l18 18" /><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3 3.9M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10 10 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /> }
      }
    </svg>
  `,
})
export class IconeComponent {
  readonly nome = input.required<NomeIcone>();
  readonly tamanho = input<number>(24);
}
