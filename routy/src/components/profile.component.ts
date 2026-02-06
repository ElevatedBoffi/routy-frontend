
import { Component, inject, computed } from '@angular/core';
import { DataService } from '../services/data.service';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <div class="relative mb-20 px-4 md:px-0">
      <!-- Cover -->
      <div class="h-48 bg-gradient-to-r from-teal-500 to-blue-600 rounded-b-3xl -mx-4 md:rounded-3xl md:mx-0"></div>
      
      <!-- Avatar Card with Upload -->
      <div class="absolute -bottom-16 left-0 right-0 px-6 flex justify-center">
        <div class="relative group cursor-pointer" (click)="fileInput.click()" title="Click to upload new avatar">
          <div class="bg-white p-2 rounded-full shadow-xl">
             @if (user()?.avatar_url) {
               <img [src]="user()?.avatar_url" class="w-32 h-32 rounded-full object-cover border-4 border-white bg-slate-100" alt="Avatar">
             } @else {
               <div class="w-32 h-32 rounded-full bg-slate-100 flex items-center justify-center text-4xl font-bold text-slate-700 border-4 border-white">
                 {{ user()?.avatar_initial }}
               </div>
             }
          </div>
          
          <!-- Overlay -->
          <div class="absolute inset-0 m-2 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
          </div>
          
          <!-- Hidden Input -->
          <input #fileInput type="file" class="hidden" accept="image/*" (change)="onFileSelected($event)">
        </div>
      </div>
    </div>

    <!-- Info -->
    <div class="text-center mb-8 px-4">
      <h1 class="text-2xl font-bold text-slate-900">{{ user()?.username || 'Loading...' }}</h1>
      <p class="text-slate-500">Travel Enthusiast & Explorer</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-10 px-4">
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
        <div class="text-2xl font-bold text-teal-600">{{ user()?.trips_count || 0 }}</div>
        <div class="text-xs text-slate-500 uppercase tracking-wide font-medium">Trips</div>
      </div>
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 text-center">
        <div class="text-2xl font-bold text-teal-600">{{ user()?.friend_count || 0 }}</div>
        <div class="text-xs text-slate-500 uppercase tracking-wide font-medium">Friends</div>
      </div>
    </div>

    <!-- Settings -->
    <div class="px-4 pb-8">
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <button class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100">
          <span class="text-slate-700 font-medium">Account Settings</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-400"><path d="m9 18 6-6-6-6"/></svg>
        </button>
        <button (click)="logout()" class="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-red-50 hover:text-red-600 text-red-500 transition-colors">
          <span class="font-medium">Logout</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
        </button>
      </div>
    </div>
  `
})
export class ProfileComponent {
  dataService = inject(DataService);
  supabase = inject(SupabaseService);
  router = inject(Router);

  // Use a computed signal for safe access
  user = this.dataService.currentUserProfile;

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      try {
        const url = await this.dataService.uploadImage(input.files[0]);
        await this.dataService.updateUserAvatar(url);
      } catch (e) {
        console.error("Upload failed", e);
        alert("Failed to upload image. Make sure you created the 'images' bucket in Supabase!");
      }
    }
  }

  async logout() {
    await this.supabase.signOut();
    this.router.navigate(['/login']);
  }
}
