import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private apiUrl = 'http://localhost:3000/api/notifications';

  constructor(private http: HttpClient) {}

  obtenirToutes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  marquerCommeLue(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/lu`, {});
  }

  marquerToutesCommeLues(): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/marquer-tout-lu`, {});
  }

  simulerEnvoi(titre: string, description: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tester`, { titre, description });
  }
}
