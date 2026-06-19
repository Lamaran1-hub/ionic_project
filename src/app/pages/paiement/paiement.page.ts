import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonHeader, IonToolbar, IonButton,
  IonIcon, IonItem, IonLabel, IonInput, IonToast,
  IonRadioGroup, IonRadio, IonModal
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline, cardOutline, phonePortraitOutline,
  walletOutline, shieldCheckmarkOutline, lockClosedOutline
} from 'ionicons/icons';
import { PaiementService } from '../../services/paiement.service';
import { AuthentificationService } from '../../services/authentification.service';

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar,
    IonButton, IonIcon, IonItem, IonLabel, IonInput, IonToast,
    IonRadioGroup, IonRadio, IonModal
  ],
  template: `
    <ion-content [fullscreen]="true">
      
      <!-- Retour -->
      <div class="header-nav">
        <div class="back-btn" (click)="retourner()">
          <ion-icon name="arrow-back-outline"></ion-icon>
        </div>
        <h2 class="nav-title">Validation de Paiement</h2>
      </div>

      <div class="paiement-wrapper fade-in">
        
        <!-- Ticket de Synthèse -->
        <div class="resa-glass-card bill-summary-card">
          <span class="label">Total à payer</span>
          <h1 class="total-amount">{{ totalMontant | number }} GNF</h1>
          <p class="description">{{ libelleFacture }}</p>
        </div>

        <h3 class="section-title">Mode de règlement</h3>

        <!-- Liste des modes de paiements -->
        <ion-radio-group [(ngModel)]="modeSelectionne" class="modes-list">
          
          <!-- Portefeuille Interne -->
          <div [class]="'mode-card ' + (modeSelectionne === 'portefeuille' ? 'active' : '')">
            <ion-radio value="portefeuille" aria-label="Portefeuille Interne"></ion-radio>
            <div class="mode-info">
              <ion-icon name="wallet-outline" class="wallet-icon"></ion-icon>
              <div class="text-box">
                <span class="title">Portefeuille ResaGuinée</span>
                <span class="subtitle">Solde : {{ (soldePortefeuille || 0) | number }} GNF</span>
              </div>
            </div>
          </div>

          <!-- Orange Money -->
          <div [class]="'mode-card ' + (modeSelectionne === 'orange_money' ? 'active' : '')">
            <ion-radio value="orange_money" aria-label="Orange Money"></ion-radio>
            <div class="mode-info">
              <div class="om-logo">OM</div>
              <div class="text-box">
                <span class="title">Orange Money Guinée</span>
                <span class="subtitle">Paiement direct par code OTP</span>
              </div>
            </div>
          </div>

          <!-- MTN Mobile Money -->
          <div [class]="'mode-card ' + (modeSelectionne === 'mtn_money' ? 'active' : '')">
            <ion-radio value="mtn_money" aria-label="MTN Money"></ion-radio>
            <div class="mode-info">
              <div class="mtn-logo">Momo</div>
              <div class="text-box">
                <span class="title">MTN Mobile Money</span>
                <span class="subtitle">Confirmation USSD Push</span>
              </div>
            </div>
          </div>

        </ion-radio-group>

        <!-- Saisie du numéro pour Mobile Money -->
        <div class="resa-glass-card phone-card" *ngIf="modeSelectionne !== 'portefeuille'">
          <h4 class="card-section-title">Numéro de téléphone de facturation</h4>
          <ion-item lines="none" class="phone-input-item">
            <ion-icon name="phone-portrait-outline" slot="start"></ion-icon>
            <ion-input type="tel" placeholder="Ex: 622 34 56 78" [(ngModel)]="telephoneFacturation"></ion-input>
          </ion-item>
          <span class="indicator">+224 (Guinée)</span>
        </div>

        <ion-button expand="block" class="btn-premium pay-btn" (click)="lancerPaiement()" [disabled]="chargement">
          {{ chargement ? 'Traitement en cours...' : 'Confirmer et Payer' }}
        </ion-button>

      </div>

      <!-- Modal de saisie du Code OTP pour Orange/MTN Money -->
      <ion-modal [isOpen]="modalOtpOuvert" class="otp-modal-container">
        <ng-template>
          <div class="modal-wrapper">
            <div class="modal-header">
              <div class="vendor-badge" [class]="modeSelectionne">
                {{ modeSelectionne === 'orange_money' ? 'Orange Money' : 'MTN Momo' }}
              </div>
              <h3>Saisie du code OTP</h3>
              <p>Saisissez le code temporaire affiché sur votre écran ou généré via USSD.</p>
            </div>
            
            <div class="modal-body">
              <ion-item lines="none" class="otp-input-item">
                <ion-icon name="lock-closed-outline" slot="start"></ion-icon>
                <ion-input type="password" placeholder="Ex: 1234" [(ngModel)]="otpCode" class="otp-input"></ion-input>
              </ion-item>

              <p class="simul-note"><strong>Note simulation :</strong> Entrez tout code (ex: 1234) pour valider, ou '0000' pour simuler un échec.</p>

              <ion-button expand="block" class="btn-premium" (click)="validerOtp()" [disabled]="chargement">
                {{ chargement ? 'Validation...' : 'Valider la transaction' }}
              </ion-button>
            </div>
          </div>
        </ng-template>
      </ion-modal>

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
    .header-nav {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      gap: 16px;
      background: var(--ion-background-color);
      
      .back-btn {
        width: 38px;
        height: 38px;
        background: var(--ion-color-light);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--ion-text-color);
        cursor: pointer;
      }
      .nav-title {
        font-size: 1.25rem;
        font-weight: 700;
        margin: 0;
      }
    }

    .paiement-wrapper {
      padding: 16px 20px;
    }

    .bill-summary-card {
      padding: 24px;
      text-align: center;
      margin-bottom: 24px;
      background: var(--resa-gradient-secondary);
      color: white;

      .label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        opacity: 0.8;
      }
      .total-amount {
        font-size: 2.2rem;
        font-weight: 800;
        margin: 6px 0;
      }
      .description {
        font-size: 0.85rem;
        opacity: 0.9;
        margin: 0;
      }
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin: 0 0 16px 0;
    }

    .modes-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .mode-card {
      display: flex;
      align-items: center;
      background: var(--ion-card-background, #ffffff);
      border: 1px solid var(--resa-glass-border, rgba(0,0,0,0.05));
      border-radius: 16px;
      padding: 16px;
      gap: 12px;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      
      ion-radio {
        --color: var(--ion-color-medium);
        --color-checked: var(--ion-color-primary);
      }

      &.active {
        border-color: var(--ion-color-primary);
        box-shadow: 0 4px 12px rgba(255, 74, 34, 0.08);
      }
    }

    .mode-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;

      .wallet-icon {
        font-size: 1.8rem;
        color: var(--ion-color-secondary);
      }

      .om-logo {
        width: 38px;
        height: 38px;
        background: #ff6600;
        color: white;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.95rem;
      }

      .mtn-logo {
        width: 38px;
        height: 38px;
        background: #ffcc00;
        color: #002244;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 0.8rem;
      }

      .text-box {
        display: flex;
        flex-direction: column;
        
        .title {
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--ion-text-color);
        }
        .subtitle {
          font-size: 0.8rem;
          color: var(--ion-color-medium);
        }
      }
    }

    // Téléphone
    .phone-card {
      padding: 16px;
      margin-bottom: 24px;
    }
    
    .card-section-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--ion-color-medium);
      text-transform: uppercase;
      margin: 0 0 12px 0;
    }

    .phone-input-item {
      --background: var(--ion-color-light);
      --border-radius: 10px;
      --padding-start: 12px;
      margin-bottom: 6px;
      
      ion-icon {
        color: var(--ion-color-medium);
      }
    }

    .indicator {
      font-size: 0.75rem;
      color: var(--ion-color-medium);
      margin-left: 4px;
    }

    .pay-btn {
      margin-top: 32px;
      margin-bottom: 40px;
    }

    // Modal OTP
    .modal-wrapper {
      padding: 24px;
      background: var(--ion-background-color);
      height: 100%;
    }

    .modal-header {
      text-align: center;
      margin-bottom: 30px;
      
      .vendor-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 12px;
        
        &.orange_money {
          background: #ffe6d5;
          color: #ff6600;
        }
        &.mtn_money {
          background: #fff9d5;
          color: #b38600;
        }
      }

      h3 {
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0 0 6px 0;
      }
      p {
        font-size: 0.85rem;
        color: var(--ion-color-medium);
        line-height: 1.4;
      }
    }

    .otp-input-item {
      --background: var(--ion-color-light);
      --border-radius: 12px;
      --padding-start: 12px;
      margin-bottom: 12px;
      border: 1px solid var(--resa-glass-border);
    }

    .otp-input {
      font-size: 1.3rem;
      letter-spacing: 4px;
      text-align: center;
    }

    .simul-note {
      font-size: 0.75rem;
      color: var(--ion-color-medium);
      margin: 12px 0 24px 0;
      line-height: 1.3;
    }
  `]
})
export class PaiementPage implements OnInit {
  reservationId!: string;
  totalMontant = 0;
  libelleFacture = '';

