import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonHeader, IonToolbar, IonButton, 
  IonIcon, IonItem, IonLabel, IonInput, IonToast 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  arrowBackOutline, star, locationOutline, homeOutline, 
  cashOutline, calendarOutline, checkmarkCircleOutline 
} from 'ionicons/icons';
import { LogementService } from '../../services/logement.service';
import { ReservationService } from '../../services/reservation.service';
import { AuthentificationService } from '../../services/authentification.service';

@Component({
  selector: 'app-details',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, 
    IonButton, IonIcon, IonItem, IonLabel, IonInput, IonToast
  ],
  template: `
    <ion-content [fullscreen]="true">
      <div *ngIf="logement" class="details-wrapper fade-in">
        
        <!-- Section Image de fond & retour -->
        <div class="hero-image-box">
          <img 
            [src]="logement.photos && logement.photos.length > 0 ? logement.photos[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'" 
            class="hero-img"
          />
          <div class="back-btn" (click)="retourner()">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </div>
        </div>

        <!-- Section Details -->
        <div class="content-box">
          <div class="meta-row">
            <span class="type">{{ logement.typeLogement | uppercase }}</span>
            <div class="rating">
              <ion-icon name="star"></ion-icon>
              <span>4.8 (24 avis)</span>
            </div>
          </div>

          <h1 class="nom-logement">{{ logement.nom }}</h1>

          <div class="location">
            <ion-icon name="location-outline"></ion-icon>
            <span>{{ logement.ville }}, Guinée</span>
          </div>

          <div class="divider"></div>

          <!-- Description -->
          <h3 class="section-title">À propos de cet hébergement</h3>
          <p class="description">{{ logement.description }}</p>

          <div class="divider"></div>

          <!-- Équipements Clés -->
          <h3 class="section-title">Ce que propose ce logement</h3>
          <div class="amenities-grid">
            <div class="amenity-item">
              <ion-icon name="checkmark-circle-outline"></ion-icon>
              <span>Électricité 24/7 (Solaire)</span>
            </div>
            <div class="amenity-item">
              <ion-icon name="checkmark-circle-outline"></ion-icon>
              <span>Eau Courante (Forage)</span>
            </div>
            <div class="amenity-item">
              <ion-icon name="checkmark-circle-outline"></ion-icon>
              <span>Climatisation</span>
            </div>
            <div class="amenity-item">
              <ion-icon name="checkmark-circle-outline"></ion-icon>
              <span>Wi-Fi inclus</span>
            </div>
          </div>

          <div class="divider"></div>

          <!-- Formulaire de Réservation -->
          <h3 class="section-title">Sélectionnez vos dates</h3>
          <div class="resa-glass-card dates-card">
            <div class="date-input-row">
              <ion-item lines="none" class="date-item">
                <ion-label position="stacked">Arrivée</ion-label>
                <ion-input type="date" [(ngModel)]="dateDebut" (ionChange)="calculerPrixTotal()"></ion-input>
              </ion-item>
              <ion-item lines="none" class="date-item">
                <ion-label position="stacked">Départ</ion-label>
                <ion-input type="date" [(ngModel)]="dateFin" (ionChange)="calculerPrixTotal()"></ion-input>
              </ion-item>
            </div>
          </div>

          <!-- Facture détaillée temporaire -->
          <div class="billing-details" *ngIf="nombreNuits > 0">
            <div class="bill-row">
              <span>{{ logement.prixParNuit | number }} GNF x {{ nombreNuits }} nuits</span>
              <span>{{ totalHebegement | number }} GNF</span>
            </div>
            <div class="bill-row">
              <span>Frais de plateforme (5%)</span>
              <span>{{ fraisService | number }} GNF</span>
            </div>
            <div class="bill-row total">
              <span>Total général</span>
              <span>{{ totalGeneral | number }} GNF</span>
            </div>
          </div>

          <!-- Bouton Action en bas -->
          <div class="action-footer">
            <div class="price-info">
              <span class="price-val">{{ logement.prixParNuit | number }} GNF</span>
              <span class="price-lbl">/ nuit</span>
            </div>
            <ion-button class="btn-premium action-btn" (click)="effectuerReservation()" [disabled]="nombreNuits <= 0">
              Réserver maintenant
            </ion-button>
          </div>
        </div>

      </div>

      <ion-toast 
        [isOpen]="toastOuvert" 
        [message]="toastMessage" 
        [duration]="2500" 
        (didDismiss)="toastOuvert = false"
        color="dark"
      ></ion-toast>
    </ion-content>
  `,
  styles: [`
    .hero-image-box {
      position: relative;
      height: 300px;
      width: 100%;
    }

    .hero-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .back-btn {
      position: absolute;
      top: 16px;
      left: 16px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #1e1e24;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      cursor: pointer;
    }

    .content-box {
      background: var(--ion-background-color);
      border-top-left-radius: 30px;
      border-top-right-radius: 30px;
      margin-top: -30px;
      position: relative;
      padding: 24px 20px 100px;
    }

    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .type {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--ion-color-primary);
      letter-spacing: 1px;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--ion-text-color);
      
      ion-icon {
        color: #ffc409;
      }
    }

    .nom-logement {
      font-size: 1.6rem;
      font-weight: 800;
      margin: 0 0 8px 0;
      color: var(--ion-text-color);
      line-height: 1.25;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.9rem;
      color: var(--ion-color-medium);
      font-weight: 500;
      
      ion-icon {
        color: var(--ion-color-primary);
      }
    }

    .divider {
      height: 1px;
      background: var(--ion-color-light-shade);
      margin: 20px 0;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 12px 0;
      color: var(--ion-text-color);
    }

    .description {
      font-size: 0.9rem;
      color: var(--ion-color-medium);
      line-height: 1.5;
      margin: 0;
    }

    .amenities-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .amenity-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--ion-color-medium);
      font-weight: 500;

      ion-icon {
        color: var(--ion-color-success);
        font-size: 1.1rem;
      }
    }

    .dates-card {
      padding: 12px;
    }

    .date-input-row {
      display: flex;
      gap: 10px;
    }

    .date-item {
      flex: 1;
      --background: var(--ion-color-light);
      --border-radius: 8px;
    }

    // Facturation
    .billing-details {
      background: var(--ion-color-light);
      border-radius: 12px;
      padding: 16px;
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bill-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--ion-color-medium);

      &.total {
        border-top: 1px solid var(--ion-color-light-shade);
        padding-top: 10px;
        margin-top: 4px;
        font-weight: 800;
        font-size: 1rem;
        color: var(--ion-text-color);
      }
    }

    // Pied de page fixe
    .action-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--resa-glass-bg);
      backdrop-filter: blur(20px);
      border-top: 1px solid var(--resa-glass-border);
      padding: 16px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 100;
    }

    .price-info {
      display: flex;
      flex-direction: column;
      
      .price-val {
        font-size: 1.25rem;
        font-weight: 800;
        color: var(--ion-color-primary);
      }
      .price-lbl {
        font-size: 0.75rem;
        color: var(--ion-color-medium);
      }
    }

    .action-btn {
      width: 60%;
      margin: 0;
    }
  `]
})
export class DetailsPage implements OnInit {
  logementId!: string;
  logement: any = null;

