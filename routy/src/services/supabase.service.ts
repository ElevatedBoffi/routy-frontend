
import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  
  // Reactive Auth State
  user = signal<User | null>(null);

  constructor(private router: Router) {
    // ⚠️ INCOLLA QUI LE TUE CHIAVI SUPABASE ⚠️
    const SUPABASE_URL = 'https://bulfzajshlmcqeaqdiau.supabase.co';
    const SUPABASE_KEY = 'sb_publishable_zwUP7QZwh82lFawruk3P0A_SBBk0qnE';

    this.supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Check initial session
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.user.set(session?.user ?? null);
    });

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.user.set(session?.user ?? null);
      if (!session) {
        this.router.navigate(['/login']);
      }
    });
  }

  get client() {
    return this.supabase;
  }

  async signUp(email: string, password: string, username: string) {
    // Il trigger SQL creerà la riga nella tabella 'profiles' automaticamente
    return await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username } // Questo dato viene passato al trigger SQL
      }
    });
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({ email, password });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }
}
