import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OrcamentoComponent } from './pages/orcamento/orcamento.component';
import { LancamentosComponent } from './pages/lancamentos/lancamentos.component';
import { ParceriasComponent } from './pages/parcerias/parcerias.component';
import { BrindesComponent } from './pages/brindes/brindes.component';
import { ConfiguracoesComponent } from './pages/configuracoes/configuracoes.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    component: DashboardComponent
  },
  {
    path: 'orcamento',
    canActivate: [authGuard],
    component: OrcamentoComponent
  },
  {
    path: 'lancamentos',
    canActivate: [authGuard],
    component: LancamentosComponent
  },
  {
    path: 'parcerias',
    canActivate: [authGuard],
    component: ParceriasComponent
  },
  {
    path: 'brindes',
    canActivate: [authGuard],
    component: BrindesComponent
  },
  {
    path: 'configuracoes',
    canActivate: [authGuard, adminGuard],
    component: ConfiguracoesComponent
  },
  {
    path: 'usuarios',
    canActivate: [authGuard, adminGuard],
    component: UsuariosComponent
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
