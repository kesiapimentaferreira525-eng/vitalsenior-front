import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Bloqueia a área /app sem token local válido. A API é a autoridade final. */
export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const tinhaSessao = auth.sessao() !== null;
  if (auth.sessaoValida()) return true;

  const queryParams: Record<string, string> = { voltar: state.url };
  if (tinhaSessao) queryParams['motivo'] = 'sessao-expirada';
  return router.createUrlTree(['/login'], { queryParams });
};

/** Quem já está logado não precisa ver login/cadastro. */
export const visitanteGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.sessaoValida() ? router.createUrlTree(['/app/dashboard']) : true;
};