  modeSelectionne: 'portefeuille' | 'orange_money' | 'mtn_money' = 'portefeuille';
  telephoneFacturation = '';
  soldePortefeuille = 0;

  chargement = false;
  toastOuvert = false;
  toastMessage = '';

  // Modal OTP
  modalOtpOuvert = false;
  referenceTransaction = '';
  otpCode = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paiementService: PaiementService,
    private authService: AuthentificationService
  ) {
    addIcons({ arrowBackOutline, cardOutline, phonePortraitOutline, walletOutline, shieldCheckmarkOutline, lockClosedOutline });
  }

  ngOnInit() {
    this.reservationId = this.route.snapshot.paramMap.get('id')!;
    this.route.queryParams.subscribe(params => {
      this.totalMontant = Number(params['total']) || 0;
      this.libelleFacture = params['libelle'] || 'Règlement de réservation';
    });

    const utilisateur = this.authService.obtenirUtilisateurApp()
    if (utilisateur) {
      this.soldePortefeuille = Number(utilisateur.soldePortefeuille) || 0;
      this.telephoneFacturation = utilisateur.telephone || '';
    }
  }

  lancerPaiement() {
    this.chargement = true;

    this.paiementService.payer(
      this.reservationId,
      this.modeSelectionne,
      this.modeSelectionne !== 'portefeuille' ? this.telephoneFacturation : undefined
    ).subscribe({
      next: (res) => {
        this.chargement = false;

        if (this.modeSelectionne === 'portefeuille') {
          // Déduction directe réussie
          this.afficherToast('Réservation payée et validée avec succès !');
          // Mettre à jour le solde dans la session locale
          const nouveauSolde = this.soldePortefeuille - this.totalMontant;
          this.authService.mettreAJourSoldeLocal(nouveauSolde);
          this.router.navigate(['/reservations']);
        } else {
          // En attente d'OTP Mobile Money
          this.referenceTransaction = res.referenceTransaction;
          this.modalOtpOuvert = true;
        }
      },
      error: (err) => {
        this.chargement = false;
        this.afficherToast(err.error?.message || 'Échec de l\'initialisation du paiement.');
      }
    });
  }

  validerOtp() {
    if (!this.otpCode.trim()) {
      this.afficherToast('Veuillez entrer le code OTP.');
      return;
    }

    this.chargement = true;
    this.paiementService.validerOtp(this.referenceTransaction, this.otpCode).subscribe({
      next: (res) => {
        this.chargement = false;
        this.modalOtpOuvert = false;

        if (res.statut === 'echoue') {
          this.afficherToast('La transaction a été annulée ou a échoué.');
        } else {
          this.afficherToast('Paiement Mobile Money validé avec succès !');
          this.router.navigate(['/reservations']);
        }
      },
      error: (err) => {
        this.chargement = false;
        this.afficherToast(err.error?.message || 'Code OTP incorrect.');
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
