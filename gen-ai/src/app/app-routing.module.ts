import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './auth.guard';
import { ChatComponent } from './components/homepage/chat.component';
 import { KpiComponent } from './components/kpi/kpi.component';
import { SearchComponent } from './components/search/search.component';


const routes: Routes = [
  { path: '', component: LoginComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent, pathMatch: 'full' },
 // { path: 'chatscreen', component: ChatComponent, canActivate: [AuthGuard] },
  //{path: 'kpi', component: KpiComponent, canActivate: [AuthGuard]},
  { path: 'search', component: SearchComponent, canActivate: [AuthGuard] },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
