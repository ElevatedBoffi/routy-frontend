
import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { SupabaseService } from './supabase.service';

// --- Interfaces matching DB ---
export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  bio?: string;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  content: string; 
  image_url: string;
  location: string;
  lat: number; 
  lng: number; 
  rating: number;
  likes_count: number;
  created_at: string;
  // Joins
  profiles?: Profile; // The author
}

export interface Group {
  id: string;
  name: string;
  owner_id: string;
  image_url?: string;
  is_private: boolean;
  start_date?: string;
  created_at?: string;
  itinerary_posts?: string[];
}

export interface FriendRequest {
  id: string;
  requester: Profile;
  status: 'pending' | 'accepted';
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private supabase = inject(SupabaseService);

  // --- State Signals ---
  currentUserProfile = signal<Profile | null>(null);
  posts = signal<Post[]>([]); // Global feed
  myGroups = signal<Group[]>([]); // Groups I am a member of
  friends = signal<Profile[]>([]); // My accepted friends
  friendRequests = signal<FriendRequest[]>([]); // Pending requests

  constructor() {
    // Auto-fetch data when user logs in
    effect(() => {
      const user = this.supabase.user();
      if (user) {
        this.initData(user.id);
      } else {
        // Clear data on logout
        this.posts.set([]);
        this.myGroups.set([]);
        this.friends.set([]);
        this.currentUserProfile.set(null);
      }
    });
  }

  async initData(userId: string) {
    await Promise.all([
      this.fetchProfile(userId),
      this.fetchPosts(),
      this.fetchMyGroups(),
      this.fetchFriends()
    ]);
  }

  // --- 1. PROFILES ---
  async fetchProfile(userId: string) {
    const { data } = await this.supabase.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) this.currentUserProfile.set(data);
  }

  async uploadImage(file: File): Promise<string> {
    const user = this.supabase.user();
    if (!user) throw new Error("Not logged in");
    const filePath = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await this.supabase.client.storage.from('images').upload(filePath, file);
    if (error) throw error;
    const { data } = this.supabase.client.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async updateUserAvatar(url: string) {
    const user = this.supabase.user();
    if (!user) return;
    await this.supabase.client.from('profiles').update({ avatar_url: url }).eq('id', user.id);
    this.fetchProfile(user.id);
  }

  // --- 2. POSTS (Feed) ---
  async fetchPosts() {
    // Get posts with author details
    const { data } = await this.supabase.client
      .from('posts')
      .select(`
        *,
        profiles:author_id ( id, username, avatar_url )
      `)
      .order('created_at', { ascending: false });
    
    if (data) this.posts.set(data);
  }

  async addPost(title: string, content: string, location: string, lat: number, lng: number, imageUrl?: string) {
    const user = this.supabase.user();
    if (!user) return;
    const { error } = await this.supabase.client.from('posts').insert({
      author_id: user.id,
      title,
      content,
      location,
      lat,
      lng,
      image_url: imageUrl,
      rating: 5 // Default for now
    });
    if (!error) this.fetchPosts();
  }

  // --- 3. GROUPS (Private & Shared) ---
  async fetchMyGroups() {
    const user = this.supabase.user();
    if (!user) return;

    // RLS Policy ensures we only see groups we are members of
    const { data } = await this.supabase.client
      .from('groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) this.myGroups.set(data);
  }

  async createGroup(name: string, isPrivate: boolean) {
    const user = this.supabase.user();
    if (!user) return;

    // 1. Create Group
    const { data: groupData, error } = await this.supabase.client
      .from('groups')
      .insert({
        owner_id: user.id,
        name,
        is_private: isPrivate,
        image_url: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`
      })
      .select()
      .single();

    if (error || !groupData) return;

    // 2. Add creator as Admin Member (Trigger logic could do this, but manual is safer for now)
    await this.supabase.client.from('group_members').insert({
      group_id: groupData.id,
      user_id: user.id,
      role: 'admin'
    });

    this.fetchMyGroups();
  }

  // --- 4. FRIENDSHIPS ---
  async fetchFriends() {
    const user = this.supabase.user();
    if (!user) return;

    // Fetch accepted friendships where I am sender OR receiver
    // Note: This is simplified. In a real large app, you might structure this differently.
    const { data } = await this.supabase.client
      .from('friendships')
      .select(`
        id,
        requester:requester_id(id, username, avatar_url),
        receiver:receiver_id(id, username, avatar_url)
      `)
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},receiver_id.eq.${user.id}`);

    if (data) {
      const friendList = data.map((f: any) => {
        return f.requester.id === user.id ? f.receiver : f.requester;
      });
      this.friends.set(friendList);
    }
  }

  // --- Helpers ---
  getPostById(id: string) {
    return computed(() => this.posts().find(p => p.id === id));
  }
}
