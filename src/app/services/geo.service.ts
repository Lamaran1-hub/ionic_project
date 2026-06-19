import { Injectable } from '@angular/core';

export interface Coordonnees {
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root',
})
export class GeoService {
  // Coordonnées par défaut de Conakry (Kaloum)
  private coordonneesDefaut: Coordonnees = { latitude: 9.537, longitude: -13.677 };

  // Cache en mémoire pour la dernière position connue
  private positionCachee: Coordonnees | null = null;

  async obtenirPositionActuelle(): Promise<Coordonnees> {
    if (this.positionCachee) {
      return this.positionCachee;
    }

    if (navigator.geolocation && navigator.onLine) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        });
        
        this.positionCachee = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        return this.positionCachee;
      } catch (e) {
        console.warn('[GEOLOCATION] Échec ou timeout. Retour des coordonnées de Conakry.');
        return this.coordonneesDefaut;
      }
    }

    return this.coordonneesDefaut;
  }

  // Calcul hors-ligne de la distance de Haversine (en km) entre deux points
  calculerDistance(pointA: Coordonnees, pointB: Coordonnees): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.toRad(pointB.latitude - pointA.latitude);
    const dLon = this.toRad(pointB.longitude - pointA.longitude);
    const lat1 = this.toRad(pointA.latitude);
    const lat2 = this.toRad(pointB.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Calculer la durée estimée de trajet (en minutes) à vitesse moyenne donnée (ex: 40km/h à Conakry en raison du trafic)
  calculerDureeTrajet(distanceKm: number, vitesseMoyenneKmh: number = 30): number {
    if (distanceKm <= 0) return 0;
    return Math.round((distanceKm / vitesseMoyenneKmh) * 60);
  }

  private toRad(valeur: number): number {
    return (valeur * Math.PI) / 180;
  }
}
