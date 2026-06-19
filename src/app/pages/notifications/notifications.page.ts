import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton,
  IonItem, IonIcon, IonLabel, IonList, IonBadge, IonToast
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  notificationsOutline, mailOutline, mailOpenOutline,
  checkmarkDoneOutline, arrowBackOutline
} from 'ionicons/icons';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonTitle, IonButton, IonItem, IonIcon, IonLabel, IonList,
    IonBadge, IonToast
  ],
  template: `
    <ion-header class="resa-glass-header">
      <ion-toolbar>
        <ion-button slot="start" fill="clear" (click)="retourner()">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </ion-button>
        <ion-title>Notifications</ion-title>
        <ion-button slot="end" fill="clear" (click)="marquerToutLu()">
          <ion-icon name="checkmark-done-outline"></ion-icon>
        </ion-button>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <div class="notifications-container fade-in">
        <div *ngIf="notifications.length === 0" class="empty-state">
          <ion-icon name="notifications-outline" class="empty-icon"></ion-icon>
          <p>Vous n'avez pas de nouvelles notifications.</p>
        </div>

        <ion-list *ngIf="notifications.length > 0">
          <ion-item
            *ngFor="let note of notifications"
            (click)="lireNotification(note)"
            [class.non-lu]="!note.lu"
            lines="inset"
            class="notification-item"
          >
            <ion-icon
              [name]="note.lu ? 'mail-open-outline' : 'mail-outline'"
              slot="start"
              [color]="note.lu ? 'medium' : 'primary'"
            ></ion-icon>
            <ion-label>
              <h3>{{ note.titre }}</h3>
              <p>{{ note.description }}</p>
              <span class="date-text">{{ note.creeA | date:'short' }}</span>
            </ion-label>
            <ion-badge *ngIf="!note.lu" color="primary" slot="end">Nouveau</ion-badge>
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
    .notifications-container {
      padding: 8px 0;
    }
    .notification-item {
      --padding-top: 12px;
      --padding-bottom: 12px;
    }
    .non-lu {
      --background: rgba(255, 74, 34, 0.05);
      h3 {
        font-weight: 700 !important;
      }
    }
    .date-text {
      font-size: 0.75rem;
      color: var(--ion-color-medium);
      margin-top: 4px;
      display: inline-block;
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
export class NotificationsPage implements OnInit {
  notifications: any[] = [];
  toastOuvert = false;
  toastMessage = '';

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {
    addIcons({
      notificationsOutline, mailOutline, mailOpenOutline,
      checkmarkDoneOutline, arrowBackOutline
    });
  }

  ngOnInit() {
    this.chargerNotifications();
  }

  chargerNotifications() {
    this.notificationService.obtenirToutes().subscribe({
      next: (res) => this.notifications = res,
      error: (err) => console.error(err)
    });
  }

  lireNotification(note: any) {
    if (note.lu) return;

    this.notificationService.marquerCommeLue(note.id).subscribe({
      next: () => {
        note.lu = true;
        this.toastMessage = 'Notification marquée comme lue';
        this.toastOuvert = true;
      },
      error: (err) => console.error(err)
    });
  }

  marquerToutLu() {
    this.notificationService.marquerToutesCommeLues().subscribe({
      next: () => {
        this.notifications.forEach(n => n.lu = true);
        this.toastMessage = 'Toutes les notifications ont été marquées comme lues';
        this.toastOuvert = true;
      },
      error: (err) => console.error(err)
    });
  }

  retourner() {
    this.router.navigate(['/accueil']);
  }
}