  dateDebut = '';
  dateFin = '';
  nombreNuits = 0;
  totalHebegement = 0;
  fraisService = 0;
  totalGeneral = 0;

  toastOuvert = false;
  toastMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private logementService: LogementService,
    private reservationService: ReservationService,
    private authService: AuthentificationService
  ) {
    addIcons({ 
      arrowBackOutline, star, locationOutline, homeOutline, 
      cashOutline, calendarOutline, checkmarkCircleOutline 
    });
  }

  ngOnInit() {
    this.logementId = this.route.snapshot.paramMap.get('id')!;
    this.chargerLogement();
  }

  chargerLogement() {
    this.logementService.trouverParId(this.logementId).subscribe({
      next: (data) => {
        this.logement = data;
      }
    });
  }

  calculerPrixTotal() {
    if (this.dateDebut && this.dateFin) {
      const d1 = new Date(this.dateDebut);
      const d2 = new Date(this.dateFin);
      const diffTime = d2.getTime() - d1.getTime();
      
      if (diffTime > 0) {
        this.nombreNuits = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        this.totalHebegement = this.nombreNuits * this.logement.prixParNuit;
        this.fraisService = Number((this.totalHebegement * 0.05).toFixed(2));
        this.totalGeneral = this.totalHebegement + this.fraisService;
      } else {
        this.nombreNuits = 0;
      }
    }
  }

  effectuerReservation() {
    if (!this.authService.estConnecte()) {
      this.router.navigate(['/inscription-rapide'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if (this.nombreNuits <= 0) {
      this.afficherToast('Sélectionnez des dates de séjour valides.');
      return;
    }

    const payload = {
      typeReservation: 'logement',
      referenceId: this.logementId,
      dateDebut: this.dateDebut,
      dateFin: this.dateFin,
      prixTotal: this.totalHebegement,
    };

    this.reservationService.creer(payload).subscribe({
      next: (res) => {
        if (res.horsLigne) {
          this.afficherToast(res.message);
          this.router.navigate(['/accueil']);
        } else {
          // Si en ligne, rediriger vers l'écran de paiement
          this.router.navigate([`/paiement/${res.id}`], {
            queryParams: {
              total: this.totalGeneral,
              libelle: `Réservation - ${this.logement.nom}`
            }
          });
        }
      },
      error: (err) => {
        this.afficherToast(err.error?.message || 'Erreur lors de la réservation.');
      }
    });
  }

  afficherToast(msg: string) {
    this.toastMessage = msg;
    this.toastOuvert = true;
  }

  retourner() {
    this.router.navigate(['/accueil']);
  }
}
