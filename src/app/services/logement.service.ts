import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LogementService {
  private apiUri = 'http://localhost:3000/api/logements';

  constructor(private http: HttpClient) {}

  private obtenirEntetes() {
    const token = localStorage.getItem('resa_token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  trouverTous(ville?: string, prixMax?: number, dateDebut?: string, dateFin?: string): Observable<any[]> {
    let params: string[] = [];
    if (ville) params.push(`ville=${encodeURIComponent(ville)}`);
    if (prixMax) params.push(`prixMax=${prixMax}`);
    if (dateDebut) params.push(`dateDebut=${dateDebut}`);
    if (dateFin) params.push(`dateFin=${dateFin}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';

    return this.http.get<any[]>(`${this.apiUri}${query}`).pipe(
      // Mettre en cache local si la requête réussit
      tap((logements) => {
        localStorage.setItem('resa_cache_logements', JSON.stringify(logements));
      }),
      catchError(() => {
        // En cas de panne de réseau, renvoyer les données du cache local
        console.warn('Réseau indisponible, chargement des logements depuis le cache local.');
        const cache = localStorage.getItem('resa_cache_logements');
        return of(cache ? JSON.parse(cache) : []);
      })
    );
  }

  trouverParId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUri}/${id}`).pipe(
      tap((logement) => {
        localStorage.setItem(`resa_cache_logement_${id}`, JSON.stringify(logement));
      }),
      catchError(() => {
        console.warn(`Réseau indisponible, chargement des détails du logement ${id} depuis le cache.`);
        const cache = localStorage.getItem(`resa_cache_logement_${id}`);
        return of(cache ? JSON.parse(cache) : null);
      })
    );
  }

  obtenirMonEspace(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUri}/mon-espace`, this.obtenirEntetes());
  }

  creer(donnees: any): Observable<any> {
    return this.http.post<any>(this.apiUri, donnees, this.obtenirEntetes());
  }

  modifier(id: string, donnees: any): Observable<any> {
    return this.http.put<any>(`${this.apiUri}/${id}`, donnees, this.obtenirEntetes());
  }

  supprimer(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUri}/${id}`, this.obtenirEntetes());
  }

  obtenirDatesIndisponibles(id: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUri}/${id}/indisponibilites`).pipe(
      catchError(() => of([]))
    );
  }

  marquerDatesIndisponibles(id: string, dates: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiUri}/${id}/indisponibilites`, { dates }, this.obtenirEntetes());
  }
}
