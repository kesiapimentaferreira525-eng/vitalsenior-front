/**
 * Contratos da API REST VitalSênior (backend Java / Spring Boot).
 * Nomes de propriedades em camelCase, iguais aos DTOs do backend.
 */

export type Perfil = 'PACIENTE' | 'CUIDADOR' | 'MEDICO';
export type TurnoMedicao = 'MANHA' | 'NOITE';
export type StatusAlerta = 'NORMAL' | 'ATENCAO' | 'CRITICO';

/** POST /api/v1/auth/register  → 201 sem corpo */
export interface CadastroUsuario {
  nome: string;
  email: string;
  senha: string;
  perfil: Perfil;
  emailCuidador?: string | null;
}

/** POST /api/v1/auth/login */
export interface LoginRequest {
  email: string;
  senha: string;
}

/** Resposta 200 do login */
export interface JwtResponse {
  token: string;
  nome: string;
  email: string;
  perfil: Perfil;
}

/** POST /api/v1/medicoes  → 201 com Medicao */
export interface RegistrarMedicao {
  glicose: number;
  pressaoSistolica: number;
  pressaoDiastolica: number;
  turno: TurnoMedicao;
}

export interface Medicao {
  id: number;
  glicose: number;
  pressaoSistolica: number;
  pressaoDiastolica: number;
  turno: TurnoMedicao;
  statusAlerta: StatusAlerta;
  /** ISO-8601 (LocalDateTime do Java, ex.: 2026-10-20T08:30:00) */
  dataHoraMedicao: string;
}

/** GET /api/v1/dashboard */
export interface DashboardResumo {
  totalMedicoes: number;
  ultimaMedicao: Medicao | null;
}

/** Formato de erro padrão do backend */
export interface ApiErrorBody {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  messages?: Record<string, string>;
}
