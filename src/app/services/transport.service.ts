import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransportService {
  private apiUrl = 'http://localhost:3000/api/transports';

  constructor(private http: HttpClient) {}

  // Bus, Taxi, Chauffeurs
  rechercherTrajets(depart?: string, destination?: string, type?: string): Observable<any[]> {
    const params: any = {};
    if (depart) params.depart = depart;
    if (destination) params.destination = destination;
    if (type) params.type = type;
    return this.http.get<any[]>(this.apiUrl, { params });
  }

  obtenirDetailTrajet(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/detail/${id}`);
  }

  creerTrajetDirect(donnees: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, donnees);
  }

  // Voitures de location
  obtenirVehicules(ville?: string, disponible = true): Observable<any[]> {
    const params: any = { disponible: disponible.toString() };
    if (ville) params.ville = ville;
    return this.http.get<any[]>(`${this.apiUrl}/vehicules`, { params });
  }

  obtenirVehiculeParId(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vehicules/${id}`);
  }

  enregistrerVehicule(donnees: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/vehicules`, donnees);
  }

  modifierVehicule(id: string, donnees: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/vehicules/${id}`, donnees);
  }

  supprimerVehicule(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/vehicules/${id}`);
  }

  // Trajets planifiés en véhicule
  rechercherTrajetsVehicule(depart?: string, destination?: string): Observable<any[]> {
    const params: any = {};
    if (depart) params.depart = depart;
    if (destination) params.destination = destination;
    return this.http.get<any[]>(`${this.apiUrl}/trajets/recherche`, { params });
  }

  creerTrajetVehicule(donnees: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/trajets`, donnees);
  }
}
