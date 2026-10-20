import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IconeComponent } from '../shared/icone.component';

/** Área pública: login e cadastro. */
@Component({
  selector: 'vs-public-layout',
  standalone: true,
  imports: [RouterOutlet, IconeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="publico">
      <aside class="publico-marca">
        <div class="marca">
          <span class="marca-selo"><vs-icone nome="pulso" [tamanho]="30" /></span>
          <span class="marca-nome">VitalSênior</span>
        </div>
        <h2 class="publico-chamada">Sua saúde, anotada com calma.</h2>
        <ul class="publico-lista">
          <li><vs-icone nome="gota" /> Registre a glicose em mg/dL</li>
          <li><vs-icone nome="coracao" /> Anote a pressão arterial</li>
          <li><vs-icone nome="lista" /> Veja todo o seu histórico</li>
        </ul>
        <p class="publico-nota">
          O VitalSênior ajuda a organizar suas medições. Ele não substitui a avaliação de um profissional de saúde.
        </p>
      </aside>
      <main id="conteudo" class="publico-conteudo" tabindex="-1">
        <router-outlet />
      </main>
    </div>
  `,
})
export class PublicLayoutComponent {}
