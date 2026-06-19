import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonItem, IonIcon, IonLabel, IonList, IonGrid, IonRow,
  IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonSegment, IonSegmentButton, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  statsChartOutline, bedOutline, busOutline, beerOutline,
  calendarOutline, cashOutline, arrowBackOutline, peopleOutline
} from 'ionicons/icons';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboards',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonTitle, IonButton, IonItem, IonIcon, IonLabel, IonList,
    IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonSegment, IonSegmentButton, IonBadge
  ],
  template: `
    <ion-header class="resa-glass-header">
      <ion-toolbar>
        <ion-button slot="start" fill="clear" (click)="retourner()">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </ion-button>
        <ion-title>Tableaux de Bord Hôte</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="dashboards-container fade-in">
        <ion-segment [(ngModel)]="dashboardActif" (ionChange)="changerDashboard()" class="custom-segment">
          <ion-segment-button value="hotel">
            <ion-icon name="bed-outline"></ion-icon>
            <ion-label>Hôtel</ion-label>
          </ion-segment-button>
          <ion-segment-button value="transport">
            <ion-icon name="bus-outline"></ion-icon>
            <ion-label>Flotte</ion-label>
          </ion-segment-button>
          <ion-segment-button value="restaurant">
            <ion-icon name="beer-outline"></ion-icon>
            <ion-label>Resto</ion-label>
          </ion-segment-button>
          <ion-segment-button value="evenement">
            <ion-icon name="calendar-outline"></ion-icon>
            <ion-label>Event</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- DASHBOARD HÔTEL -->
        <div *ngIf="dashboardActif === 'hotel'" class="dash-content">
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <ion-card class="stats-card val-card">
                  <ion-card-content>
                    <span class="lbl">Hébergements</span>
                    <h2>{{ statsHotel?.totalLogements || 0 }}</h2>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="6">
                <ion-card class="stats-card val-card">
                  <ion-card-content>
                    <span class="lbl">Réservations</span>
                    <h2>{{ statsHotel?.totalReservations || 0 }}</h2>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="12">
                <ion-card class="stats-card rev-card">
                  <ion-card-content>
                    <span class="lbl">Revenus Cumulés</span>
                    <h2>{{ (statsHotel?.revenusTotaux || 0) | number }} GNF</h2>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>

          <h3 class="section-title">Dernières Réservations</h3>
          <div *ngIf="statsHotel?.reservations?.length === 0" class="empty-state">
            <p>Aucune réservation reçue.</p>
          </div>
          <ion-list>
            <ion-item *ngFor="let r of statsHotel?.reservations" lines="inset">
              <ion-label>
                <h3>Client : {{ r.client?.nomComplet }}</h3>
                <p>Du {{ r.dateDebut | date:'shortDate' }} au {{ r.dateFin | date:'shortDate' }}</p>
              </ion-label>
              <ion-badge color="success" slot="end">{{ r.statut }}</ion-badge>
            </ion-item>
          </ion-list>
        </div>

        <!-- DASHBOARD TRANSPORT -->
        <div *ngIf="dashboardActif === 'transport'" class="dash-content">
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <ion-card class="stats-card val-card">
                  <ion-card-content>
                    <span class="lbl">Véhicules</span>
                    <h2>{{ statsTransport?.totalVehicules || 0 }}</h2>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="6">
                <ion-card class="stats-card val-card">
                  <ion-card-content>
                    <span class="lbl">Trajets Actifs</span>
                    <h2>{{ statsTransport?.totalTrajets || 0 }}</h2>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="12">
                <ion-card class="stats-card rev-card">
                  <ion-card-content>
                    <span class="lbl">Revenus Estimés</span>
                    <h2>{{ (statsTransport?.revenusEstimes || 0) | number }} GNF</h2>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>

          <h3 class="section-title">Liste des Véhicules</h3>
          <ion-list>
            <ion-item *ngFor="let v of statsTransport?.vehicules" lines="inset">
              <ion-label>
                <h3>{{ v.marque }} {{ v.nom }}</h3>
                <p>Matricule : {{ v.matricule }} | {{ v.ville }}</p>
              </ion-label>
              <ion-badge slot="end" [color]="v.disponible ? 'success' : 'danger'">
                {{ v.disponible ? 'Actif' : 'Suspendu' }}
              </ion-badge>
            </ion-item>
          </ion-list>
        </div>

        <!-- DASHBOARD RESTAURANT -->
        <div *ngIf="dashboardActif === 'restaurant'" class="dash-content">
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <ion-card class="stats-card val-card">
                  <ion-card-content>
                    <span class="lbl">Restaurants</span>
                    <h2>{{ statsRestaurant?.totalRestaurants || 0 }}</h2>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="6">
                <ion-card class="stats-card val-card">
                  <ion-card-content>
                    <span class="lbl">Tables Réservées</span>
                    <h2>{{ statsRestaurant?.totalReservations || 0 }}</h2>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>

          <h3 class="section-title">Demandes de Réservations</h3>
          <div *ngIf="statsRestaurant?.reservations?.length === 0" class="empty-state">
            <p>Aucune réservation de table.</p>
          </div>
          <ion-list>
            <ion-item *ngFor="let r of statsRestaurant?.reservations" lines="inset">
              <ion-label>
                <h3>Restaurant : {{ r.restaurant?.nom }}</h3>
                <p>Client : {{ r.client?.nomComplet }} ({{ r.nombreCouverts }} personnes)</p>
                <p>Le : {{ r.dateHeure | date:'short' }}</p>
              </ion-label>
              <ion-badge slot="end" color="primary">{{ r.statut }}</ion-badge>
            </ion-item>
          </ion-list>
        </div>

        <!-- DASHBOARD ÉVÉNEMENT -->
        <div *ngIf="dashboardActif === 'evenement'" class="dash-content">
          <ion-grid>
            <ion-row>
              <ion-col size="6">
                <ion-card class="stats-card val-card">
                  <ion-card-content>
                    <span class="lbl">Événements</span>
                    <h2>{{ statsEvenement?.totalEvenements || 0 }}</h2>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="6">
                <ion-card class="stats-card val-card">
                  <ion-card-content>
                    <span class="lbl">Tickets Vendus</span>
                    <h2>{{ statsEvenement?.totalTicketsVendus || 0 }}</h2>
                  </ion-card-content>
                </ion-card>
              </ion-col>
              <ion-col size="12">
                <ion-card class="stats-card rev-card">
                  <ion-card-content>
                    <span class="lbl">Chiffre d'Affaires</span>
                    <h2>{{ (statsEvenement?.revenusTotaux || 0) | number }} GNF</h2>
                  </ion-card-content>
                </ion-card>
              </ion-col>
            </ion-row>
          </ion-grid>

          <h3 class="section-title">Liste des Événements</h3>
          <ion-list>
            <ion-item *ngFor="let e of statsEvenement?.evenements" lines="inset">
              <ion-label>
                <h3>{{ e.nom }}</h3>
                <p>{{ e.dateEvenement | date:'shortDate' }} | {{ e.ville }}</p>
              </ion-label>
              <ion-badge slot="end" color="secondary">{{ e.prixTicket | number }} GNF</ion-badge>
            </ion-item>
          </ion-list>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .dashboards-container {
      padding: 16px;
    }
    .custom-segment {
      margin-bottom: 20px;
      --background: var(--resa-glass-bg);
      border: 1px solid var(--resa-glass-border);
      border-radius: 12px;
    }
    .stats-card {
      margin: 0;
      border: 1px solid var(--resa-glass-border);
      border-radius: 16px;
      box-shadow: var(--resa-shadow);
      background: var(--resa-glass-bg);
    }
    .stats-card h2 {
      font-size: 1.6rem;
      font-weight: 800;
      margin: 8px 0 0 0;
    }
    .val-card h2 {
      color: var(--ion-color-secondary);
    }
    .rev-card h2 {
      color: var(--ion-color-success);
    }
    .lbl {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--ion-color-medium);
      text-transform: uppercase;
    }
    .section-title {
      font-size: 1.1rem;
      font-weight: 800;
      margin: 24px 0 12px 10px;
      color: var(--ion-text-color);
    }
    .empty-state {
      padding: 24px;
      text-align: center;
      color: var(--ion-color-medium);
    }
  `]
})
export class DashboardsPage implements OnInit {
  dashboardActif = 'hotel';

