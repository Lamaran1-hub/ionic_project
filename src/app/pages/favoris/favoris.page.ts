import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonItem, IonIcon, IonLabel, IonList, IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  heartOutline, heart, trashOutline, arrowBackOutline,
  locationOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-favoris',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonTitle, IonButton, IonItem, IonIcon, IonLabel, IonList,
    IonToast
  ],
  template: `
    <ion-header class="resa-glass-header">
      <ion-toolbar>
        <ion-button slot="start" fill="clear" (click)="retourner()">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </ion-button>
        <ion-title>Mes Favoris</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="favoris-container fade-in">
        <div *ngIf="favoris.length === 0" class="empty-state">
          <ion-icon name="heart-outline" class="empty-icon"></ion-icon>
          <p>Vous n'avez pas encore ajouté de favoris.</p>
        </div>

        <ion-list *ngIf="favoris.length > 0">
          <ion-item
            *ngFor="let item of favoris"
            lines="inset"
            class="favori-item"
          >
            <ion-icon name="heart" color="danger" slot="start"></ion-icon>
            <ion-label (click)="voirDetails(item)">
              <h3>{{ item.nom }}</h3>
              <p><ion-icon name="location-outline"></ion-icon> {{ item.ville || 'Guinée' }}</p>
            </ion-label>
            <ion-button slot="end" fill="clear" color="danger" (click)="retirerFavori(item)">
              <ion-icon name="trash-outline"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-list>
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
    .favoris-container {
      padding: 8px 0;
    }
    .favori-item {
      --padding-top: 12px;
      --padding-bottom: 12px;
    }
    .empty-state {
      padding: 80px 40px;
      text-align: center;
      color: var(--ion-color-medium);
    }
    .empty-icon {
      font-size: 4rem;
      margin-bottom: 16px;
      color: var(--ion-color-medium);
    }
  `]
})
export class FavorisPage implements OnInit {
  favoris: any[] = [];
  toastOuvert = false;
  toastMessage = '';

  constructor(private router: Router) {
    addIcons({
      heartOutline, heart, trashOutline, arrowBackOutline,
      locationOutline
    });
  }

  ngOnInit() {
    this.chargerFavoris();
  }

  chargerFavoris() {
    const data = localStorage.getItem('favoris');
    this.favoris = data ? JSON.parse(data) : [];
  }

  retirerFavori(item: any) {
    this.favoris = this.favoris.filter(f => f.id !== item.id);
    localStorage.setItem('favoris', JSON.stringify(this.favoris));
    this.toastMessage = 'Élément retiré des favoris';
    this.toastOuvert = true;
  }

  voirDetails(item: any) {
    if (item.type === 'logement') {
      this.router.navigate([`/details/${item.id}`]);
    } else {
      this.router.navigate([`/${item.type}`]);
    }
  }

  retourner() {
    this.router.navigate(['/accueil']);
  }
}
