import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonItem, IonIcon, IonLabel, IonList, IonSearchbar, IonSegment,
  IonSegmentButton, IonCard, IonCardHeader, IonCardSubtitle,
  IonCardTitle, IonCardContent, IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  carOutline, busOutline, searchOutline, locationOutline,
  addCircleOutline, cashOutline, arrowBackOutline
} from 'ionicons/icons';
import { TransportService } from '../../services/transport.service';
import { AuthentificationService } from '../../services/authentification.service';

@Component({
  selector: 'app-transport',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonTitle, IonButton, IonItem, IonIcon, IonLabel, IonList,
    IonSearchbar, IonSegment, IonSegmentButton, IonCard, IonCardHeader,
    IonCardSubtitle, IonCardTitle, IonCardContent, IonToast
  ],
  template: `
    <ion-header class="resa-glass-header">
      <ion-toolbar>
        <ion-button slot="start" fill="clear" (click)="retourner()">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </ion-button>
        <ion-title>Transports & Véhicules</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="transport-container fade-in">
        <ion-segment [(ngModel)]="typeFiltre" (ionChange)="changerType()" class="custom-segment">
          <ion-segment-button value="location">
            <ion-icon name="car-outline"></ion-icon>
            <ion-label>Location</ion-label>
          </ion-segment-button>
          <ion-segment-button value="trajet">
            <ion-icon name="bus-outline"></ion-icon>
            <ion-label>Trajets Bus/Taxi</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Barre de recherche -->
        <ion-searchbar
          placeholder="Où cherchez-vous ?"
          [(ngModel)]="recherche"
          (ionInput)="filtrer()"
          class="custom-searchbar"
        ></ion-searchbar>

        <!-- Bouton Proposer (Propriétaires) -->
        <div class="proposer-box" *ngIf="estProprietaire">
          <ion-button expand="block" class="btn-premium" (click)="proposer()">
            <ion-icon name="add-circle-outline" slot="start"></ion-icon>
            Proposer un véhicule / trajet
          </ion-button>
        </div>

        <div class="listings">
          <div *ngIf="typeFiltre === 'location'">
            <ion-card *ngFor="let vehicule of vehicules" class="resa-glass-card list-card">
              <img [src]="vehicule.images?.[0] || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=600&q=80'" class="card-img" />
              <ion-card-header>
                <ion-card-subtitle>{{ vehicule.marque }} — {{ vehicule.typeVehicule }}</ion-card-subtitle>
                <ion-card-title>{{ vehicule.nom }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p><ion-icon name="location-outline"></ion-icon> Ville: {{ vehicule.ville }}</p>
                <div class="price-row">
                  <span class="price-val">{{ vehicule.prixParJour | number }} GNF / jour</span>
                  <ion-button class="btn-premium" size="small" (click)="louer(vehicule)">
                    Louer
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          </div>

          <div *ngIf="typeFiltre === 'trajet'">
            <ion-card *ngFor="let trajet of trajets" class="resa-glass-card list-card">
              <ion-card-header>
                <ion-card-subtitle>Trajet planifié</ion-card-subtitle>
                <ion-card-title>{{ trajet.depart }} ➔ {{ trajet.destination }}</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <p>Départ le : {{ trajet.dateDepart | date:'short' }}</p>
                <p>Places libres : {{ trajet.placesTotales - trajet.placesReservees }} / {{ trajet.placesTotales }}</p>
                <div class="price-row">
                  <span class="price-val">{{ trajet.prix | number }} GNF</span>
                  <ion-button class="btn-premium" size="small" (click)="reserverTrajet(trajet)">
                    Réserver
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          </div>
        </div>
      </div>

      <ion-toast
        [isOpen]="toastOuvert"
        [message]="toastMessage"
        [duration]="2000"
        (didDismiss)="toastOuvert = false"
      ></ion-toast>
    </ion-content>
  `,
  styles: [`
    .transport-container {
      padding: 16px;
    }
    .custom-segment {
      margin-bottom: 16px;
      --background: var(--resa-glass-bg);
      border: 1px solid var(--resa-glass-border);
      border-radius: 12px;
    }
    .custom-searchbar {
      --background: var(--ion-color-light);
      --border-radius: 12px;
      --box-shadow: none;
      padding: 0;
      margin-bottom: 16px;
    }
    .proposer-box {
      margin-bottom: 16px;
    }
    .list-card {
      margin: 0 0 20px 0;
      overflow: hidden;
    }
    .card-img {
      width: 100%;
      height: 180px;
      object-fit: cover;
    }
    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
      border-top: 1px solid var(--resa-glass-border);
      padding-top: 12px;
    }
    .price-val {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--ion-color-primary);
    }
  `]
})
export class TransportPage implements OnInit {
  typeFiltre = 'location';
  recherche = '';
  estProprietaire = false;

  vehicules: any[] = [];
  trajets: any[] = [];

  toastOuvert = false;
  toastMessage = '';

  constructor(
    private transportService: TransportService,
    private router: Router,
    private authService: AuthentificationService
  ) {
    addIcons({
      carOutline, busOutline, searchOutline, locationOutline,
      addCircleOutline, cashOutline, arrowBackOutline
    });
  }

  ngOnInit() {
    this.estProprietaire = localStorage.getItem('role') === 'proprietaire' || localStorage.getItem('role') === 'agence';
    this.chargerDonnees();
  }

  chargerDonnees() {
    if (this.typeFiltre === 'location') {
      this.transportService.obtenirVehicules(this.recherche || undefined).subscribe({
        next: (res) => this.vehicules = res,
        error: (err) => console.error(err)
      });
    } else {
      this.transportService.rechercherTrajetsVehicule(this.recherche || undefined).subscribe({
        next: (res) => this.trajets = res,
        error: (err) => console.error(err)
      });
    }
  }

  changerType() {
    this.chargerDonnees();
  }

  filtrer() {
    this.chargerDonnees();
  }

  louer(vehicule: any) {
    if (!this.authService.estConnecte()) {
      this.router.navigate(['/connexion'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.router.navigate([`/paiement/location-${vehicule.id}`], {
      queryParams: {
        total: vehicule.prixParJour,
        libelle: `Location ${vehicule.marque} ${vehicule.nom}`,
        type: 'transport'
      }
    });
  }

  reserverTrajet(trajet: any) {
    if (!this.authService.estConnecte()) {
      this.router.navigate(['/connexion'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.router.navigate([`/paiement/trajet-${trajet.id}`], {
      queryParams: {
        total: trajet.prix,
        libelle: `Trajet ${trajet.depart} ➔ ${trajet.destination}`,
        type: 'transport'
      }
    });
  }

  proposer() {
    this.toastMessage = "Fonctionnalité disponible très bientôt !";
    this.toastOuvert = true;
  }

  retourner() {
    this.router.navigate(['/accueil']);
  }
}
