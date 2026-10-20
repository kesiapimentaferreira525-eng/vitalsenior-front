/**
 * Ambiente de DESENVOLVIMENTO (`ng serve`).
 *
 * Backend Java (Spring Boot) local:
 *  - padrão:            http://localhost:8080
 *  - IntelliJ (local):  http://localhost:8081  (SERVER_PORT da sua máquina)
 *
 * O backend já libera CORS para http://localhost:4200 por padrão.
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
};
