import { Perfil, StatusAlerta, TurnoMedicao } from './api.models';

/** Rótulos amigáveis na UI; o JSON continua usando os valores do enum. */

export const PERFIL_OPCOES: ReadonlyArray<{ valor: Perfil; rotulo: string; descricao: string }> = [
  { valor: 'PACIENTE', rotulo: 'Paciente', descricao: 'Vou registrar minhas próprias medições.' },
  { valor: 'CUIDADOR', rotulo: 'Cuidador(a)', descricao: 'Acompanho a saúde de outra pessoa.' },
  { valor: 'MEDICO', rotulo: 'Médico(a)', descricao: 'Sou profissional de saúde.' },
];

export const PERFIL_ROTULO: Record<Perfil, string> = {
  PACIENTE: 'Paciente',
  CUIDADOR: 'Cuidador(a)',
  MEDICO: 'Médico(a)',
};

export const TURNO_ROTULO: Record<TurnoMedicao, string> = {
  MANHA: 'Manhã',
  NOITE: 'Noite',
};

export const STATUS_ROTULO: Record<StatusAlerta, string> = {
  NORMAL: 'Normal',
  ATENCAO: 'Atenção',
  CRITICO: 'Crítico',
};

export const STATUS_DESCRICAO: Record<StatusAlerta, string> = {
  NORMAL: 'Valores dentro das faixas configuradas no sistema.',
  ATENCAO: 'Algum valor está próximo do limite. Fique atento(a).',
  CRITICO: 'Algum valor está fora da faixa. Se houver cuidador cadastrado, ele recebe um aviso por e-mail.',
};
