import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ReservationService } from './reservation.service';

@Injectable({
  providedIn: 'root',
})
export class SynchronisationService {
  private enLigneSujet = new BehaviorSubject<boolean>(navigator.onLine);
  public enLigne$ = this.enLigneSujet.asObservable();
  
  private synchroEnCoursSujet = new BehaviorSubject<boolean>(false);
  public synchroEnCours$ = this.synchroEnCoursSujet.asObservable();

  constructor(private reservationService: ReservationService) {
    this.initialiserEcouteurs();
  }

  private initialiserEcouteurs() {
    window.addEventListener('online', () => {
      this.enLigneSujet.next(true);
      this.synchroniserDonnees();
    });

    window.addEventListener('offline', () => {
      this.enLigneSujet.next(false);
    });
  }

  estEnLigne(): boolean {
    return this.enLigneSujet.value;
  }

  async synchroniserDonnees() {
    const reservationsHorsLigne = this.reservationService.obtenirReservationsHorsLigne();
    if (reservationsHorsLigne.length === 0 || this.synchroEnCoursSujet.value) {
      return;
    }

    console.log(`[SYNCHRONISATION] ${reservationsHorsLigne.length} réservations hors-ligne détectées. Lancement du processus...`);
    this.synchroEnCoursSujet.next(true);

    try {
      for (const reservation of reservationsHorsLigne) {
        // Retirer l'id temporaire avant envoi
        const { idTemporaire, dateEnregistrement, ...corps } = reservation;
        
        await new Promise<void>((resolve, reject) => {
          this.reservationService.creer(corps).subscribe({
            next: () => {
              console.log(`[SYNCHRONISATION] Réservation synchronisée avec succès.`);
              resolve();
            },
            error: (err) => {
              console.error(`[SYNCHRONISATION] Échec de synchronisation d'une réservation :`, err);
              // Résoudre quand même pour passer au suivant ou rejeter selon stratégie
              resolve();
            }
          });
        });
      }

      // Vider le cache de la file d'attente
      this.reservationService.viderReservationsHorsLigne();
      console.log('[SYNCHRONISATION] Processus de synchronisation terminé avec succès.');
    } catch (e) {
      console.error('[SYNCHRONISATION] Erreur générale lors de la synchronisation', e);
    } finally {
      this.synchroEnCoursSujet.next(false);
    }
  }
}
