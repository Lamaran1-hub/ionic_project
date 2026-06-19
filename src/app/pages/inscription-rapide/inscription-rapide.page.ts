import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  IonContent, IonButton, IonItem, IonInput, IonIcon, IonToast,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, phonePortraitOutline, mailOutline, keyOutline,
  arrowBackOutline, arrowForwardOutline,
} from 'ionicons/icons';
import { AuthentificationService } from '../../services/authentification.service';

@Component({
  selector: 'app-inscription-rapide',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonButton, IonItem,
    IonInput, IonIcon, IonToast,
  ],
  template: `
    <ion-content [fullscreen]="true" class="auth-bg">
      <div class="auth-wrapper fade-in">
        <div class="back-nav" (click)="retour()">
          <ion-icon name="arrow-back-outline"></ion-icon>
          <span>Retour</span>
        </div>

        <div class="brand-container small">
          <h1 class="app-name">Inscription rapide</h1>
          <p class="app-tagline">Créez votre compte en quelques secondes pour finaliser votre réservation</p>
        </div>

        <div class="resa-glass-card auth-card">
          <p class="step-label">{{ etape === 'formulaire' ? 'Étape 1/2 — Vos informations' : 'Étape 2/2 — Code SMS' }}</p>

          <div id="recaptcha-container"></div>

          <div *ngIf="etape === 'formulaire'" class="input-group">
            <ion-item lines="none" class="auth-input-item">
              <ion-icon name="person-outline" slot="start"></ion-icon>
              <ion-input type="text" placeholder="Nom complet" [(ngModel)]="nomComplet" name="nomComplet"></ion-input>
            </ion-item>

            <ion-item lines="none" class="auth-input-item">
              <ion-icon name="mail-outline" slot="start"></ion-icon>
              <ion-input type="email" placeholder="Adresse email" [(ngModel)]="email" name="email"></ion-input>
            </ion-item>

            <ion-item lines="none" class="auth-input-item">
              <ion-icon name="phone-portrait-outline" slot="start"></ion-icon>
              <ion-input type="tel" placeholder="Numéro (ex: 622 34 56 78)" [(ngModel)]="telephone" name="telephone"></ion-input>
            </ion-item>

            <p class="info-text">Indicateur par défaut : <strong>+224 (Guinée)</strong></p>

            <ion-button expand="block" class="btn-premium" (click)="envoyerOtp()" [disabled]="chargement">
              {{ chargement ? 'Envoi...' : 'Recevoir le code SMS' }}
              <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
            </ion-button>
          </div>

          <div *ngIf="etape === 'otp'" class="input-group">
            <ion-item lines="none" class="auth-input-item">
              <ion-icon name="key-outline" slot="start"></ion-icon>
              <ion-input type="text" inputmode="numeric" maxlength="6" placeholder="Code reçu par SMS" [(ngModel)]="otp" name="otp"></ion-input>
            </ion-item>

            <span class="back-link" (click)="etape = 'formulaire'">Modifier mes informations</span>

            <ion-button expand="block" class="btn-premium signup-btn" (click)="validerOtp()" [disabled]="chargement">
              {{ chargement ? 'Validation...' : 'Créer mon compte' }}
            </ion-button>
          </div>
        </div>

        <p class="footer-link">Déjà inscrit ? <strong (click)="allerConnexion()">Se connecter</strong></p>
      </div>

      <ion-toast [isOpen]="toastOuvert" [message]="toastMessage" [duration]="2500"
        (didDismiss)="toastOuvert = false" color="dark"></ion-toast>
    </ion-content>
  `,
  styles: [`
    .auth-bg {
      --background: radial-gradient(circle at 10% 20%, rgba(255, 74, 34, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(26, 92, 255, 0.08) 0%, transparent 40%),
        var(--ion-background-color);
    }
    .auth-wrapper { display: flex; flex-direction: column; align-items: center; min-height: 100%; padding: 24px; position: relative; }
    .back-nav {
      position: absolute; top: 16px; left: 16px; display: flex; align-items: center; gap: 6px;
      font-size: 0.9rem; color: var(--ion-color-secondary); font-weight: 600; cursor: pointer; z-index: 10;
    }
    .brand-container { text-align: center; margin-bottom: 20px; &.small { margin-top: 48px; } }
    .app-name { font-size: 1.75rem; font-weight: 800; margin: 0; }
    .app-tagline { font-size: 0.85rem; color: var(--ion-color-medium); margin: 8px 0 0; max-width: 320px; }
    .auth-card { width: 100%; max-width: 380px; padding: 24px; }
    .step-label { font-size: 0.8rem; color: var(--ion-color-medium); margin: 0 0 16px; }
    .auth-input-item {
      --background: rgba(var(--ion-color-light-rgb), 0.5); --border-radius: 12px; --padding-start: 12px;
      margin-bottom: 14px; border: 1px solid var(--resa-glass-border);
      ion-icon { color: var(--ion-color-medium); margin-right: 8px; }
    }
    .info-text { font-size: 0.75rem; color: var(--ion-color-medium); margin: 0 0 16px 4px; }
    .back-link { display: block; text-align: right; font-size: 0.8rem; color: var(--ion-color-secondary); font-weight: 600; cursor: pointer; margin-bottom: 16px; }
    .signup-btn { margin-top: 8px; }
    .footer-link { margin-top: 24px; font-size: 0.9rem; color: var(--ion-color-medium); strong { color: var(--ion-color-primary); cursor: pointer; } }
  `]
})
export class InscriptionRapidePage implements OnInit {
  nomComplet = '';
  email = '';
  telephone = '';
  otp = '';
  etape: 'formulaire' | 'otp' = 'formulaire';
  chargement = false;
  returnUrl = '/accueil';
  toastOuvert = false;
  toastMessage = '';

