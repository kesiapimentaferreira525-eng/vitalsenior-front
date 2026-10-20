import { Routes } from '@angular/router';

import { authGuard, visitanteGuard } from './core/auth/auth.guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Área pública
  {
    path: '',
    loadComponent: () => import('./layout/public-layout.component').then((m) => m.PublicLayoutComponent),
    canActivate: [visitanteGuard],
    children: [
      {
        path: 'login',
        title: 'Entrar · VitalSênior',
        loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'cadastro',
        title: 'Criar conta · VitalSênior',
        loadComponent: () => import('./features/auth/cadastro.component').then((m) => m.CadastroComponent),
      },
    ],
  },

  // Área autenticada
  {
    path: 'app',
    loadComponent: () => import('./layout/app-shell.component').then((m) => m.AppShellComponent),
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Resumo · VitalSênior',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'medicoes/nova',
        title: 'Registrar medição · VitalSênior',
        loadComponent: () =>
          import('./features/medicoes/nova-medicao.component').then((m) => m.NovaMedicaoComponent),
      },
      {
        path: 'historico',
        title: 'Histórico · VitalSênior',
        loadComponent: () =>
          import('./features/medicoes/historico.component').then((m) => m.HistoricoComponent),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
