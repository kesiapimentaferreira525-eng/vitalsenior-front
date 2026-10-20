import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { aplicarErrosNoFormulario, normalizarErro } from './api-error';

describe('normalizarErro', () => {
  it('falha de rede (status 0) vira tipo "rede"', () => {
    const e = normalizarErro(new HttpErrorResponse({ status: 0 }));
    expect(e.tipo).toBe('rede');
  });

  it('HTTP 422 traz os erros por campo de "messages"', () => {
    const e = normalizarErro(
      new HttpErrorResponse({
        status: 422,
        error: { status: 422, message: 'Erro de validação', messages: { email: 'E-mail inválido' } },
      }),
    );
    expect(e.tipo).toBe('validacao');
    expect(e.campos['email']).toBe('E-mail inválido');
  });

  it('HTTP 400 usa a "message" do backend', () => {
    const e = normalizarErro(new HttpErrorResponse({ status: 400, error: { message: 'E-mail já cadastrado' } }));
    expect(e.mensagem).toBe('E-mail já cadastrado');
  });

  it('HTTP 5xx vira tipo "servidor"', () => {
    expect(normalizarErro(new HttpErrorResponse({ status: 503 })).tipo).toBe('servidor');
  });
});

describe('aplicarErrosNoFormulario', () => {
  it('marca o controle com o erro do servidor sem apagar o valor', () => {
    const form = new FormGroup({ email: new FormControl('maria@') });
    const extras = aplicarErrosNoFormulario(form, { email: 'E-mail inválido', outro: 'Algo geral' });
    expect(form.controls.email.value).toBe('maria@');
    expect(form.controls.email.errors?.['servidor']).toBe('E-mail inválido');
    expect(extras).toEqual(['Algo geral']);
  });
});