  statsHotel: any = null;
  statsTransport: any = null;
  statsRestaurant: any = null;
  statsEvenement: any = null;

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) {
    addIcons({
      statsChartOutline, bedOutline, busOutline, beerOutline,
      calendarOutline, cashOutline, arrowBackOutline, peopleOutline
    });
  }

  ngOnInit() {
    this.changerDashboard();
  }

  changerDashboard() {
    if (this.dashboardActif === 'hotel') {
      this.dashboardService.obtenirStatsHotel().subscribe({
        next: (res) => this.statsHotel = res,
        error: (err) => console.error(err)
      });
    } else if (this.dashboardActif === 'transport') {
      this.dashboardService.obtenirStatsTransport().subscribe({
        next: (res) => this.statsTransport = res,
        error: (err) => console.error(err)
      });
    } else if (this.dashboardActif === 'restaurant') {
      this.dashboardService.obtenirStatsRestaurant().subscribe({
        next: (res) => this.statsRestaurant = res,
        error: (err) => console.error(err)
      });
    } else if (this.dashboardActif === 'evenement') {
      this.dashboardService.obtenirStatsEvenement().subscribe({
        next: (res) => this.statsEvenement = res,
        error: (err) => console.error(err)
      });
    }
  }

  retourner() {
    this.router.navigate(['/accueil']);
  }
}
