import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonButton, 
  IonIcon, IonItem, IonLabel, IonInput, IonToast,
  IonAvatar, IonBadge
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { addIcons } from 'ionicons';
import { 
  bedOutline, calendarOutline, walletOutline, 
  chatbubbleEllipsesOutline, sendOutline, arrowBackOutline, 
  chatbubbleOutline 
} from 'ionicons/icons';
import { MessagerieService } from '../../services/messagerie.service';
import { AuthentificationService } from '../../services/authentification.service';
import { SkeletonLoaderComponent } from '../../components/skeleton-loader/skeleton-loader.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, 
    IonButton, IonIcon, IonItem, IonLabel, IonInput, IonToast,
    IonAvatar, IonBadge, SkeletonLoaderComponent
  ],
  template: `
    <ion-content [fullscreen]="true">
      
      <!-- ÉCRAN 1 : Liste des Discussions -->
      <div *ngIf="!roomActive" class="chat-list-view">
        <div class="chat-header fade-in">
          <h1 class="header-title">Mes Messages</h1>
          <p class="header-subtitle">Échangez avec vos hôtes et prestataires de services</p>
        </div>

        <div class="content-wrapper">
          <div *ngIf="chargement">
            <app-skeleton-loader layout="liste" class="margin-bottom-card"></app-skeleton-loader>
            <app-skeleton-loader layout="liste"></app-skeleton-loader>
          </div>

          <div *ngIf="!chargement && discussions.length === 0" class="empty-state">
            <ion-icon name="chatbubble-outline" class="empty-icon"></ion-icon>
            <h3>Pas de discussion</h3>
            <p>Vous n'avez pas encore envoyé ou reçu de messages.</p>
          </div>

          <!-- Discussions actives -->
          <div class="discussions-list" *ngIf="!chargement && discussions.length > 0">
            <div 
              class="discussion-card resa-glass-card fade-in" 
              *ngFor="let disc of discussions"
              (click)="ouvrirDiscussion(disc.contact)"
            >
              <ion-avatar class="contact-avatar">
                <img [src]="disc.contact.photoProfil || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + disc.contact.nomComplet" />
              </ion-avatar>
              <div class="disc-body">
                <div class="name-row">
                  <span class="contact-name">{{ disc.contact.nomComplet }}</span>
                  <span class="time">{{ formaterDate(disc.creeA) }}</span>
                </div>
                <p class="last-msg">{{ disc.dernierMessage }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ÉCRAN 2 : Fil de Discussion Actif (Room) -->
      <div *ngIf="roomActive && contactSelectionne" class="chat-room-view fade-in">
        <!-- Barre supérieure de discussion -->
        <div class="room-header">
          <div class="back-btn" (click)="fermerDiscussion()">
            <ion-icon name="arrow-back-outline"></ion-icon>
          </div>
          <div class="contact-meta">
            <ion-avatar class="room-avatar">
              <img [src]="contactSelectionne.photoProfil || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + contactSelectionne.nomComplet" />
            </ion-avatar>
            <div class="name-box">
              <h4>{{ contactSelectionne.nomComplet }}</h4>
              <span class="status-indicator">En ligne</span>
            </div>
          </div>
        </div>

        <!-- Corps des messages -->
        <div class="messages-container">
          <div 
            *ngFor="let msg of messages"
            [class]="'msg-bubble-wrapper ' + (msg.expediteur.id === utilisateur.id ? 'sent' : 'received')"
          >
            <div class="bubble">
              <p class="txt">{{ msg.contenu }}</p>
              <span class="time">{{ formaterHeure(msg.creeA) }}</span>
            </div>
          </div>
        </div>

        <!-- Zone de saisie fixe -->
        <div class="chat-input-bar">
          <ion-item lines="none" class="input-item">
            <ion-input 
              placeholder="Votre message..." 
              [(ngModel)]="nouveauMessageText"
              (keyup.enter)="envoyerMessage()"
            ></ion-input>
          </ion-item>
          <div class="send-btn" (click)="envoyerMessage()">
            <ion-icon name="send-outline"></ion-icon>
          </div>
        </div>
      </div>

      <!-- Navigation Basse Fixe Premium (Uniquement si pas dans un chat actif) -->
      <div class="bottom-tab-bar" *ngIf="!roomActive">
        <div class="tab-item" (click)="redirigerVers('accueil')">
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
        <div class="tab-item active" (click)="redirigerVers('chat')">
          <ion-icon name="chatbubble-ellipsesOutline"></ion-icon>
          <span>Chat</span>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .chat-header {
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
        margin-bottom: 16px;
      }
      h3 {
        font-weight: 700;
        color: var(--ion-text-color);
      }
    }

    // Liste des discussions
    .discussions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .discussion-card {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      gap: 16px;
      cursor: pointer;
    }

    .contact-avatar {
      width: 48px;
      height: 48px;
    }

    .disc-body {
      flex: 1;
    }

    .name-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
      
      .contact-name {
        font-weight: 700;
        font-size: 0.95rem;
        color: var(--ion-text-color);
      }
      .time {
        font-size: 0.75rem;
        color: var(--ion-color-medium);
      }
    }

    .last-msg {
      font-size: 0.8rem;
      color: var(--ion-color-medium);
      margin: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    // ROOM DE DISCUSSION
    .chat-room-view {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--ion-background-color);
    }

    .room-header {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      gap: 12px;
      background: var(--resa-glass-bg);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--resa-glass-border);
      
      .back-btn {
        width: 36px;
        height: 36px;
        background: var(--ion-color-light);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ion-text-color);
        cursor: pointer;
      }
    }

    .contact-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      
      .room-avatar {
        width: 38px;
        height: 38px;
      }

      .name-box {
        h4 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 700;
        }
        .status-indicator {
          font-size: 0.7rem;
          color: var(--ion-color-success);
          font-weight: 600;
        }
      }
    }

    .messages-container {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-bottom: 90px;
    }

    .msg-bubble-wrapper {
      display: flex;
      width: 100%;
      
      &.sent {
        justify-content: flex-end;
        
        .bubble {
          background: var(--resa-gradient-primary);
          color: white;
          border-bottom-right-radius: 4px;
        }
      }

      &.received {
        justify-content: flex-start;
        
        .bubble {
          background: var(--ion-color-light);
          color: var(--ion-text-color);
          border-bottom-left-radius: 4px;
        }
      }
    }

    .bubble {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      
      .txt {
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.4;
      }
      .time {
        font-size: 0.65rem;
        opacity: 0.7;
        display: block;
        text-align: right;
        margin-top: 4px;
      }
    }

    .chat-input-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 14px 20px 24px;
      background: var(--resa-glass-bg);
      backdrop-filter: blur(20px);
      border-top: 1px solid var(--resa-glass-border);
      display: flex;
      gap: 12px;
      align-items: center;
      z-index: 100;
    }

    .input-item {
      flex: 1;
      --background: var(--ion-color-light);
      --border-radius: 20px;
      --padding-start: 16px;
      border: 1px solid var(--resa-glass-border);
    }

    .send-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--resa-gradient-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      box-shadow: 0 4px 10px rgba(255, 74, 34, 0.25);
      cursor: pointer;
      flex-shrink: 0;
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
export class ChatPage implements OnInit, OnDestroy {
  utilisateur: any = null;
  discussions: any[] = [];
  chargement = false;

  // Discussion Active
  roomActive = false;
  contactSelectionne: any = null;
  messages: any[] = [];
  nouveauMessageText = '';
  
  private messageSub!: Subscription;

  constructor(
    private authService: AuthentificationService,
    private messagerieService: MessagerieService,
    private router: Router
  ) {
    addIcons({ 
      bedOutline, calendarOutline, walletOutline, 
      chatbubbleEllipsesOutline, sendOutline, arrowBackOutline, 
      chatbubbleOutline 
    });
  }

  ngOnInit() {
    this.utilisateur = this.authService.obtenirUtilisateurCourant();
    this.chargerDiscussions();
    
    this.messagerieService.initialiserSocket();
    this.messageSub = this.messagerieService.ecouterNouveauxMessages().subscribe({
      next: (msg) => {
        if (this.roomActive && this.contactSelectionne && 
            (msg.expediteur.id === this.contactSelectionne.id || msg.destinataire.id === this.contactSelectionne.id)) {
          this.messages.push(msg);
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.messageSub) {
      this.messageSub.unsubscribe();
    }
    this.messagerieService.deconnecterSocket();
  }

  chargerDiscussions() {
    this.chargement = true;
    this.messagerieService.obtenirDiscussions().subscribe({
      next: (data) => {
        this.discussions = data;
        this.chargement = false;
      },
      error: () => {
        this.chargement = false;
      }
    });
  }

  ouvrirDiscussion(contact: any) {
    this.contactSelectionne = contact;
    this.roomActive = true;
    
    // Rejoindre la room de discussion (triage unique par tri alphabétique des IDs)
    const ids = [this.utilisateur.id, contact.id].sort();
    const roomName = `room_${ids[0]}_${ids[1]}`;
    this.messagerieService.rejoindreRoom(roomName);

    // Charger historique
    this.messagerieService.obtenirDiscussion(contact.id).subscribe({
      next: (data) => {
        this.messages = data;
      }
    });
  }

  fermerDiscussion() {
    if (this.contactSelectionne) {
      const ids = [this.utilisateur.id, this.contactSelectionne.id].sort();
      const roomName = `room_${ids[0]}_${ids[1]}`;
      this.messagerieService.quitterRoom(roomName);
    }
    this.roomActive = false;
    this.contactSelectionne = null;
    this.messages = [];
    this.chargerDiscussions();
  }

  envoyerMessage() {
    if (!this.nouveauMessageText.trim() || !this.contactSelectionne) return;

    const ids = [this.utilisateur.id, this.contactSelectionne.id].sort();
    const roomName = `room_${ids[0]}_${ids[1]}`;

    this.messagerieService.envoyerMessage(
      this.utilisateur.id,
      this.contactSelectionne.id,
      this.nouveauMessageText,
      roomName
    );

    // Pour un feedback visuel instantané hors-connexion
    const msgTemporaire = {
      id: `temp-${Date.now()}`,
      contenu: this.nouveauMessageText,
      creeA: new Date().toISOString(),
      expediteur: { id: this.utilisateur.id },
      destinataire: { id: this.contactSelectionne.id }
    };
    
    this.messages.push(msgTemporaire);
    this.nouveauMessageText = '';
  }

  formaterDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  }

  formaterHeure(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  redirigerVers(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
