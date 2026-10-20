import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { API_BASE_URL } from '../config/api.config';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

const BASE = 'http://api.teste/api/v1';

describe('authInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  let auth: AuthService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: BASE },
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => ctrl.verify());

  function entrar(): void {
    auth.entrar({ email: 'maria@exemplo.com', senha: 'senha123' }).subscribe();
    ctrl.expectOne(`${BASE}/auth/login`).flush({
      token: 'abc.def.ghi', nome: 'Maria Silva', email: 'maria@exemplo.com', perfil: 'PACIENTE',
    });
  }

  it('envia Bearer nas rotas privadas', () => {
    entrar();
    http.get(`${BASE}/medicoes`).subscribe();
    const req = ctrl.expectOne(`${BASE}/medicoes`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc.def.ghi');
    req.flush([]);
  });

  it('não envia Bearer no login/cadastro', () => {
    entrar();
    http.post(`${BASE}/auth/register`, {}).subscribe();
    const req = ctrl.expectOne(`${BASE}/auth/register`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush(null, { status: 201, statusText: 'Created' });
  });

  it('nunca guarda a senha no armazenamento', () => {
    entrar();
    expect(JSON.stringify(sessionStorage)).not.toContain('senha123');
    expect(JSON.stringify(localStorage)).not.toContain('senha123');
  });

  it('em 401 numa rota privada limpa a sessão e volta ao login', () => {
    entrar();
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    http.get(`${BASE}/dashboard`).subscribe({ error: () => undefined });
    ctrl.expectOne(`${BASE}/dashboard`).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.sessao()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { motivo: 'sessao-expirada' } });
  });
});
