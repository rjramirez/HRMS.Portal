import { Injectable, signal, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { supabase } from '../config/supabase.config';
import { User } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private _user = signal<User | null>(null);
  user = this._user.asReadonly();
  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds

  constructor(private router: Router) {
    // Check for existing session
    this.loadUser();
    
    // Listen for auth changes
    supabase.auth.onAuthStateChange((event, session) => {
      this._user.set(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        this.router.navigate(['/auth/login']);
        this.clearInactivityTimer();
      } else if (event === 'SIGNED_IN') {
        this.resetInactivityTimer();
      }
    });

    // Set up activity listeners
    this.setupActivityListeners();
  }

  ngOnDestroy() {
    this.clearInactivityTimer();
    window.removeEventListener('mousemove', this.resetInactivityTimer.bind(this));
    window.removeEventListener('keydown', this.resetInactivityTimer.bind(this));
  }

  private setupActivityListeners() {
    window.addEventListener('mousemove', this.resetInactivityTimer.bind(this));
    window.addEventListener('keydown', this.resetInactivityTimer.bind(this));
  }

  private resetInactivityTimer() {
    if (this._user()) {
      this.clearInactivityTimer();
      this.inactivityTimer = setTimeout(() => {
        console.log('User inactive for 1 hour, logging out...');
        this.signOut();
      }, this.INACTIVITY_TIMEOUT);
    }
  }

  private clearInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }
  }

  async loadUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      this._user.set(session?.user ?? null);
      
      if (session?.user) {
        this.resetInactivityTimer();
      }
    } catch (error) {
      console.error('Error loading user:', error);
      this._user.set(null);
    }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    this.resetInactivityTimer();
    return data;
  }

  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/auth/callback'
      }
    });

    if (error) throw error;
  }

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    this._user.set(null);
    this.clearInactivityTimer();
    this.router.navigate(['/auth/login']);
  }

  async updateProfile(profile: { avatar_url?: string; full_name?: string }) {
    const { data: { user }, error } = await supabase.auth.updateUser({
      data: profile
    });

    if (error) throw error;
    return user;
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  }

  async handleAuthCallback(): Promise<void> {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }

    if (!session) {
      throw new Error('No session found');
    }

    this._user.set(session.user);
    this.resetInactivityTimer();
  }
}
