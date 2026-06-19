import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, 
  IonItem, IonInput, IonIcon, IonBadge, IonAvatar,
  IonSearchbar, IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  bedOutline, busOutline, beerOutline, calendarOutline, 
  walletOutline, chatbubbleEllipsesOutline, personOutline,
  optionsOutline, searchOutline, logOutOutline, cloudOfflineOutline,
  notificationsOutline, heartOutline, statsChartOutline
} from 'ionicons/icons';

import { LogementService } from '../../services/logement.service';
import { AuthentificationService } from '../../services/authentification.service';
import { SynchronisationService } from '../../services/synchronisation.service';
import { LogementCardComponent } from '../../components/logement-card/logement-card.component';
import { SkeletonLoaderComponent } from '../../components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-accueil',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, 
    IonTitle, IonButton, IonItem, IonInput, IonIcon, IonBadge, IonAvatar,
    IonSearchbar, IonGrid, IonRow, IonCol, LogementCardComponent, SkeletonLoaderComponent
  ],
  template: `
    <ion-content [fullscreen]="true">
      
      <!-- Bannière Hors-Ligne premium -->
      <div *ngIf="!enLigne" class="offline-banner slide-up">
        <ion-icon name="cloud-offline-outline"></ion-icon>
        <span>Mode Hors-ligne actif — Utilisation du cache local</span>
      </div>

      <!-- En-tête / Barre Profil & Solde -->
      <div class="accueil-header fade-in">
        <div class="user-profile-row">
          <div class="user-meta" *ngIf="utilisateur">
            <ion-avatar class="user-avatar">
              <img [src]="utilisateur.photoProfil || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + utilisateur.nomComplet" />
            </ion-avatar>
            <div class="name-box">
              <span class="greeting">Bonjour 👋</span>
              <h2 class="user-name">{{ utilisateur.nomComplet }}</h2>
            </div>
          </div>
          
          <!-- Raccourcis Portefeuille & Actions -->
          <div class="header-actions">
            <div class="wallet-pill" (click)="redirigerVers('portefeuille')" *ngIf="utilisateur">
              <ion-icon name="wallet-outline"></ion-icon>
              <span>{{ (utilisateur.soldePortefeuille || 0) | number }} GNF</span>
            </div>
            <div class="action-btn" (click)="redirigerVers('favoris')">
              <ion-icon name="heart-outline"></ion-icon>
            </div>
            <div class="action-btn" (click)="redirigerVers('notifications')">
              <ion-icon name="notifications-outline"></ion-icon>
            </div>
            <div class="action-btn" (click)="redirigerVers('dashboards')" *ngIf="utilisateur && utilisateur.role !== 'client' && utilisateur.role">
              <ion-icon name="stats-chart-outline"></ion-icon>
            </div>
            <div class="action-btn" (click)="deconnexion()">
              <ion-icon name="log-out-outline"></ion-icon>
            </div>
          </div>
        </div>

        <!-- Recherche et Catégories -->
        <h1 class="header-title">Où souhaitez-vous aller en Guinée ?</h1>
        
        <div class="search-box resa-glass-card">
          <ion-searchbar 
            placeholder="Conakry, Kamsar, Labé..." 
            [(ngModel)]="rechercheVille"
            (ionInput)="effectuerRecherche()"
            class="custom-searchbar"
          ></ion-searchbar>
          <div class="filter-row">
            <ion-item lines="none" class="filter-input-item">
              <ion-input 
                type="number" 
                placeholder="Budget Max (GNF)" 
                [(ngModel)]="recherchePrixMax"
                (ionInput)="effectuerRecherche()"
              ></ion-input>
            </ion-item>
          </div>
        </div>
      </div>

      <!-- Sélecteur de Catégories de Services -->
      <div class="categories-container fade-in">
        <div 
          [class]="'category-tab ' + (categorieActive === 'logement' ? 'active' : '')"
          (click)="changerCategorie('logement')"
        >
          <div class="icon-circle"><ion-icon name="bed-outline"></ion-icon></div>
          <span>Hébergement</span>
        </div>
        <div 
          [class]="'category-tab ' + (categorieActive === 'transport' ? 'active' : '')"
          (click)="changerCategorie('transport')"
        >
          <div class="icon-circle"><ion-icon name="bus-outline"></ion-icon></div>
          <span>Transport</span>
        </div>
        <div 
          [class]="'category-tab ' + (categorieActive === 'restaurant' ? 'active' : '')"
          (click)="changerCategorie('restaurant')"
        >
          <div class="icon-circle"><ion-icon name="beer-outline"></ion-icon></div>
          <span>Sorties & Restos</span>
        </div>
        <div 
          [class]="'category-tab ' + (categorieActive === 'evenement' ? 'active' : '')"
          (click)="changerCategorie('evenement')"
        >
          <div class="icon-circle"><ion-icon name="calendar-outline"></ion-icon></div>
          <span>Événements</span>
        </div>
      </div>

      <!-- Contenu Dynamique -->
      <div class="content-wrapper">
        <div class="section-header">
          <h2 class="section-title">Annonces populaires</h2>
          <span class="see-all">Tout voir</span>
        </div>

        <!-- Skeleton Loaders -->
        <div *ngIf="chargement">
          <app-skeleton-loader layout="carte" class="margin-bottom-card"></app-skeleton-loader>
          <app-skeleton-loader layout="carte"></app-skeleton-loader>
        </div>

        <!-- Aucun résultat -->
        <div class="empty-state" *ngIf="!chargement && logements.length === 0">
          <p>Aucun logement trouvé pour ces critères de recherche.</p>
        </div>

        <!-- Cartes Logements -->
        <div *ngIf="!chargement && categorieActive === 'logement'">
          <app-logement-card 
            *ngFor="let logement of logements" 
            [logement]="logement"
            (onClick)="voirDetails(logement.id)"
          ></app-logement-card>
        </div>

        <!-- Section Transport Simulée -->
        <div *ngIf="!chargement && categorieActive === 'transport'" class="simulated-list">
          <div class="resa-glass-card list-card" *ngFor="let trajet of trajetsSimules">
            <div class="list-card-header">
              <span class="company-name">Gaza Transports</span>
              <span class="price">{{ trajet.prix | number }} GNF</span>
            </div>
            <h3 class="route-title">{{ trajet.depart }} ➔ {{ trajet.destination }}</h3>
            <p class="schedule">Départ : {{ trajet.date }} à {{ trajet.heure }}</p>
            <ion-button size="small" class="btn-premium" (click)="effectuerReservationTransport(trajet)">
              Réserver place
            </ion-button>
          </div>
        </div>

        <!-- Section Restos Simulée -->
        <div *ngIf="!chargement && categorieActive === 'restaurant'" class="simulated-list">
          <div class="resa-glass-card list-card" *ngFor="let resto of restosSimules">
            <div class="list-card-header">
              <span class="company-name">{{ resto.cuisine }}</span>
              <span class="price">Entrée Libre</span>
            </div>
            <h3 class="route-title">{{ resto.nom }}</h3>
            <p class="schedule">Adresse : {{ resto.adresse }}, {{ resto.ville }}</p>
            <ion-button size="small" class="btn-premium" (click)="effectuerReservationResto(resto)">
              Réserver Table
            </ion-button>
          </div>
        </div>
      </div>

      <p class="partenaire-banner">
        Vous êtes un partenaire ?
        <strong (click)="redirigerVers('inscription-partenaire')">Inscrivez-vous ici</strong>
      </p>

      <!-- Navigation Basse Fixe Premium (Simulée pour une interface hybride superbe) -->
      <div class="bottom-tab-bar">
        <div class="tab-item active" (click)="redirigerVers('accueil')">
          <ion-icon name="bed-outline"></ion-icon>
          <span>Accueil</span>
        </div>
        <div class="tab-item" (click)="redirigerVers('reservations')">
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
    // Bannière Hors ligne
    .offline-banner {
      background: var(--ion-color-warning);
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 8px 12px;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .accueil-header {
      background: linear-gradient(to bottom, rgba(255, 74, 34, 0.1) 0%, transparent 100%);
      padding: 24px 20px 10px;
    }

    .user-profile-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .user-meta {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 44px;
      height: 44px;
      border: 2px solid white;
      box-shadow: 0 4px 10px rgba(0,0,0,0.05);
    }

    .greeting {
      font-size: 0.8rem;
      color: var(--ion-color-medium);
      font-weight: 500;
    }

    .user-name {
      font-size: 1.05rem;
      font-weight: 700;
      margin: 0;
      color: var(--ion-text-color);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .wallet-pill {
      background: var(--resa-glass-bg);
      border: 1px solid var(--resa-glass-border);
      border-radius: 20px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--ion-color-secondary);
      box-shadow: var(--resa-shadow);
      cursor: pointer;
      
      ion-icon {
        font-size: 1rem;
      }
    }

    .action-btn {
      width: 38px;
      height: 38px;
      background: var(--resa-glass-bg);
      border: 1px solid var(--resa-glass-border);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ion-color-danger);
      box-shadow: var(--resa-shadow);
      cursor: pointer;
    }

    .header-title {
      font-size: 1.8rem;
      font-weight: 800;
      margin: 16px 0;
      line-height: 1.2;
      color: var(--ion-text-color);
    }

    .search-box {
      padding: 12px;
      margin-bottom: 8px;
    }

    .custom-searchbar {
      --background: var(--ion-color-light);
      --border-radius: 12px;
      --box-shadow: none;
      padding: 0;
      margin-bottom: 8px;
    }

    .filter-input-item {
      --background: var(--ion-color-light);
      --border-radius: 12px;
      --padding-start: 12px;
      border: 1px solid var(--resa-glass-border);
    }

    // Catégories
    .categories-container {
      display: flex;
      justify-content: space-around;
      padding: 16px 8px;
      gap: 12px;
    }

    .category-tab {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      flex: 1;
      cursor: pointer;

      span {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--ion-color-medium);
      }

      .icon-circle {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: var(--ion-color-light);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ion-color-dark-tint);
        font-size: 1.4rem;
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      &.active {
        span {
          color: var(--ion-color-primary);
        }
        .icon-circle {
          background: var(--resa-gradient-primary);
          color: white;
          box-shadow: 0 6px 16px rgba(255, 74, 34, 0.25);
        }
      }
    }

    // Contenu
    .content-wrapper {
      padding: 0 20px 90px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 24px 0 16px 0;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
      color: var(--ion-text-color);
    }

    .see-all {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--ion-color-primary);
    }

    .empty-state {
      padding: 40px 0;
      text-align: center;
      color: var(--ion-color-medium);
      font-size: 0.9rem;
    }

    // Listes simulées
    .simulated-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .list-card {
      padding: 16px;
    }

    .list-card-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      
      .company-name {
        font-size: 0.75rem;
        font-weight: 700;
        color: var(--ion-color-medium);
        text-transform: uppercase;
      }
      .price {
        font-weight: 800;
        color: var(--ion-color-primary);
      }
    }

    .route-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 6px 0;
    }

    .schedule {
      font-size: 0.85rem;
      color: var(--ion-color-medium);
      margin: 0 0 16px 0;
    }

    // Navigation basse
    .partenaire-banner { text-align: center; font-size: 0.8rem; color: var(--ion-color-medium); margin: 20px 16px 88px; }
    .partenaire-banner strong { color: var(--ion-color-secondary); cursor: pointer; }

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
export class AccueilPage implements OnInit {
  utilisateur: any = null;
  enLigne = true;
  chargement = false;
  categorieActive: 'logement' | 'transport' | 'restaurant' | 'evenement' = 'logement';

  logements: any[] = [];
  rechercheVille = '';
  recherchePrixMax?: number;

  trajetsSimules = [
    { id: '1', depart: 'Conakry', destination: 'Labé', prix: 150000, date: '2026-06-01', heure: '08:00' },
    { id: '2', depart: 'Conakry', destination: 'Kamsar', prix: 120000, date: '2026-06-02', heure: '07:30' },
    { id: '3', depart: 'Conakry', destination: 'Mamou', prix: 80000, date: '2026-06-03', heure: '09:00' }
  ];

  restosSimules = [
    { id: '1', nom: 'Le Damier', cuisine: 'Africaine & Européenne', ville: 'Conakry', adresse: 'Kaloum' },
    { id: '2', nom: 'Sabor de Bahia', cuisine: 'Brésilienne', ville: 'Conakry', adresse: 'Kipé' }
  ];

  constructor(
    private authService: AuthentificationService,
    private logementService: LogementService,
    private syncService: SynchronisationService,
    private router: Router
  ) {
    addIcons({ 
      bedOutline, busOutline, beerOutline, calendarOutline, 
      walletOutline, chatbubbleEllipsesOutline, personOutline,
      optionsOutline, searchOutline, logOutOutline, cloudOfflineOutline,
      notificationsOutline, heartOutline, statsChartOutline
    });
  }

  ngOnInit() {
    this.authService.utilisateurApp$.subscribe(u => {
      this.utilisateur = u;
    });

    this.syncService.enLigne$.subscribe(status => {
      this.enLigne = status;
    });

    this.chargerLogements();
  }

  chargerLogements() {
    this.chargement = true;
    this.logementService.trouverTous(
      this.rechercheVille || undefined,
      this.recherchePrixMax || undefined
    ).subscribe({
      next: (data) => {
        this.logements = data;
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
      }
    });
  }

  effectuerRecherche() {
    this.chargerLogements();
  }

  changerCategorie(cat: 'logement' | 'transport' | 'restaurant' | 'evenement') {
    this.categorieActive = cat;
    if (cat !== 'logement') {
      this.router.navigate([`/${cat}`]);
    }
  }

  voirDetails(id: string) {
    this.router.navigate([`/details/${id}`]);
  }

  deconnexion() {
    this.authService.deconnexion().subscribe(() => {
      this.router.navigate(['/connexion']);
    });
  }

  redirigerVers(page: string) {
    this.router.navigate([`/${page}`]);
  }

  effectuerReservationTransport(trajet: any) {
    // Rediriger vers l'écran de paiement
    this.router.navigate([`/paiement/transport-${trajet.id}`], {
      queryParams: {
        total: trajet.prix,
        libelle: `Billet ${trajet.depart} ➔ ${trajet.destination}`,
        type: 'transport'
      }
    });
  }

  effectuerReservationResto(resto: any) {
    alert(`Table réservée avec succès au restaurant ${resto.nom} !`);
  }
}
