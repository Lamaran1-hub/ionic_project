import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private apiUri = 'http://localhost:3000/api/reservations';

  constructor(private http: HttpClient) {}

  private obtenirEntetes() {
    const token = localStorage.getItem('resa_token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  creer(donnees: any): Observable<any> {
    // Si l'utilisateur est hors-ligne, stocker la réservation localement pour envoi différé
    if (!navigator.onLine) {
      this.sauvegarderReservationHorsLigne(donnees);
      return of({
        horsLigne: true,
        message: 'Réservation enregistrée localement ! Elle sera synchronisée dès le retour d\'Internet.',
      });
    }

    return this.http.post<any>(this.apiUri, donnees, this.obtenirEntetes());
  }

  obtenirMesReservations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUri}/mes-reservations`, this.obtenirEntetes()).pipe(
      tap((res) => localStorage.setItem('resa_cache_mes_reservations', JSON.stringify(res))),
      catchError(() => {
        const cache = localStorage.getItem('resa_cache_mes_reservations');
        return of(cache ? JSON.parse(cache) : []);
      })
    );
  }

  obtenirEspaceHote(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUri}/espace-hote`, this.obtenirEntetes());
  }

  trouverParId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUri}/${id}`, this.obtenirEntetes());
  }

  annuler(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUri}/${id}/annuler`, {}, this.obtenirEntetes());
  }

  confirmer(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUri}/${id}/confirmer`, {}, this.obtenirEntetes());
  }

  // --- Gestion du mode Hors-ligne ---
  private sauvegarderReservationHorsLigne(donnees: any) {
    const fileAttente = localStorage.getItem('resa_offline_reservations');
    const reservations = fileAttente ? JSON.parse(fileAttente) : [];
    reservations.push({
      ...donnees,
      idTemporaire: `temp-${Date.now()}`,
      dateEnregistrement: new Date(),
    });
    localStorage.setItem('resa_offline_reservations', JSON.stringify(reservations));
  }

  obtenirReservationsHorsLigne(): any[] {
    const fileAttente = localStorage.getItem('resa_offline_reservations');
    return fileAttente ? JSON.parse(fileAttente) : [];
  }

  viderReservationsHorsLigne() {
    localStorage.removeItem('resa_offline_reservations');
  }
}
