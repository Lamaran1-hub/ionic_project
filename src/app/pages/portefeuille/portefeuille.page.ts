import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonButton,
  IonIcon, IonItem, IonLabel, IonInput, IonToast,
  IonRadioGroup, IonRadio, IonModal, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bedOutline, calendarOutline, walletOutline,
  chatbubbleEllipsesOutline, arrowUpCircleOutline, arrowDownCircleOutline,
  lockClosedOutline, phonePortraitOutline
} from 'ionicons/icons';
import { PaiementService } from '../../services/paiement.service';
import { AuthentificationService } from '../../services/authentification.service';

@Component({
  selector: 'app-portefeuille',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonButton, IonIcon, IonItem, IonLabel, IonInput, IonToast,
    IonRadioGroup, IonRadio, IonModal, IonBadge
  ],
  template: `
    <ion-content [fullscreen]="true">
      <div class="portefeuille-header fade-in">
        <h1 class="header-title">Mon Portefeuille</h1>
        <p class="header-subtitle">Gérez votre solde et réglez vos réservations sans frais</p>
      </div>

      <div class="content-wrapper">
        
        <!-- Solde Actuel Card -->
        <div class="resa-glass-card wallet-card fade-in">
          <span class="label">Solde disponible</span>
          <h1 class="balance">{{ soldePortefeuille | number }} GNF</h1>
          
          <ion-button expand="block" class="btn-premium deposit-trigger" (click)="modalDepotOuvert = true">
            Déposer de l'argent
          </ion-button>
        </div>

        <!-- Historique des Transactions -->
        <h3 class="section-title">Historique des transactions</h3>

        <div *ngIf="transactions.length === 0" class="empty-state">
          <p>Aucune transaction enregistrée.</p>
        </div>

        <div class="transaction-list" *ngIf="transactions.length > 0">
          <div class="transaction-item resa-glass-card" *ngFor="let tx of transactions">
            <div class="tx-left">
              <ion-icon 
                [name]="tx.type === 'depot' ? 'arrow-up-circle-outline' : 'arrow-down-circle-outline'"
                [class]="tx.type"
              ></ion-icon>
              <div class="tx-meta">
                <span class="tx-title">{{ tx.type === 'depot' ? 'Rechargement Portefeuille' : 'Paiement Réservation' }}</span>
                <span class="tx-date">{{ formaterDate(tx.creeA) }}</span>
              </div>
            </div>
            <div class="tx-right">
              <span [class]="'tx-amount ' + tx.type">
                {{ tx.type === 'depot' ? '+' : '-' }}{{ tx.montant | number }} GNF
              </span>
              <ion-badge [class]="'tx-badge ' + tx.statut">{{ tx.statut }}</ion-badge>
            </div>
          </div>
        </div>

      </div>

      <!-- Modal Dépôt / Créditer -->
      <ion-modal [isOpen]="modalDepotOuvert" (didDismiss)="modalDepotOuvert = false">
        <ng-template>
          <div class="modal-wrapper">
            <div class="modal-header">
              <h3>Créditer le portefeuille</h3>
              <p>Sélectionnez un opérateur Mobile Money et entrez le montant.</p>
            </div>

            <div class="modal-body">
              
              <ion-item lines="none" class="input-item">
                <ion-label position="stacked">Montant (GNF)</ion-label>
                <ion-input type="number" placeholder="Ex: 50000" [(ngModel)]="montantDepot"></ion-input>
              </ion-item>

              <h4 class="sub-section-title">Opérateur</h4>
              <ion-radio-group [(ngModel)]="modePaiement" class="operator-group">
                <div class="operator-card">
                  <ion-radio value="orange_money" aria-label="Orange Money"></ion-radio>
                  <span class="op-name">Orange Money</span>
                </div>
                <div class="operator-card">
                  <ion-radio value="mtn_money" aria-label="MTN Money"></ion-radio>
                  <span class="op-name">MTN Mobile Money</span>
                </div>
              </ion-radio-group>

              <ion-item lines="none" class="input-item" style="margin-top: 16px;">
                <ion-label position="stacked">Numéro de téléphone</ion-label>
                <ion-input type="tel" placeholder="Ex: 622 34 56 78" [(ngModel)]="telephoneFacturation"></ion-input>
              </ion-item>

              <ion-button expand="block" class="btn-premium submit-deposit-btn" (click)="lancerDepot()" [disabled]="chargement">
                {{ chargement ? 'Initialisation...' : 'Valider le dépôt' }}
              </ion-button>
            </div>
          </div>
        </ng-template>
      </ion-modal>

      <!-- Modal OTP Dépôt -->
      <ion-modal [isOpen]="modalOtpOuvert" class="otp-modal-container">
        <ng-template>
          <div class="modal-wrapper">
            <div class="modal-header">
              <h3>Code OTP de confirmation</h3>
              <p>Confirmez le débit sur votre compte Mobile Money.</p>
            </div>
            
            <div class="modal-body">
              <ion-item lines="none" class="otp-input-item">
                <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
                <ion-input type="password" placeholder="Ex: 1234" [(ngModel)]="otpCode" class="otp-input"></ion-input>
              </ion-item>

              <ion-button expand="block" class="btn-premium" (click)="validerDepotOtp()" [disabled]="chargement">
                {{ chargement ? 'Validation...' : 'Valider le dépôt' }}
              </ion-button>
            </div>
          </div>
        </ng-template>
      </ion-modal>

      <!-- Toast -->
      <ion-toast 
        [isOpen]="toastOuvert" 
        [message]="toastMessage" 
        [duration]="2500" 
        (didDismiss)="toastOuvert = false"
        color="dark"
      ></ion-toast>

      <!-- Navigation Basse Fixe Premium -->
      <div class="bottom-tab-bar">
        <div class="tab-item" (click)="redirigerVers('accueil')">
          <ion-icon name="bed-outline"></ion-icon>
          <span>Accueil</span>
        </div>
        <div class="tab-item" (click)="redirigerVers('reservations')">
          <ion-icon name="calendar-outline"></ion-icon>
          <span>Résas</span>
        </div>
        <div class="tab-item active" (click)="redirigerVers('portefeuille')">
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
    .portefeuille-header {
      background: linear-gradient(to bottom, rgba(26, 92, 255, 0.1) 0%, transparent 100%);
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

    .wallet-card {
      padding: 24px;
      text-align: center;
      background: var(--resa-gradient-secondary);
      color: white;
      margin-bottom: 28px;
      
      .label {
        font-size: 0.8rem;
        opacity: 0.8;
        text-transform: uppercase;
      }
      .balance {
        font-size: 2.4rem;
        font-weight: 800;
        margin: 6px 0 20px;
      }
      .deposit-trigger {
        --background: white;
        --color: var(--ion-color-secondary);
        --box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        font-weight: 700;
        margin: 0;
      }
    }

    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0 0 16px 0;
    }

    .empty-state {
      text-align: center;
      padding: 32px 0;
      color: var(--ion-color-medium);
    }

    // Liste des transactions
    .transaction-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .transaction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
    }

    .tx-left {
      display: flex;
      align-items: center;
      gap: 12px;
      
      ion-icon {
        font-size: 2.2rem;
        
        &.depot {
          color: var(--ion-color-success);
        }
        &.paiement {
          color: var(--ion-color-danger);
        }
      }
    }

    .tx-meta {
      display: flex;
      flex-direction: column;
      
      .tx-title {
        font-weight: 700;
        font-size: 0.9rem;
        color: var(--ion-text-color);
      }
      .tx-date {
        font-size: 0.75rem;
        color: var(--ion-color-medium);
      }
    }

    .tx-right {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      
      .tx-amount {
        font-weight: 800;
        font-size: 0.95rem;
        
        &.depot {
          color: var(--ion-color-success);
        }
        &.paiement {
          color: var(--ion-color-danger);
        }
      }
      .tx-badge {
        font-size: 0.65rem;
        border-radius: 4px;
        
        &.reussi {
          --background: var(--ion-color-success);
        }
        &.en_attente {
          --background: var(--ion-color-warning);
          color: #000;
        }
      }
    }

    // Modal
    .modal-wrapper {
      padding: 24px;
      background: var(--ion-background-color);
      height: 100%;
    }

    .modal-header {
      text-align: center;
      margin-bottom: 24px;
      h3 {
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0 0 4px 0;
      }
      p {
        font-size: 0.85rem;
        color: var(--ion-color-medium);
      }
    }

    .input-item {
      --background: var(--ion-color-light);
      --border-radius: 12px;
      --padding-start: 12px;
      border: 1px solid var(--resa-glass-border);
    }

    .sub-section-title {
      font-size: 0.85rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--ion-color-medium);
      margin: 20px 0 10px 0;
    }

    .operator-group {
      display: flex;
      gap: 12px;
    }

    .operator-card {
      flex: 1;
      border: 1px solid var(--resa-glass-border);
      border-radius: 12px;
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--ion-card-background);
      
      .op-name {
        font-size: 0.85rem;
        font-weight: 600;
      }
    }

    .submit-deposit-btn {
      margin-top: 24px;
    }

    .otp-input-item {
      --background: var(--ion-color-light);
      --border-radius: 12px;
      border: 1px solid var(--resa-glass-border);
    }
    
    .otp-input {
      font-size: 1.3rem;
      letter-spacing: 4px;
      text-align: center;
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
export class PortefeuillePage implements OnInit {
  soldePortefeuille = 0;
  transactions: any[] = [];
  chargement = false;

  // Formulaire dépôt
  modalDepotOuvert = false;
  montantDepot?: number;
  modePaiement: 'orange_money' | 'mtn_money' = 'orange_money';
  telephoneFacturation = '';

  // Modal OTP Dépôt
  modalOtpOuvert = false;
  referenceTransaction = '';
  otpCode = '';

  toastOuvert = false;
  toastMessage = '';

  constructor(
    private paiementService: PaiementService,
    private authService: AuthentificationService,
    private router: Router
  ) {
    addIcons({
      bedOutline, calendarOutline, walletOutline,
      chatbubbleEllipsesOutline, arrowUpCircleOutline, arrowDownCircleOutline,
      lockClosedOutline, phonePortraitOutline
    });
  }

  ngOnInit() {
    this.rafraichirDonnees();
  }

  rafraichirDonnees() {
    // Utiliser obtenirUtilisateurApp() au lieu de obtenirUtilisateurCourant()
    const u = this.authService.obtenirUtilisateurApp();
    if (u) {
      this.soldePortefeuille = Number(u.soldePortefeuille) || 0;
      this.telephoneFacturation = u.telephone || '';
    }

    this.paiementService.obtenirTransactions().subscribe({
      next: (data) => { this.transactions = data; }
    });
  }

  lancerDepot() {
    if (!this.montantDepot || this.montantDepot <= 0) {
      this.afficherToast('Veuillez spécifier un montant positif.');
      return;
    }

    if (!this.telephoneFacturation.trim()) {
      this.afficherToast('Veuillez spécifier votre numéro de téléphone.');
      return;
    }

    this.chargement = true;
    this.paiementService.deposerPortefeuille(this.montantDepot, this.modePaiement, this.telephoneFacturation).subscribe({
      next: (res) => {
        this.chargement = false;
        this.modalDepotOuvert = false;
        this.referenceTransaction = res.referenceTransaction;
        this.modalOtpOuvert = true;
      },
      error: (err) => {
        this.chargement = false;
        this.afficherToast(err.error?.message || 'Erreur lors du dépôt.');
      }
    });
  }

  validerDepotOtp() {
    if (!this.otpCode.trim()) {
      this.afficherToast('Entrez le code OTP reçu.');
      return;
    }

    this.chargement = true;
    this.paiementService.validerDepot(this.referenceTransaction, this.otpCode).subscribe({
      next: (res) => {
        this.chargement = false;
        this.modalOtpOuvert = false;
        this.otpCode = '';
        this.afficherToast('Dépôt validé ! Votre solde a été crédité.');

        // Mettre à jour la session locale
        this.authService.mettreAJourSoldeLocal(Number(res.nouveauSolde));
        this.rafraichirDonnees();
      },
      error: (err) => {
        this.chargement = false;
        this.afficherToast(err.error?.message || 'Code OTP incorrect.');
      }
    });
  }

  formaterDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  afficherToast(msg: string) {
    this.toastMessage = msg;
    this.toastOuvert = true;
  }

  redirigerVers(page: string) {
    this.router.navigate([`/${page}`]);
  }
}
