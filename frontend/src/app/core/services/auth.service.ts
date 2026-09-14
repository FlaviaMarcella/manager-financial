import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, Usuario } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'sb_finance_token';
  private readonly USER_KEY = 'sb_finance_user';

  private currentUserSignal = signal<Usuario | null>(this.getStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.papel === 'ADMIN');
  readonly isViewer = computed(() => this.currentUserSignal()?.papel === 'VIEWER');

  constructor(private http: HttpClient, private router: Router) {}

  loginWithGoogle(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/google', { token }).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  getCurrentUserFromServer(): Observable<Usuario> {
    return this.http.get<Usuario>('/api/auth/me').pipe(
      tap(user => {
        this.currentUserSignal.set(user);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      })
    );
  }

  logout() {
    this.clearSession();
    this.http.post('/api/auth/logout', {}).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setSession(authResponse: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, authResponse.token);
    const user: Usuario = {
      id: authResponse.id,
      nome: authResponse.nome,
      email: authResponse.email,
      papel: authResponse.papel,
      ativo: true
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  private getStoredUser(): Usuario | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }
}
