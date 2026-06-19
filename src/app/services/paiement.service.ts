import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaiementService {
  private apiUri = 'http://localhost:3000/api/paiements';

  constructor(private http: HttpClient) {}

  private obtenirEntetes() {
    const token = localStorage.getItem('resa_token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  payer(reservationId: string, modePaiement: string, telephonePaiement?: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUri}/payer`,
      { reservationId, modePaiement, telephonePaiement },
      this.obtenirEntetes()
    );
  }

  validerOtp(referenceTransaction: string, codeOtp: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUri}/valider-otp`,
      { referenceTransaction, codeOtp },
      this.obtenirEntetes()
    );
  }

  deposerPortefeuille(montant: number, modePaiement: string, telephone: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUri}/depot-portefeuille`,
      { montant, modePaiement, telephone },
      this.obtenirEntetes()
    );
  }

  validerDepot(referenceTransaction: string, codeOtp: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUri}/valider-depot`,
      { referenceTransaction, codeOtp },
      this.obtenirEntetes()
    );
  }

  obtenirTransactions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUri}/transactions`, this.obtenirEntetes());
  }
}
