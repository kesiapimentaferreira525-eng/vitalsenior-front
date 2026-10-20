import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { AuthService } from './auth.service';

/**
 * - Adiciona `Authorization: Bearer <token>` nas chamadas privadas da API.
 * - Garante `Content-Type: application/json` em requisições com corpo.
 * - Em 401/403 de rota privada: limpa a sessão e volta ao login com aviso.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const baseUrl = inject(API_BASE_URL);

  const ehApi = req.url.startsWith(baseUrl);
  const ehPublica = ehApi && req.url.startsWith(`${baseUrl}/auth/`);
  const token = auth.token;

  let requisicao = req;
  if (ehApi && req.body !== null && !req.headers.has('Content-Type')) {
    requisicao = requisicao.clone({ setHeaders: { 'Content-Type': 'application/json' } });
  }
  if (ehApi && !ehPublica && token) {
    requisicao = requisicao.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      if (
        ehApi &&
        !ehPublica &&
        erro instanceof HttpErrorResponse &&
        (erro.status === 401 || erro.status === 403)
      ) {
        auth.sair();
        router.navigate(['/login'], { queryParams: { motivo: 'sessao-expirada' } });
      }
      return throwError(() => erro);
    }),
  );
};
