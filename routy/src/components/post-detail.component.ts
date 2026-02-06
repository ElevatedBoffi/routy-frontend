
import { Component, inject, signal, effect } from '@angular/core';
import { DataService, Post } from '../services/data.service';
import { AiService } from '../services/ai.service';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (post(); as p) {
      <div class="mb-6">
        <a routerLink="/" class="text-slate-500 hover:text-teal-600 flex items-center gap-1 text-sm font-medium mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to Feed
        </a>
      </div>

      <article class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <!-- Hero Image -->
        <div class="aspect-video w-full bg-slate-200 relative">
          <img [src]="p.image_url" class="w-full h-full object-cover" alt="Post cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
          
          <div class="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 class="text-3xl md:text-4xl font-bold mb-2 leading-tight">{{ p.title }}</h1>
            <div class="flex items-center gap-2 text-sm opacity-90">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ p.location }}
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="p-6">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-lg text-slate-600">
                {{ p.author_initial }}
              </div>
              <div>
                <h3 class="font-bold text-slate-900">{{ p.author_name }}</h3>
                <p class="text-xs text-slate-500">Posted just now</p>
              </div>
            </div>
            
            <button class="bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-slate-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
              Save to Trip
            </button>
          </div>

          <!-- The Text -->
          <div class="prose prose-slate max-w-none mb-8">
             <p class="text-lg leading-relaxed text-slate-700">
               {{ currentText() }}
             </p>
          </div>
          
          <!-- Translation Widget -->
          <div class="bg-gradient-to-r from-slate-50 to-white rounded-xl p-4 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div class="flex items-center gap-3">
               <div class="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
               </div>
               <div>
                 <h4 class="font-bold text-slate-900">AI Magic Translation</h4>
                 <p class="text-xs text-slate-500">Instantly translate this experience.</p>
               </div>
             </div>

             <div class="flex gap-2">
               @if (aiService.isTranslating()) {
                 <div class="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-500 rounded-lg text-sm font-medium">
                   <svg class="animate-spin h-4 w-4 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                   </svg>
                   Translating...
                 </div>
               } @else {
                 <button (click)="translate('English')" class="px-4 py-2 bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 rounded-lg text-sm font-medium transition-all shadow-sm">
                   To English
                 </button>
                 <button (click)="translate('Italian')" class="px-4 py-2 bg-white border border-slate-200 hover:border-teal-500 hover:text-teal-600 rounded-lg text-sm font-medium transition-all shadow-sm">
                   To Italian
                 </button>
               }
             </div>
          </div>

        </div>
      </article>
    } @else {
      <div class="text-center py-20 text-slate-400">Loading post...</div>
    }
  `
})
export class PostDetailComponent {
  dataService = inject(DataService);
  aiService = inject(AiService);
  route = inject(ActivatedRoute);

  post = signal<Post | undefined>(undefined);
  currentText = signal('');

  constructor() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
         // In real app, this would be an async fetch
         const found = this.dataService.posts().find(p => p.id === id);
         if (found) {
            this.post.set(found);
            this.currentText.set(found.content);
         }
      }
    });
  }

  async translate(lang: string) {
    const p = this.post();
    if (!p) return;
    
    // Call Mock AI Service
    const translated = await this.aiService.translatePost(p.content, lang);
    this.currentText.set(translated);
  }
}
