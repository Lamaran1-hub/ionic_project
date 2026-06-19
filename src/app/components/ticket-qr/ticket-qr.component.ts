import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon, IonBadge } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { qrCodeOutline, calendarOutline, cashOutline, bookmarkOutline } from 'ionicons/icons';

@Component({
  selector: 'app-ticket-qr',
  standalone: true,
  imports: [CommonModule, IonIcon, IonBadge],
  template: `
    <div class="ticket-container fade-in" *ngIf="reservation">
      <!-- Section Haute : Détails du Ticket -->
      <div class="ticket-header">
        <div class="ticket-type">
          <ion-icon name="bookmark-outline"></ion-icon>
          <span>Ticket Réservation</span>
        </div>
        <ion-badge [class]="'badge-resa statut-' + reservation.statut">
          {{ reservation.statut | uppercase }}
        </ion-badge>
      </div>

      <div class="ticket-body">
        <h2 class="title-ref">Réf: {{ reservation.id.substring(0, 8) | uppercase }}</h2>
        
        <div class="info-row">
          <div class="info-item">
            <span class="label">Date de début</span>
            <span class="value">{{ formaterDate(reservation.dateDebut) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Date de fin</span>
            <span class="value">{{ formaterDate(reservation.dateFin) }}</span>
          </div>
        </div>

        <div class="info-row separator">
          <div class="info-item">
            <span class="label">Type de service</span>
            <span class="value">{{ obtenirServiceLabel(reservation.typeReservation) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Montant payé</span>
            <span class="value price">{{ reservation.prixTotal | number }} GNF</span>
          </div>
        </div>
      </div>

      <!-- Ligne de Découpe Ticket -->
      <div class="ticket-stub-divider">
        <div class="notch left"></div>
        <div class="dashed-line"></div>
        <div class="notch right"></div>
      </div>

      <!-- Section Basse : Code QR -->
      <div class="ticket-qr-section">
        <div class="qr-box">
          <!-- Simulation de Code QR robuste avec un SVG matriciel pour un chargement hors-ligne garanti -->
          <svg viewBox="0 0 100 100" class="qr-svg" width="130" height="130">
            <rect width="100" height="100" fill="white" />
            
            <!-- Yeux de repère QR -->
            <!-- Haut Gauche -->
            <rect x="5" y="5" width="25" height="25" fill="black" />
            <rect x="10" y="10" width="15" height="15" fill="white" />
            <rect x="13" y="13" width="9" height="9" fill="black" />
            
            <!-- Haut Droite -->
            <rect x="70" y="5" width="25" height="25" fill="black" />
            <rect x="75" y="10" width="15" height="15" fill="white" />
            <rect x="78" y="13" width="9" height="9" fill="black" />

            <!-- Bas Gauche -->
            <rect x="5" y="70" width="25" height="25" fill="black" />
            <rect x="10" y="75" width="15" height="15" fill="white" />
            <rect x="13" y="78" width="9" height="9" fill="black" />

            <!-- Données Simulées (Motifs Aléatoires Uniques basés sur la référence) -->
            <rect x="35" y="5" width="10" height="5" fill="black" />
            <rect x="50" y="5" width="5" height="10" fill="black" />
            <rect x="60" y="10" width="5" height="5" fill="black" />
            <rect x="35" y="20" width="15" height="5" fill="black" />
            <rect x="55" y="25" width="10" height="10" fill="black" />

            <rect x="5" y="35" width="5" height="15" fill="black" />
            <rect x="15" y="40" width="10" height="5" fill="black" />
            <rect x="30" y="35" width="20" height="10" fill="black" />
            <rect x="55" y="45" width="5" height="15" fill="black" />
            <rect x="65" y="35" width="15" height="5" fill="black" />
            <rect x="85" y="40" width="10" height="10" fill="black" />

            <rect x="35" y="70" width="15" height="5" fill="black" />
            <rect x="55" y="75" width="5" height="20" fill="black" />
            <rect x="70" y="70" width="10" height="5" fill="black" />
            <rect x="85" y="80" width="10" height="15" fill="black" />
            <rect x="40" y="85" width="10" height="10" fill="black" />
          </svg>
        </div>
        <p class="qr-instructions">Présentez ce code QR lors du contrôle.</p>
      </div>
    </div>
  `,
  styles: [`
    .ticket-container {
      background: var(--ion-card-background, #ffffff);
      border-radius: 24px;
      box-shadow: 0 12px 30px rgba(0,0,0,0.06);
      border: 1px solid var(--resa-glass-border, rgba(0,0,0,0.05));
      overflow: hidden;
      margin: 16px 0;
    }

    .ticket-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 20px 10px;
    }

    .ticket-type {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: var(--ion-color-medium);
      font-size: 0.85rem;
      ion-icon {
        font-size: 1.1rem;
        color: var(--ion-color-primary);
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

    .ticket-body {
      padding: 0 20px 20px;
    }

    .title-ref {
      font-size: 1.6rem;
      font-weight: 800;
      margin: 4px 0 20px;
      color: var(--ion-text-color);
      letter-spacing: 1px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 16px;
      gap: 16px;
      
      &.separator {
        border-top: 1px solid var(--ion-color-light-shade);
        padding-top: 16px;
        margin-bottom: 0;
      }
    }

    .info-item {
      display: flex;
      flex-direction: column;
      flex: 1;

      .label {
        font-size: 0.75rem;
        color: var(--ion-color-medium);
        text-transform: uppercase;
        margin-bottom: 4px;
        letter-spacing: 0.5px;
      }
      .value {
        font-size: 0.95rem;
        font-weight: 600;
        color: var(--ion-text-color);
        
        &.price {
          color: var(--ion-color-primary);
          font-size: 1.1rem;
          font-weight: 700;
        }
      }
    }

    // Ligne pointillée découpée style ticket
    .ticket-stub-divider {
      position: relative;
      height: 20px;
      background: transparent;
      display: flex;
      align-items: center;

      .notch {
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--ion-background-color, #f4f5f8);
        border: 1px solid var(--resa-glass-border, rgba(0,0,0,0.05));
        
        &.left {
          left: -12px;
        }
        &.right {
          right: -12px;
        }
      }

      .dashed-line {
        flex: 1;
        height: 1px;
        border-top: 2px dashed var(--ion-color-light-shade);
        margin: 0 16px;
      }
    }

    .ticket-qr-section {
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--ion-color-light);
    }

    .qr-box {
      background: #ffffff;
      padding: 12px;
      border-radius: 16px;
      box-shadow: inset 0 2px 8px rgba(0,0,0,0.05);
      margin-bottom: 12px;
    }

    .qr-svg {
      display: block;
    }

    .qr-instructions {
      font-size: 0.8rem;
      color: var(--ion-color-medium);
      text-align: center;
      margin: 0;
    }
  `]
})
export class TicketQrComponent {
  @Input() reservation: any;

  constructor() {
    addIcons({ qrCodeOutline, calendarOutline, cashOutline, bookmarkOutline });
  }

  formaterDate(dateString: string): string {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  obtenirServiceLabel(type: string): string {
    switch (type) {
      case 'logement':
        return 'Hébergement';
      case 'transport':
        return 'Transport';
      case 'restaurant':
        return 'Table Restaurant';
      case 'evenement':
        return 'Entrée Événement';
      default:
        return type;
    }
  }
}
