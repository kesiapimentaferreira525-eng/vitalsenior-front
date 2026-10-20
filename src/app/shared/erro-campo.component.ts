import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

/**
 * Mostra o erro de um campo, junto dele.
 * Prioriza a mensagem do servidor (HTTP 422) e depois as validações locais.
 * Use o mesmo `alvoId` no aria-describedby do input.
 */
@Component({
  selector: 'vs-erro-campo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    @if (mensagem(); as msg) {
      <p class="campo-erro" [id]="alvoId()">
        <span aria-hidden="true">✕ </span>{{ msg }}
      </p>
    }
  `,
})
export class ErroCampoComponent {
  readonly controle = input.required<AbstractControl | null>();
  readonly alvoId = input.required<string>();
  /** Mensagens por chave de validador (required, email, min, max, minlength...). */
  readonly mensagens = input<Record<string, string>>({});

  mensagem(): string | null {
    const c = this.controle();
    if (!c || !c.errors || !(c.touched || c.dirty)) return null;
    const erros = c.errors;
    if (typeof erros['servidor'] === 'string') return erros['servidor'];
    const msgs = this.mensagens();
    for (const chave of Object.keys(erros)) {
      if (msgs[chave]) return msgs[chave];
    }
    return 'Verifique este campo.';
  }
}
