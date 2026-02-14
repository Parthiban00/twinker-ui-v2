import { Injectable } from '@angular/core';

const USER_KEY = 'auth-user';
const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  clean(): void {
    window.localStorage.clear();
  }

  public saveUser(user: any): void {
    window.localStorage.removeItem(USER_KEY);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getUser(): any {
    const user = window.localStorage.getItem(USER_KEY);
    if (user) {
      return JSON.parse(user);
    }

    return {};
  }

  public getItem(key: string): any {
    const item = window.localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    }
    return null;
  }

  public setItem(key: string, value: any): void {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  public saveToken(token: string): void {
    window.localStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string | null {
    return window.localStorage.getItem(TOKEN_KEY);
  }

  public removeToken(): void {
    window.localStorage.removeItem(TOKEN_KEY);
  }

  public isLoggedIn(): boolean {
    return !!window.localStorage.getItem(TOKEN_KEY);
  }
}
