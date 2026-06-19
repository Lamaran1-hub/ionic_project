import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonItem, IonIcon, IonLabel, IonList, IonSearchbar, IonCard,
  IonCardHeader, IonCardSubtitle, IonCardTitle, IonCardContent,
  IonModal, IonInput, IonToast, IonNote
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  restaurantOutline, wineOutline, locationOutline, timeOutline,
  peopleOutline, arrowBackOutline, bookOutline, closeOutline
} from 'ionicons/icons';
import { RestaurantService } from '../../services/restaurant.service';
import { AuthentificationService } from '../../services/authentification.service';

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonTitle, IonButton, IonItem, IonIcon, IonLabel, IonList,
    IonSearchbar, IonCard, IonCardHeader, IonCardSubtitle, IonCardTitle,
    IonCardContent, IonModal, IonInput, IonToast, IonNote
  ],
  template: `
    <ion-header class="resa-glass-header">
      <ion-toolbar>
        <ion-button slot="start" fill="clear" (click)="retourner()">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </ion-button>
        <ion-title>Restaurants & Tables</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="restaurant-container fade-in">
        <ion-searchbar
          placeholder="Rechercher par ville (ex: Conakry)"
          [(ngModel)]="rechercheVille"
          (ionInput)="filtrer()"
          class="custom-searchbar"
        ></ion-searchbar>

        <div class="listings">
          <ion-card *ngFor="let resto of restaurants" class="resa-glass-card list-card">
            <img [src]="resto.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'" class="card-img" />
            <ion-card-header>
              <ion-card-subtitle>{{ resto.horaires }}</ion-card-subtitle>
              <ion-card-title>{{ resto.nom }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><ion-icon name="location-outline"></ion-icon> {{ resto.adresse }}, {{ resto.ville }}</p>
              <p class="desc">{{ resto.description }}</p>
              
              <div class="action-row">
                <ion-button fill="outline" size="small" (click)="voirMenu(resto)">
                  <ion-icon name="wine-outline" slot="start"></ion-icon>
                  Voir Menu
                </ion-button>
                <ion-button class="btn-premium" size="small" (click)="ouvrirReservation(resto)">
                  Réserver Table
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <!-- Modal Réservation de Table -->
      <ion-modal [isOpen]="modalReservationOuvert" (didDismiss)="modalReservationOuvert = false" class="custom-modal">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>Réserver une Table</ion-title>
              <ion-button slot="end" fill="clear" (click)="modalReservationOuvert = false">
                <ion-icon name="close-outline"></ion-icon>
              </ion-button>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div *ngIf="restoSelectionne">
              <h3>{{ restoSelectionne.nom }}</h3>
              <p><ion-icon name="location-outline"></ion-icon> {{ restoSelectionne.adresse }}</p>
              
              <ion-item class="resa-input-item">
                <ion-label position="stacked">Date et Heure</ion-label>
                <ion-input type="datetime-local" [(ngModel)]="dateHeureResa"></ion-input>
              </ion-item>

              <ion-item class="resa-input-item">
                <ion-label position="stacked">Nombre de couverts</ion-label>
                <ion-input type="number" [(ngModel)]="nombreCouvertsResa"></ion-input>
              </ion-item>

              <ion-button expand="block" class="btn-premium marged-top" (click)="confirmerReservation()">
                Confirmer la Demande
              </ion-button>
            </div>
          </ion-content>
        </ng-template>
      </ion-modal>

      <!-- Modal Menu du Restaurant -->
      <ion-modal [isOpen]="modalMenuOuvert" (didDismiss)="modalMenuOuvert = false">
        <ng-template>
          <ion-header>
            <ion-toolbar>
              <ion-title>Menu</ion-title>
              <ion-button slot="end" fill="clear" (click)="modalMenuOuvert = false">
                <ion-icon name="close-outline"></ion-icon>
              </ion-button>
            </ion-toolbar>
          </ion-header>
          <ion-content class="ion-padding">
            <div *ngIf="restoSelectionne">
              <h2 class="menu-title">{{ restoSelectionne.nom }}</h2>
              <ion-list>
                <ion-item *ngFor="let plat of restoSelectionne.menus" lines="inset">
                  <ion-label>
                    <h2>{{ plat.nom }}</h2>
                    <p>{{ plat.description }}</p>
                  </ion-label>
                  <ion-note slot="end" class="price-note">{{ plat.prix | number }} GNF</ion-note>
                </ion-item>
              </ion-list>
            </div>
          </ion-content>
        </ng-template>
      </ion-modal>

      <ion-toast
        [isOpen]="toastOuvert"
        [message]="toastMessage"
        [duration]="2000"
        (didDismiss)="toastOuvert = false"
      ></ion-toast>
    </ion-content>
  `,
  styles: [`
    .restaurant-container {
      padding: 16px;
    }
    .custom-searchbar {
      --background: var(--ion-color-light);
      --border-radius: 12px;
      --box-shadow: none;
      padding: 0;
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
    .desc {
      color: var(--ion-color-medium);
      font-size: 0.9rem;
      margin: 8px 0 12px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .action-row {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid var(--resa-glass-border);
      padding-top: 12px;
    }
    .menu-title {
      font-weight: 800;
      color: var(--ion-color-primary);
      margin-bottom: 20px;
    }
    .price-note {
      font-weight: 700;
      color: var(--ion-color-secondary);
      font-size: 0.95rem;
    }
    .marged-top {
      margin-top: 24px;
    }
  `]
})
export class RestaurantPage implements OnInit {
  rechercheVille = '';
  restaurants: any[] = [];
  restoSelectionne: any = null;

  modalReservationOuvert = false;
  modalMenuOuvert = false;

  dateHeureResa = '';
  nombreCouvertsResa = 2;

  toastOuvert = false;
  toastMessage = '';

  constructor(
    private restaurantService: RestaurantService,
    private router: Router,
    private authService: AuthentificationService
  ) {
    addIcons({
      restaurantOutline, wineOutline, locationOutline, timeOutline,
      peopleOutline, arrowBackOutline, bookOutline, closeOutline
    });
  }

  ngOnInit() {
    this.chargerRestaurants();
  }

  chargerRestaurants() {
    this.restaurantService.obtenirTous(this.rechercheVille || undefined).subscribe({
      next: (res) => this.restaurants = res,
      error: (err) => console.error(err)
    });
  }

  filtrer() {
    this.chargerRestaurants();
  }

  voirMenu(resto: any) {
    this.restoSelectionne = resto;
    this.modalMenuOuvert = true;
  }

  ouvrirReservation(resto: any) {
    if (!this.authService.estConnecte()) {
      this.router.navigate(['/connexion'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.restoSelectionne = resto;
    this.modalReservationOuvert = true;
  }

  confirmerReservation() {
    if (!this.dateHeureResa) {
      this.toastMessage = 'Veuillez choisir une date et une heure';
      this.toastOuvert = true;
      return;
    }

    this.restaurantService.reserverTable(
      this.restoSelectionne.id,
      this.dateHeureResa,
      this.nombreCouvertsResa
    ).subscribe({
      next: () => {
        this.modalReservationOuvert = false;
        this.toastMessage = 'Demande de réservation envoyée avec succès !';
        this.toastOuvert = true;
      },
      error: (err) => {
        this.toastMessage = err.error.message || 'Une erreur est survenue';
        this.toastOuvert = true;
      }
    });
  }

  retourner() {
    this.router.navigate(['/accueil']);
  }
}
