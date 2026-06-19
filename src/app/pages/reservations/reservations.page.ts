import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, 
  IonIcon, IonBadge, IonList, IonItem, IonLabel, IonToast 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  bedOutline, calendarOutline, walletOutline, 
  chatbubbleEllipsesOutline, arrowForwardOutline, alertCircleOutline 
} from 'ionicons/icons';
import { ReservationService } from '../../services/reservation.service';
import { TicketQrComponent } from '../../components/ticket-qr/ticket-qr.component';
import { SkeletonLoaderComponent } from '../../components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [
    CommonModule, IonContent, IonHeader, IonToolbar, IonTitle, 
    IonButton, IonIcon, IonBadge, IonList, IonItem, IonLabel, IonToast,
    TicketQrComponent, SkeletonLoaderComponent
  ],
  template: `
    <ion-content [fullscreen]="true">
      <div class="reservations-header fade-in">
        <h1 class="header-title">Mes Réservations</h1>
        <p class="header-subtitle">Consultez vos tickets et statuts de séjours</p>
      </div>

      <div class="content-wrapper">
        <!-- Skeleton loaders -->
        <div *ngIf="chargement">
          <app-skeleton-loader layout="carte" class="margin-bottom-card"></app-skeleton-loader>
          <app-skeleton-loader layout="carte"></app-skeleton-loader>
        </div>

        <!-- Aucun résultat -->
        <div class="empty-state fade-in" *ngIf="!chargement && reservations.length === 0">
          <ion-icon name="alert-circle-outline" class="empty-icon"></ion-icon>
          <h3>Aucune réservation</h3>
          <p>Vous n'avez pas encore effectué de réservation sur la plateforme.</p>
          <ion-button class="btn-premium" (click)="redirigerVers('accueil')">Explorer les hébergements</ion-button>
        </div>

        <!-- Liste des réservations -->
        <div *ngIf="!chargement && reservations.length > 0" class="resa-list">
          <div 
            class="resa-card-outer" 
            *ngFor="let resa of reservations"
            [class.expanded]="selectionneeId === resa.id"
          >
            <!-- En-tête de carte -->
            <div class="resa-summary-card resa-glass-card" (click)="basculerAffichage(resa.id)">
              <div class="left-box">
                <ion-icon name="calendar-outline" class="calendar-icon"></ion-icon>
                <div class="info">
                  <span class="ref">Réf: {{ resa.id.substring(0, 8) | uppercase }}</span>
                  <span class="dates">{{ formaterDate(resa.dateDebut) }} au {{ formaterDate(resa.dateFin) }}</span>
                </div>
              </div>
              <div class="right-box">
                <ion-badge [class]="'badge-resa statut-' + resa.statut">
                  {{ resa.statut | uppercase }}
                </ion-badge>
              </div>
            </div>

            <!-- Contenu étendu : Ticket & QR -->
            <div class="expanded-content" *ngIf="selectionneeId === resa.id">
              <app-ticket-qr [reservation]="resa"></app-ticket-qr>
              
              <!-- Actions supplémentaires -->
              <div class="card-actions" *ngIf="resa.statut !== 'annule'">
                <ion-button 
                  color="danger" 
                  fill="clear" 
                  class="cancel-btn" 
                  (click)="annulerReservation(resa.id)"
                >
                  Annuler la réservation
                </ion-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Basse Fixe Premium -->
      <div class="bottom-tab-bar">
        <div class="tab-item" (click)="redirigerVers('accueil')">
          <ion-icon name="bed-outline"></ion-icon>
          <span>Accueil</span>
        </div>
        <div class="tab-item active" (click)="redirigerVers('reservations')">
          <ion-icon name="calendar-outline"></ion-icon>
          <span>Résas</span>
        </div>
        <div class="tab-item" (click)="redirigerVers('portefeuille')">
          <ion-icon name="wallet-outline"></ion-icon>
          <span>Wallet</span>
        </div>
        <div class="tab-item" (click)="redirigerVers('chat')">
          <ion-icon name="chatbubble-ellipsesOutline"></ion-icon>
          <span>Chat</span>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .reservations-header {
      background: linear-gradient(to bottom, rgba(255, 74, 34, 0.1) 0%, transparent 100%);
      padding: 32px 20px 10px;
    }

    .header-title {
      font-size: 1.8rem;
      font-weight: 800;
      margin: 0;
      color: var(--ion-text-color);
    }

    .header-subtitle {
      font-size: 0.9rem;
      color: var(--ion-color-medium);
      margin: 6px 0 0 0;
    }

    .content-wrapper {
      padding: 16px 20px 90px;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--ion-color-medium);
      
      .empty-icon {
        font-size: 4rem;
        color: var(--ion-color-medium-shade);
        margin-bottom: 16px;
      }
      h3 {
        font-size: 1.25rem;
        font-weight: 700;
        color: var(--ion-text-color);
        margin: 0 0 8px 0;
      }
      p {
        font-size: 0.85rem;
        margin: 0 0 24px 0;
        line-height: 1.4;
      }
    }

    // Cartes Réservations
    .resa-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .resa-card-outer {
      display: flex;
      flex-direction: column;
    }

    .resa-summary-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      cursor: pointer;
    }

    .left-box {
      display: flex;
      align-items: center;
      gap: 12px;

      .calendar-icon {
        font-size: 1.6rem;
        color: var(--ion-color-primary);
      }

      .info {
        display: flex;
        flex-direction: column;
        
        .ref {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--ion-text-color);
        }
        .dates {
          font-size: 0.8rem;
          color: var(--ion-color-medium);
        }
      }
    }

    .statut-en_attente {
      --background: var(--ion-color-warning);
      color: #000;
    }
    .statut-confirme {
      --background: var(--ion-color-success);
      color: #fff;
    }
    .statut-annule {
      --background: var(--ion-color-danger);
      color: #fff;
    }

    .expanded-content {
      padding: 4px 0 16px;
    }

    .card-actions {
      display: flex;
      justify-content: flex-end;
      padding-top: 8px;
    }

    .cancel-btn {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: none;
    }

    // Navigation basse
    .bottom-tab-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 70px;
      background: var(--resa-glass-bg);
      backdrop-filter: blur(20px);
      border-top: 1px solid var(--resa-glass-border);
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: 1000;
      padding-bottom: 12px;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.03);
    }

    .tab-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      color: var(--ion-color-medium);
      cursor: pointer;

      ion-icon {
        font-size: 1.4rem;
      }
      span {
        font-size: 0.7rem;
        font-weight: 600;
      }

      &.active {
        color: var(--ion-color-primary);
      }
    }
  `]
})
export class ReservationsPage implements OnInit {
  reservations: any[] = [];
  chargement = false;
  selectionneeId: string | null = null;

  toastOuvert = false;
  toastMessage = '';

  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) {
    addIcons({ bedOutline, calendarOutline, walletOutline, chatbubbleEllipsesOutline, arrowForwardOutline, alertCircleOutline });
  }

  ngOnInit() {
    this.chargerReservations();
  }

  chargerReservations() {
    this.chargement = true;
    this.reservationService.obtenirMesReservations().subscribe({
      next: (data) => {
        this.reservations = data;
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
      }
    });
  }

  basculerAffichage(id: string) {
    if (this.selectionneeId === id) {
      this.selectionneeId = null;
    } else {
      this.selectionneeId = id;
    }
  }

  annulerReservation(id: string) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.chargement = true;
      this.reservationService.annuler(id).subscribe({
        next: () => {
          this.afficherToast('Réservation annulée avec succès.');
          this.chargerReservations();
        },
        error: (err) => {
          this.chargement = false;
          this.afficherToast(err.error?.message || 'Erreur lors de l\'annulation.');
        }
      });
    }
  }

  formaterDate(dateString: string): string {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }

  afficherToast(msg: string) {
    this.toastMessage = msg;
    this.toastOuvert = true;
  }

  redirigerVers(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
