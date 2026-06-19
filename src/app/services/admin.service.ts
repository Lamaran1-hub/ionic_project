import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:3000/api/admin';

  constructor(private http: HttpClient) {}

  obtenirTousUtilisateurs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/utilisateurs`);
  }

  modifierRoleUtilisateur(id: string, role: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/utilisateurs/${id}/role`, { role });
  }

  validerLogement(id: string, disponible: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/logements/${id}/validation`, { disponible });
  }

  validerVehicule(id: string, disponible: boolean): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/vehicules/${id}/validation`, { disponible });
  }

  obtenirAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`);
  }
}
