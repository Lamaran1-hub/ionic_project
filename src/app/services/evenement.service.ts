import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EvenementService {
  private apiUrl = 'http://localhost:3000/api/evenements';

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

  acheterTicket(evenementId: string, numeroSiege?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${evenementId}/reserver`, { numeroSiege });
  }

  obtenirTicketsClient(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tickets/client`);
  }

  scannerTicket(referenceQr: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tickets/scan`, { referenceQr });
  }
}
