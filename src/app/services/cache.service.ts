import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private dureeValiditeCache = 5 * 60 * 1000; // 5 minutes

  stocker(cle: string, valeur: any) {
    const entree = {
      valeur,
      dateExpiration: Date.now() + this.dureeValiditeCache,
    };
    localStorage.setItem(cle, JSON.stringify(entree));
  }

  recuperer(cle: string): any {
    const item = localStorage.getItem(cle);
    if (!item) return null;

    const entree = JSON.parse(item);
    if (Date.now() > entree.dateExpiration) {
      localStorage.removeItem(cle);
      return null;
    }
    return entree.valeur;
  }

  vider() {
    localStorage.clear();
  }
}
