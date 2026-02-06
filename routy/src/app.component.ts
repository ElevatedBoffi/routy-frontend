
import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DataService } from './services/data.service';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  dataService = inject(DataService);
  supabase = inject(SupabaseService);
  
  // Only show navbar if we have a user
  isLoggedIn = computed(() => !!this.supabase.user());
  
  // Safe access to profile data with fallbacks
  userProfile = computed(() => this.dataService.currentUserProfile() || { 
    avatar_initial: '?', 
    username: 'Guest' 
  });
}
