import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header';
import { FooterComponent } from './shared/components/footer/footer';
import { AdminQuickAccessComponent } from './shared/components/admin-quick-access/admin-quick-access';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, AdminQuickAccessComponent],
  template: `
    <app-header></app-header>
    <main>
      <router-outlet />
    </main>
    <app-footer></app-footer>
    <app-admin-quick-access></app-admin-quick-access>
  `
})
export class App {}