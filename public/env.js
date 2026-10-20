/*
 * Configuração de ambiente em tempo de execução.
 *
 * Este arquivo NÃO é compilado: pode ser editado/substituído no servidor de
 * deploy (Nginx, Docker, Apache, Tomcat etc.) para apontar o frontend para a
 * API Java correta sem precisar gerar um novo build.
 *
 * Deixe apiUrl vazio ("") para usar o valor do arquivo environment*.ts.
 *
 * Exemplo produção:
 *   window.__VITALSENIOR_ENV__ = { apiUrl: "https://api.vitalsenior.com.br" };
 */
window.__VITALSENIOR_ENV__ = {
  apiUrl: ""
};
