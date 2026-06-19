import { Injectable } from '@nestjs/common'; // wait, this is frontend, should use Angular Injectable
// Let's write standard Angular Injectable.
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PromotionService {
  private apiUrl = 'http://localhost:3000/api/promotions';

  constructor(private http: HttpClient) {}

  validerEtAppliquer(code: string, montant: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/valider`, { code, montant });
  }

  obtenirToutes(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  creer(donnees: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, donnees);
  }

  supprimer(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
