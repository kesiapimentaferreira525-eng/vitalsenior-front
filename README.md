# VitalSênior — Frontend (Angular)

Interface web do VitalSênior, feita para conversar com o **backend Java (Spring Boot)** já existente,
seguindo a *Especificação do Frontend v1.0*.

- Angular 18 · componentes **standalone** · **Signals** · Reactive Forms · controle de fluxo `@if/@for`
- Sem dependências de UI de terceiros (CSS próprio, focado em acessibilidade para pessoas idosas)
- Nenhum código de servidor aqui: toda a regra de negócio fica no backend Java

## Requisitos

- Node.js 18.19+ (recomendado 20 ou 22)
- Backend VitalSênior rodando (padrão `http://localhost:8080`)

## Rodando localmente

```bash
npm install
npm start          # http://localhost:4200
```

O backend já libera CORS para `http://localhost:4200` (variável `CORS_ALLOWED_ORIGINS`).

### Apontar para outra porta (ex.: IntelliJ em 8081)

Edite `src/environments/environment.development.ts`:

```ts
apiUrl: 'http://localhost:8081',
```

O prefixo `/api/v1` é adicionado automaticamente (`src/app/core/config/api.config.ts`).

## Build de produção

```bash
npm run build      # saída em dist/vitalsenior-frontend/browser
```

A URL da API em produção pode ser trocada **sem novo build**, editando `env.js` na pasta publicada:

```js
window.__VITALSENIOR_ENV__ = { apiUrl: "https://api.seudominio.com.br" };
```

Lembre de incluir a origem do frontend em `CORS_ALLOWED_ORIGINS` no backend.

### Servindo junto com o Spring Boot (opcional)

Copie o conteúdo de `dist/vitalsenior-frontend/browser` para `src/main/resources/static` do backend.
Como as rotas são do lado do cliente (`/app/dashboard`, `/login`…), configure o Spring para
devolver `index.html` em rotas desconhecidas que não comecem com `/api`.
Nesse caso deixe `apiUrl` vazio no `env.js` e ajuste `environment.ts` para `apiUrl: ''` (mesma origem).

## Telas e rotas

| Rota                  | Tela              | Endpoint                         |
|-----------------------|-------------------|----------------------------------|
| `/login`              | Entrar            | `POST /api/v1/auth/login`        |
| `/cadastro`           | Criar conta       | `POST /api/v1/auth/register`     |
| `/app/dashboard`      | Resumo            | `GET /api/v1/dashboard`          |
| `/app/medicoes/nova`  | Registrar medição | `POST /api/v1/medicoes`          |
| `/app/historico`      | Histórico         | `GET /api/v1/medicoes`           |

## Estrutura

```
src/app/
  core/
    auth/        AuthService, authInterceptor (Bearer + 401/403), guards
    config/      URL base da API (environment + env.js)
    http/        normalização de erros (400/401/403/415/422/5xx/rede)
    models/      contratos TypeScript dos DTOs Java + rótulos
    services/    DashboardService, MedicoesService
  shared/        ícones, alerta, status (ícone + texto), erro de campo, pipes
  layout/        área pública e área autenticada (cabeçalho + navegação + Sair)
  features/
    auth/        login, cadastro
    dashboard/   resumo
    medicoes/    nova medição, histórico, gráfico complementar
```

## Decisões importantes

- **Sessão**: token + nome/e-mail/perfil em `sessionStorage` (some ao fechar a aba). A senha **nunca** é armazenada.
- **Sair**: o backend não tem logout/refresh; sair limpa a sessão local.
- **Sessão expirada**: guard lê o `exp` do JWT; qualquer 401/403 em rota privada limpa a sessão e volta ao login com aviso.
- **Erros 422**: mensagens de `messages` aparecem junto de cada campo, sem apagar o que foi digitado.
- **Status de alerta**: sempre exibido com ícone **e** texto (Normal / Atenção / Crítico), nunca só por cor.
- **Acessibilidade**: texto base 18 px, alvos ≥ 48 px, foco visível, labels em todos os campos, link “Pular para o conteúdo”, tabela que vira cartões no celular, respeito a `prefers-reduced-motion`. Fonte Atkinson Hyperlegible (criada para baixa visão).
- **Sem simulação**: nada de editar/excluir medição, trocar/recuperar senha ou gerenciar cuidadores — não existem endpoints para isso.

## Testes

```bash
npm test           # Karma + Jasmine (abre o Chrome)
npm run test:ci    # headless
```

Cobrem: normalização de erros, aplicação de erros 422 no formulário, envio do Bearer só em rotas privadas,
senha nunca armazenada e redirecionamento ao login em 401.
