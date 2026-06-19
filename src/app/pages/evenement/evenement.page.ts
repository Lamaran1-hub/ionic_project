import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonItem, IonIcon, IonLabel, IonList, IonSearchbar, IonSegment,
  IonSegmentButton, IonCard, IonCardHeader, IonCardSubtitle,
  IonCardTitle, IonCardContent, IonToast, IonInput, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline, qrCodeOutline, scanOutline, locationOutline,
  ticketOutline, arrowBackOutline, closeOutline, checkmarkCircleOutline
} from 'ionicons/icons';
import { EvenementService } from '../../services/evenement.service';
import { AuthentificationService } from '../../services/authentification.service';

@Component({
  selector: 'app-evenement',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonTitle, IonButton, IonItem, IonIcon, IonLabel, IonList,
    IonSearchbar, IonSegment, IonSegmentButton, IonCard, IonCardHeader,
    IonCardSubtitle, IonCardTitle, IonCardContent, IonToast, IonInput,
    IonModal
  ],
  template: `
    <ion-header class="resa-glass-header">
      <ion-toolbar>
        <ion-button slot="start" fill="clear" (click)="retourner()">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </ion-button>
        <ion-title>Sorties & Concerts</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="evenement-container fade-in">
        <ion-segment [(ngModel)]="ongletActif" (ionChange)="changerOnglet()" class="custom-segment">
          <ion-segment-button value="recherche">
            <ion-icon name="calendar-outline"></ion-icon>
            <ion-label>Découvrir</ion-label>
          </ion-segment-button>
          <ion-segment-button value="tickets">
            <ion-icon name="ticket-outline"></ion-icon>
            <ion-label>Mes Billets</ion-label>
          </ion-segment-button>
          <ion-segment-button value="organisateur" *ngIf="estOrganisateur">
            <ion-icon name="scan-outline"></ion-icon>
            <ion-label>Scanner</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- ONGLET DECOUVRIR -->
        <div *ngIf="ongletActif === 'recherche'">
          <ion-searchbar
            placeholder="Rechercher par ville (ex: Conakry)"
            [(ngModel)]="rechercheVille"
            (ionInput)="filtrer()"
            class="custom-searchbar"
          ></ion-searchbar>

          <ion-card *ngFor="let evt of evenements" class="resa-glass-card list-card">
            <img [src]="evt.images?.[0] || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=600&q=80'" class="card-img" />
            <ion-card-header>
              <ion-card-subtitle>{{ evt.dateEvenement | date:'short' }}</ion-card-subtitle>
              <ion-card-title>{{ evt.nom }}</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <p><ion-icon name="location-outline"></ion-icon> {{ evt.adresse }}, {{ evt.ville }}</p>
              <p class="desc">{{ evt.description }}</p>
              <div class="price-row">
                <span class="price-val">{{ evt.prixTicket | number }} GNF</span>
                <ion-button class="btn-premium" size="small" (click)="acheterBillet(evt)">
                  Prendre Billet
                </ion-button>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- ONGLET MES BILLETS -->
        <div *ngIf="ongletActif === 'tickets'">
          <div *ngIf="tickets.length === 0" class="empty-state">
            <p>Vous n'avez pas encore acheté de billet.</p>
          </div>

          <ion-card *ngFor="let t of tickets" class="resa-glass-card ticket-card">
            <ion-card-header>
              <ion-card-subtitle>Billet électronique</ion-card-subtitle>
              <ion-card-title>{{ t.evenement?.nom }}</ion-card-title>
            </ion-card-header>
            <ion-card-content class="ticket-body">
              <p><ion-icon name="calendar-outline"></ion-icon> {{ t.evenement?.dateEvenement | date:'short' }}</p>
              <p><ion-icon name="location-outline"></ion-icon> {{ t.evenement?.adresse }}</p>
              
              <div class="qr-container">
                <div class="qr-box">
                  <ion-icon name="qr-code-outline" class="qr-icon"></ion-icon>
                </div>
                <span class="qr-ref">{{ t.referenceQr }}</span>
                <span class="badge" [class]="t.statut">{{ t.statut | uppercase }}</span>
              </div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- ONGLET VALIDEUR/ORGANISATEUR -->
        <div *ngIf="ongletActif === 'organisateur'">
          <ion-card class="resa-glass-card list-card">
            <ion-card-header>
              <ion-card-title>Scanner / Valider un billet</ion-card-title>
            </ion-card-header>
            <ion-card-content>
              <ion-item class="resa-input-item">
                <ion-label position="stacked">Référence du code QR</ion-label>
                <ion-input type="text" [(ngModel)]="referenceScanner" placeholder="ex: EVT-1a2b-3c4d-9876"></ion-input>
              </ion-item>
              
              <ion-button expand="block" class="btn-premium marged-top" (click)="validerScanner()">
                <ion-icon name="checkmark-circle-outline" slot="start"></ion-icon>
                Composter le Billet
              </ion-button>
            </ion-card-content>
          </ion-card>
        </div>
      </div>

      <ion-toast
        [isOpen]="toastOuvert"
        [message]="toastMessage"
        [duration]="2500"
        (didDismiss)="toastOuvert = false"
      ></ion-toast>
    </ion-content>
  `,
  styles: [`
    .evenement-container {
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
      margin: 8px 0;
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
    .ticket-card {
      margin: 0 0 20px 0;
    }
    .ticket-body {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .qr-container {
      margin-top: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .qr-box {
      width: 130px;
      height: 130px;
      background: white;
      border: 2px solid var(--resa-glass-border);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--resa-shadow);
    }
    .qr-icon {
      font-size: 5rem;
      color: black;
    }
    .qr-ref {
      font-family: monospace;
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--ion-color-medium);
    }
    .badge {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .badge.valide {
      background: rgba(45, 211, 111, 0.15);
      color: var(--ion-color-success);
    }
    .badge.utilise {
      background: rgba(146, 154, 161, 0.15);
      color: var(--ion-color-medium);
    }
    .badge.annule {
      background: rgba(235, 68, 90, 0.15);
      color: var(--ion-color-danger);
    }
    .empty-state {
      padding: 40px;
      text-align: center;
      color: var(--ion-color-medium);
    }
    .marged-top {
      margin-top: 24px;
    }
  `]
})
export class EvenementPage implements OnInit {
  ongletActif = 'recherche';
  rechercheVille = '';
  estOrganisateur = false;

