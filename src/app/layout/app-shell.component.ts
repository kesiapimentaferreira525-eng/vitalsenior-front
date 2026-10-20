import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../core/auth/auth.service';
import { IconeComponent } from '../shared/icone.component';
import { PerfilPipe } from '../shared/pipes';

/** Área autenticada: cabeçalho simples, navegação persistente e botão Sair. */
@Component({
  selector: 'vs-app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconeComponent, PerfilPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="topo">
      <div class="topo-interno">
        <a routerLink="/app/dashboard" class="marca" aria-label="VitalSênior — ir para o resumo">
          <span class="marca-selo"><vs-icone nome="pulso" [tamanho]="26" /></span>
          <span class="marca-nome">VitalSênior</span>
        </a>

        @if (auth.sessao(); as s) {
          <p class="topo-usuario">
            Olá, <strong>{{ auth.primeiroNome() }}</strong>
            <span class="topo-perfil">{{ s.perfil | perfil }}</span>
          </p>
        }

        <button type="button" class="btn btn-fantasma" (click)="sair()">
          <vs-icone nome="sair" /> Sair
        </button>
      </div>

      <nav class="navegacao" aria-label="Navegação principal">
        <ul>
          <li>
            <a routerLink="/app/dashboard" routerLinkActive="ativo" ariaCurrentWhenActive="page">
              <vs-icone nome="casa" /> Resumo
            </a>
          </li>
          <li>
            <a routerLink="/app/medicoes/nova" routerLinkActive="ativo" ariaCurrentWhenActive="page">
              <vs-icone nome="mais" /> <span class="rotulo-longo">Registrar medição</span><span class="rotulo-curto" aria-hidden="true">Registrar</span>
            </a>
          </li>
          <li>
            <a routerLink="/app/historico" routerLinkActive="ativo" ariaCurrentWhenActive="page">
              <vs-icone nome="lista" /> Histórico
            </a>
          </li>
        </ul>
      </nav>
    </header>

    <main id="conteudo" class="pagina" tabindex="-1">
      <router-outlet />
    </main>

    <footer class="rodape">
      <p>
        Os alertas seguem as faixas configuradas no sistema e não são diagnóstico.
        Em caso de mal-estar, procure atendimento médico.
      </p>
    </footer>
  `,
})
export class AppShellComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  sair(): void {
    this.auth.sair();
    this.router.navigate(['/login'], { queryParams: { motivo: 'saiu' } });
  }
}
