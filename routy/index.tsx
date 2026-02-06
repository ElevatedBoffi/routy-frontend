

import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './src/app.component';
import { provideZonelessChangeDetection, inject } from '@angular/core';
import { provideRouter, withHashLocation, Routes, Router, CanActivateFn } from '@angular/router';
import { SupabaseService } from './src/services/supabase.service';

// Components
import { HomeComponent } from './src/components/home.component';
import { GroupsComponent } from './src/components/groups.component';
import { ProfileComponent } from './src/components/profile.component';
import { PostDetailComponent } from './src/components/post-detail.component';
import { GroupDetailComponent } from './src/components/group-detail.component';
import { LoginComponent } from './src/components/auth/login.component';
import { RegisterComponent } from './src/components/auth/register.component';

// Guard: Protects routes that need login
const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const supabase = inject(SupabaseService);
  
  // Note: user() is a signal. In a real refresh scenario, 
  // you might need to wait for session init. 
  // For this applet, simplistic check is fine.
  if (!supabase.user()) {
    return router.createUrlTree(['/login']);
  }
  return true;
};

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'groups', component: GroupsComponent, canActivate: [authGuard] },
  { path: 'groups/:id', component: GroupDetailComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'post/:id', component: PostDetailComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withHashLocation())
  ]
}).catch(err => console.error(err));

// AI Studio always uses an `index.tsx` file for all project types.
