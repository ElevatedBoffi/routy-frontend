
import { Component, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex items-end justify-between mb-8">
      <div>
        <h1 class="text-3xl font-bold text-slate-900 mb-2">My Trips</h1>
        <p class="text-slate-500">Manage your private groups and itineraries.</p>
      </div>
      <button (click)="showCreateModal.set(true)" class="bg-teal-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        New Trip
      </button>
    </div>

    <!-- Trips Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      @for (group of dataService.myGroups(); track group.id) {
        <div class="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 relative">
          
          <!-- Image Header -->
          <div class="h-32 bg-slate-200 relative overflow-hidden">
            <img [src]="group.image_url" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Group cover">
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            
            <!-- Badge -->
            <div class="absolute top-3 right-3">
               <span class="bg-slate-800/80 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md font-medium border border-white/10 flex items-center gap-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                 @if(group.is_private) { Private } @else { Public }
               </span>
            </div>

            <div class="absolute bottom-3 left-3 text-white">
              <h3 class="font-bold text-lg leading-tight">{{ group.name }}</h3>
            </div>
          </div>

          <!-- Actions -->
          <div class="p-4 flex items-center justify-between">
            <div class="text-xs text-slate-500">
               Created {{ group.created_at | date }}
            </div>

            <button [routerLink]="['/groups', group.id]" class="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 hover:text-teal-700 transition-colors">
              View Plan
            </button>
          </div>
        </div>
      }
      
      @if(dataService.myGroups().length === 0) {
        <div class="col-span-full text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
            <p class="text-slate-400 mb-2">You haven't planned any trips yet.</p>
            <button (click)="showCreateModal.set(true)" class="text-teal-600 font-bold hover:underline">Start your first adventure</button>
        </div>
      }
    </div>

    <!-- Create Modal -->
    @if (showCreateModal()) {
      <div class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
        <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
          <h2 class="text-2xl font-bold text-slate-900 mb-4">Create New Trip</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Trip Name</label>
              <input type="text" #nameInput placeholder="e.g. Summer in Italy" class="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all">
            </div>
          </div>

          <div class="flex gap-3 mt-8">
            <button (click)="showCreateModal.set(false)" class="flex-1 py-2.5 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors">Cancel</button>
            <button (click)="createGroup(nameInput.value)" class="flex-1 py-2.5 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors shadow-lg shadow-teal-500/30">Create Trip</button>
          </div>
        </div>
      </div>
    }
  `
})
export class GroupsComponent {
  dataService = inject(DataService);
  showCreateModal = signal(false);

  createGroup(name: string) {
    if (!name) return;
    this.dataService.createGroup(name, true); // Always private for now
    this.showCreateModal.set(false);
  }
}
