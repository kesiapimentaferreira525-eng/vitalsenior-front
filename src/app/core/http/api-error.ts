import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ApiErrorBody } from '../models/api.models';

export type TipoErro = 'rede' | 'validacao' | 'negocio' | 'autenticacao' | 'acesso' | 'servidor' | 'desconhecido';

/** Erro HTTP normalizado, pronto para exibição. */
export interface ApiError {
  status: number;
  tipo: TipoErro;
  /** Mensagem geral, em linguagem simples. */
  mensagem: string;
  /** Erros por campo (HTTP 422 → `messages`). */
  campos: Record<string, string>;
}

const MSG_REDE =
  'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.';
const MSG_SERVIDOR = 'O servidor teve um problema agora. Aguarde um pouco e tente novamente.';

/** Converte qualquer erro HTTP em um ApiError com mensagens amigáveis. */
export function normalizarErro(erro: unknown): ApiError {
  if (!(erro instanceof HttpErrorResponse)) {
    return { status: 0, tipo: 'desconhecido', mensagem: 'Algo deu errado. Tente novamente.', campos: {} };
  }

  const corpo: ApiErrorBody | null =
    erro.error && typeof erro.error === 'object' ? (erro.error as ApiErrorBody) : null;
  const msgBackend = corpo?.message?.trim();
  const campos = corpo?.messages && typeof corpo.messages === 'object' ? { ...corpo.messages } : {};

  switch (true) {
    case erro.status === 0:
      return { status: 0, tipo: 'rede', mensagem: MSG_REDE, campos: {} };
    case erro.status === 422:
      return {
        status: 422,
        tipo: 'validacao',
        mensagem: 'Alguns campos precisam de correção. Veja as mensagens abaixo de cada campo.',
        campos,
      };
    case erro.status === 400:
      return {
        status: 400,
        tipo: 'negocio',
        mensagem: msgBackend || 'Não foi possível concluir. Confira os dados e tente novamente.',
        campos,
      };
    case erro.status === 401:
      return {
        status: 401,
        tipo: 'autenticacao',
        mensagem: msgBackend || 'Não foi possível confirmar sua identidade.',
        campos: {},
      };
    case erro.status === 403:
      return { status: 403, tipo: 'acesso', mensagem: 'Você não tem permissão para esta ação.', campos: {} };
    case erro.status === 415:
      return {
        status: 415,
        tipo: 'desconhecido',
        mensagem: 'Formato de envio não aceito pelo servidor. Tente novamente.',
        campos: {},
      };
    case erro.status >= 500:
      return { status: erro.status, tipo: 'servidor', mensagem: MSG_SERVIDOR, campos: {} };
    default:
      return {
        status: erro.status,
        tipo: 'desconhecido',
        mensagem: msgBackend || 'Algo deu errado. Tente novamente.',
        campos,
      };
  }
}

/**
 * Aplica os erros por campo vindos do backend nos controles do formulário
 * (sem apagar o que a pessoa digitou). Retorna os erros que não têm campo
 * correspondente, para exibição geral.
 */
export function aplicarErrosNoFormulario(form: FormGroup, campos: Record<string, string>): string[] {
  const semCampo: string[] = [];
  for (const [nome, mensagem] of Object.entries(campos)) {
    const controle: AbstractControl | null = form.get(nome);
    if (controle) {
      controle.setErrors({ ...(controle.errors ?? {}), servidor: mensagem });
      controle.markAsTouched();
    } else {
      semCampo.push(mensagem);
    }
  }
  return semCampo;
}
