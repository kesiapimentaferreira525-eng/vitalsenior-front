import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { Medicao, RegistrarMedicao } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class MedicoesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** POST /api/v1/medicoes — o usuário vem do token; não enviar userId. */
  registrar(dados: RegistrarMedicao): Observable<Medicao> {
    return this.http.post<Medicao>(`${this.baseUrl}/medicoes`, dados);
  }

  /** GET /api/v1/medicoes — já vem da mais recente para a mais antiga. */
  listar(): Observable<Medicao[]> {
    return this.http.get<Medicao[]>(`${this.baseUrl}/medicoes`);
  }
}
