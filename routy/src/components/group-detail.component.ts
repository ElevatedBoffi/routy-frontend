
import { Component, inject, signal, effect, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { DataService, Group, Post } from '../services/data.service';
import { ActivatedRoute, RouterLink } from '@angular/router';

// Declare Leaflet globally since it's loaded via CDN
declare const L: any;

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (group(); as g) {
      <div class="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-4">
        
        <!-- Left: Itinerary List -->
        <div class="w-full md:w-1/3 flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <!-- Header -->
          <div class="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
               <a routerLink="/groups" class="text-xs text-slate-400 hover:text-teal-600 flex items-center gap-1 mb-1">
                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                 My Trips
               </a>
               <h1 class="text-xl font-bold text-slate-900 leading-tight">{{ g.name }}</h1>
            </div>
            <button class="bg-teal-50 text-teal-600 p-2 rounded-lg hover:bg-teal-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
            </button>
          </div>

          <!-- Itinerary Items -->
          <div class="flex-1 overflow-y-auto p-4 space-y-4">
            @if (itineraryPosts().length > 0) {
              @for (post of itineraryPosts(); track post.id) {
                <div class="flex gap-3 group cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-200">
                   <!-- Number/Pin -->
                   <div class="flex flex-col items-center">
                     <div class="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                       {{ $index + 1 }}
                     </div>
                     <div class="w-0.5 h-full bg-slate-200 mt-2 rounded-full group-last:hidden"></div>
                   </div>
                   
                   <!-- Card -->
                   <div class="flex-1">
                      <div class="relative h-24 rounded-lg overflow-hidden mb-2">
                        <img [src]="post.image_url" class="w-full h-full object-cover" alt="Thumb">
                        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                           <h3 class="text-white font-bold text-sm leading-tight truncate">{{ post.title }}</h3>
                        </div>
                      </div>
                      <p class="text-xs text-slate-500 line-clamp-2 mb-1">{{ post.content }}</p>
                      <div class="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                        {{ post.location }}
                      </div>
                   </div>
                </div>
              }
            } @else {
              <div class="text-center py-10 px-4">
                <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <h3 class="font-medium text-slate-900">Itinerary Empty</h3>
                <p class="text-sm text-slate-500 mt-1">Browse the feed and click "Save to Trip" to add destinations here.</p>
                <a routerLink="/" class="mt-4 inline-block px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg shadow hover:bg-teal-700 transition-colors">Go to Feed</a>
              </div>
            }
          </div>
        </div>

        <!-- Right: Map -->
        <div class="w-full md:w-2/3 h-64 md:h-full bg-slate-200 rounded-xl shadow-inner border border-slate-300 overflow-hidden relative">
           <div #mapContainer class="w-full h-full z-10"></div>
           
           <!-- Map Controls (Mock) -->
           <div class="absolute top-4 right-4 z-[500] flex flex-col gap-2">
              <button class="bg-white p-2 rounded-lg shadow-md text-slate-600 hover:text-teal-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </button>
           </div>
        </div>

      </div>
    } @else {
      <div class="flex items-center justify-center h-64 text-slate-400">Loading trip details...</div>
    }
  `
})
export class GroupDetailComponent implements OnDestroy {
  dataService = inject(DataService);
  route = inject(ActivatedRoute);

  group = signal<Group | undefined>(undefined);
  itineraryPosts = signal<Post[]>([]);
  
  // Map References
  @ViewChild('mapContainer') mapContainer!: ElementRef;
  map: any;

  constructor() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        const foundGroup = this.dataService.myGroups().find(g => g.id === id);
        if (foundGroup) {
          this.group.set(foundGroup);
          
          // Hydrate itinerary
          const posts = (foundGroup.itinerary_posts || [])
            .map(pid => this.dataService.posts().find(p => p.id === pid))
            .filter((p): p is Post => !!p);
            
          this.itineraryPosts.set(posts);
        }
      }
    });

    // Effect to initialize/update map when view is ready and data exists
    effect(() => {
      const posts = this.itineraryPosts();
      // Use setTimeout to ensure DOM element is ready (basic hydration check)
      if (this.mapContainer && posts.length > -1) {
         setTimeout(() => this.initMap(), 100);
      }
    });
  }

  initMap() {
    if (this.map) {
      this.map.remove(); // Reset map if it exists
    }

    const posts = this.itineraryPosts();
    const defaultCenter = [41.9028, 12.4964]; // Rome default
    const center = posts.length > 0 ? [posts[0].lat, posts[0].lng] : defaultCenter;

    // Initialize Leaflet
    this.map = L.map(this.mapContainer.nativeElement).setView(center, 13);

    // Add OpenStreetMap Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Add Markers
    if (posts.length > 0) {
      const bounds = L.latLngBounds([]);
      
      posts.forEach((post, index) => {
        const marker = L.marker([post.lat, post.lng])
          .addTo(this.map)
          .bindPopup(`
            <div class="p-1">
              <b class="text-teal-700">${index + 1}. ${post.title}</b><br>
              <span class="text-xs text-gray-600">${post.location}</span>
            </div>
          `);
        
        bounds.extend([post.lat, post.lng]);
      });

      // Fit map to show all markers
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove();
    }
  }
}
