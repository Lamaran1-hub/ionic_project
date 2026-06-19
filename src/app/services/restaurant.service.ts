import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RestaurantService {
  private apiUrl = 'http://localhost:3000/api/restaurants';

  constructor(private http: HttpClient) {}

  obtenirTous(ville?: string): Observable<any[]> {
    const params: any = {};
    if (ville) params.ville = ville;
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  obtenirParId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  creer(donnees: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, donnees);
  }

  modifier(id: string, donnees: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, donnees);
  }

  supprimer(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  ajouterMenu(restaurantId: string, donnees: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${restaurantId}/menus`, donnees);
  }

  modifierMenu(menuId: string, donnees: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/menus/${menuId}`, donnees);
  }

  supprimerMenu(menuId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/menus/${menuId}`);
  }

  reserverTable(restaurantId: string, dateHeure: string, nombreCouverts: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${restaurantId}/reserver`, { dateHeure, nombreCouverts });
  }

  obtenirReservationsClient(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservations/client`);
  }

  modifierStatutReservation(id: string, statut: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/reservations/${id}/statut`, { statut });
  }
}
