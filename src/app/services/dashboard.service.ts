import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = 'http://localhost:3000/api/dashboards';

  constructor(private http: HttpClient) {}

  obtenirStatsHotel(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/hotel`);
  }

  obtenirStatsTransport(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/transport`);
  }

  obtenirStatsRestaurant(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/restaurant`);
  }

  obtenirStatsEvenement(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/evenement`);
  }
}