  constructor(
    private authService: AuthentificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ personOutline, phonePortraitOutline, mailOutline, keyOutline, arrowBackOutline, arrowForwardOutline });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.returnUrl = params['returnUrl'] || '/accueil';
    });
  }

  afficherToast(msg: string) {
    this.toastMessage = msg;
    this.toastOuvert = true;
  }

  envoyerOtp() {
    if (!this.nomComplet.trim() || !this.email.trim() || !this.telephone.trim()) {
      this.afficherToast('Nom, email et téléphone sont obligatoires.');
      return;
    }
    if (!this.emailValide(this.email)) {
      this.afficherToast('Adresse email invalide.');
      return;
    }

    this.chargement = true;
    this.authService.sinscrireAvecOtp({
      nomComplet: this.nomComplet.trim(),
      email: this.email.trim().toLowerCase(),
      telephone: this.telephone,
      role: 'client',
    }).subscribe({
      next: () => {
        this.chargement = false;
        this.etape = 'otp';
        this.afficherToast('Code envoyé par SMS.');
      },
      error: (err) => {
        this.chargement = false;
        this.afficherToast(err.message || 'Erreur lors de l\'envoi du code.');
      },
    });
  }

  validerOtp() {
    const code = AuthentificationService.normaliserCodeOtp(this.otp);
    if (!code) {
      this.afficherToast('Saisissez le code reçu par SMS.');
      return;
    }
    this.chargement = true;
    this.authService.finaliserInscriptionOtp(code).subscribe({
      next: () => {
        this.chargement = false;
        this.afficherToast('Compte créé !');
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.chargement = false;
        this.afficherToast(err.message || 'Code invalide.');
      },
    });
  }

  retour() {
    this.router.navigateByUrl(this.returnUrl);
  }

  allerConnexion() {
    this.router.navigate(['/connexion'], { queryParams: { returnUrl: this.returnUrl } });
  }

  private emailValide(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
}
