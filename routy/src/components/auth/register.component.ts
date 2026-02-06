
import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div class="text-center mb-8">
           <h1 class="text-2xl font-bold text-slate-900">Join Routy</h1>
           <p class="text-slate-500">Start planning your next adventure</p>
        </div>

        <div class="space-y-4">
           <div>
             <label class="block text-sm font-bold text-slate-700 mb-1">Username</label>
             <input #username type="text" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" placeholder="TravelerOne">
           </div>

           <div>
             <label class="block text-sm font-bold text-slate-700 mb-1">Email</label>
             <input #email type="email" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" placeholder="you@example.com">
           </div>
           
           <div>
             <label class="block text-sm font-bold text-slate-700 mb-1">Password</label>
             <input #password type="password" class="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all" placeholder="••••••••">
           </div>

           @if (error()) {
             <div class="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
               {{ error() }}
             </div>
           }

           <button (click)="register(email.value, password.value, username.value)" class="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-teal-500/30 flex justify-center items-center gap-2">
             @if (isLoading()) {
               <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
             }
             Create Account
           </button>
        </div>

        <p class="text-center text-slate-500 text-sm mt-6">
          Already have an account? <a routerLink="/login" class="text-teal-600 font-bold hover:underline">Sign In</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  supabase = inject(SupabaseService);
  router = inject(Router);
  
  isLoading = signal(false);
  error = signal('');

  async register(email: string, pass: string, username: string) {
    this.isLoading.set(true);
    this.error.set('');
    
    if(!username) {
        this.error.set('Username is required');
        this.isLoading.set(false);
        return;
    }

    const { error } = await this.supabase.signUp(email, pass, username);
    
    this.isLoading.set(false);
    if (error) {
      this.error.set(error.message);
    } else {
      this.router.navigate(['/']);
    }
  }
}
