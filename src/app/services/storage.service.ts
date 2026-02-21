import { Injectable } from '@angular/core';

const USER_KEY = 'auth-user';
const TOKEN_KEY = 'auth-token';
const EATS_CART_KEY = 'eats-cart';
const MART_CART_KEY = 'mart-cart';
const ACTIVE_VERTICAL_KEY = 'active-vertical';

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

  // ── Vertical ────────────────────────────────────────────────
  public getActiveVertical(): 'eats' | 'mart' {
    return (window.localStorage.getItem(ACTIVE_VERTICAL_KEY) as 'eats' | 'mart') || 'eats';
  }

  public saveActiveVertical(vertical: 'eats' | 'mart'): void {
    window.localStorage.setItem(ACTIVE_VERTICAL_KEY, vertical);
  }

  // ── Eats Cart ───────────────────────────────────────────────
  public getEatsCart(): any[] {
    try { return JSON.parse(window.localStorage.getItem(EATS_CART_KEY) || '[]'); } catch { return []; }
  }

  public saveEatsCart(items: any[]): void {
    window.localStorage.setItem(EATS_CART_KEY, JSON.stringify(items));
  }

  public clearEatsCart(): void {
    window.localStorage.removeItem(EATS_CART_KEY);
  }

  // ── Mart Cart ───────────────────────────────────────────────
  public getMartCart(): any[] {
    try { return JSON.parse(window.localStorage.getItem(MART_CART_KEY) || '[]'); } catch { return []; }
  }

  public saveMartCart(items: any[]): void {
    window.localStorage.setItem(MART_CART_KEY, JSON.stringify(items));
  }

  public clearMartCart(): void {
    window.localStorage.removeItem(MART_CART_KEY);
  }

  // ── Cart by vertical (convenience) ─────────────────────────
  public getCartByVertical(vertical: 'eats' | 'mart'): any[] {
    return vertical === 'mart' ? this.getMartCart() : this.getEatsCart();
  }

  public saveCartByVertical(vertical: 'eats' | 'mart', items: any[]): void {
    if (vertical === 'mart') this.saveMartCart(items);
    else this.saveEatsCart(items);
  }

  public clearCartByVertical(vertical: 'eats' | 'mart'): void {
    if (vertical === 'mart') this.clearMartCart();
    else this.clearEatsCart();
  }
}
