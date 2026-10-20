import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { CadastroUsuario, JwtResponse, LoginRequest, Perfil } from '../models/api.models';
import { jwtExpirado } from './jwt.util';

export interface Sessao {
  token: string;
  nome: string;
  email: string;
  perfil: Perfil;
}

/**
 * Chave no sessionStorage. Usamos armazenamento de curta duração (some ao
 * fechar a aba) para reduzir exposição. A SENHA NUNCA é armazenada.
 */
const CHAVE_SESSAO = 'vitalsenior.sessao';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  private readonly _sessao = signal<Sessao | null>(this.lerSessaoSalva());

  /** Sessão atual (ou null). */
  readonly sessao = this._sessao.asReadonly();
  readonly autenticado = computed(() => this._sessao() !== null);
  readonly primeiroNome = computed(() => this._sessao()?.nome.trim().split(/\s+/)[0] ?? '');

  /** POST /auth/register — 201 sem corpo. */
  cadastrar(dados: CadastroUsuario): Observable<void> {
    const corpo: CadastroUsuario = {
      ...dados,
      emailCuidador: dados.emailCuidador?.trim() ? dados.emailCuidador.trim() : null,
    };
    return this.http.post<void>(`${this.baseUrl}/auth/register`, corpo);
  }

  /** POST /auth/login — 200 com JWT e dados do perfil. */
  entrar(credenciais: LoginRequest): Observable<JwtResponse> {
    return this.http
      .post<JwtResponse>(`${this.baseUrl}/auth/login`, credenciais)
      .pipe(tap((r) => this.salvarSessao({ token: r.token, nome: r.nome, email: r.email, perfil: r.perfil })));
  }

  /** O backend não tem logout: sair = limpar a sessão local. */
  sair(): void {
    this._sessao.set(null);
    try {
      sessionStorage.removeItem(CHAVE_SESSAO);
    } catch {
      /* armazenamento indisponível */
    }
  }

  get token(): string | null {
    return this._sessao()?.token ?? null;
  }

  /** Há token local e ele não está claramente expirado. */
  sessaoValida(): boolean {
    const s = this._sessao();
    if (!s) return false;
    if (jwtExpirado(s.token)) {
      this.sair();
      return false;
    }
    return true;
  }

  private salvarSessao(sessao: Sessao): void {
    this._sessao.set(sessao);
    try {
      sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
    } catch {
      /* segue apenas em memória */
    }
  }

  private lerSessaoSalva(): Sessao | null {
    try {
      const bruto = sessionStorage.getItem(CHAVE_SESSAO);
      if (!bruto) return null;
      const s = JSON.parse(bruto) as Sessao;
      if (!s?.token || jwtExpirado(s.token)) {
        sessionStorage.removeItem(CHAVE_SESSAO);
        return null;
      }
      return s;
    } catch {
      return null;
    }
  }
}
