import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { API_BASE_URL } from '../config/api.config';
import { DashboardResumo } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  /** GET /api/v1/dashboard */
  obterResumo(): Observable<DashboardResumo> {
    return this.http.get<DashboardResumo & { totalMedicos?: number }>(`${this.baseUrl}/dashboard`).pipe(
      map((r) => ({
        // Tolerância: um rascunho da especificação usava "totalMedicos".
        totalMedicoes: r.totalMedicoes ?? r.totalMedicos ?? 0,
        ultimaMedicao: r.ultimaMedicao ?? null,
      })),
    );
  }
}