  evenements: any[] = [];
  tickets: any[] = [];

  referenceScanner = '';

  toastOuvert = false;
  toastMessage = '';

  constructor(
    private evenementService: EvenementService,
    private router: Router,
    private authService: AuthentificationService
  ) {
    addIcons({
      calendarOutline, qrCodeOutline, scanOutline, locationOutline,
      ticketOutline, arrowBackOutline, closeOutline, checkmarkCircleOutline
    });
  }

  ngOnInit() {
    this.estOrganisateur = localStorage.getItem('role') === 'proprietaire' || localStorage.getItem('role') === 'admin';
    this.chargerEvenements();
  }

  chargerEvenements() {
    this.evenementService.obtenirTous(this.rechercheVille || undefined).subscribe({
      next: (res) => this.evenements = res,
      error: (err) => console.error(err)
    });
  }

  chargerTickets() {
    this.evenementService.obtenirTicketsClient().subscribe({
      next: (res) => this.tickets = res,
      error: (err) => console.error(err)
    });
  }

  changerOnglet() {
    if (this.ongletActif === 'recherche') {
      this.chargerEvenements();
    } else if (this.ongletActif === 'tickets') {
      this.chargerTickets();
    }
  }

  filtrer() {
    this.chargerEvenements();
  }

  acheterBillet(evt: any) {
    if (!this.authService.estConnecte()) {
      this.router.navigate(['/connexion'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    this.router.navigate([`/paiement/ticket-${evt.id}`], {
      queryParams: {
        total: evt.prixTicket,
        libelle: `Billet d'entrée : ${evt.nom}`,
        type: 'evenement'
      }
    });
  }

  validerScanner() {
    if (!this.referenceScanner) {
      this.toastMessage = 'Veuillez saisir la référence du ticket';
      this.toastOuvert = true;
      return;
    }

    this.evenementService.scannerTicket(this.referenceScanner).subscribe({
      next: (res) => {
        this.toastMessage = `Succès! Ticket composté pour ${res.client?.nomComplet}`;
        this.toastOuvert = true;
        this.referenceScanner = '';
      },
      error: (err) => {
        this.toastMessage = err.error.message || 'Ticket invalide ou expiré';
        this.toastOuvert = true;
      }
    });
  }

  retourner() {
    this.router.navigate(['/accueil']);
  }
}
