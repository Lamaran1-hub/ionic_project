import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonButton, IonItem, IonInput, IonIcon, IonToast,
  IonSelect, IonSelectOption,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline, phonePortraitOutline, mailOutline, businessOutline,
  keyOutline, arrowBackOutline, arrowForwardOutline, shieldCheckmarkOutline,
} from 'ionicons/icons';
import { AuthentificationService } from '../../services/authentification.service';
import { RoleUtilisateur } from '../../models/utilisateur.model';

@Component({
  selector: 'app-inscription-partenaire',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonButton, IonItem,
    IonInput, IonIcon, IonToast, IonSelect, IonSelectOption,
  ],
  template: `
    <ion-content [fullscreen]="true" class="auth-bg">
      <div class="auth-wrapper fade-in">
        <div class="back-nav" (click)="retourAccueil()">
          <ion-icon name="arrow-back-outline"></ion-icon>
          <span>Accueil</span>
        </div>

        <div class="brand-container small">
          <h1 class="app-name">Espace Partenaire</h1>
          <p class="app-tagline">Inscrivez votre entreprise sur ResaGuinée</p>
        </div>

        <div class="resa-glass-card auth-card">
          <p class="step-label">{{ etape === 'formulaire' ? 'Étape 1/2 — Votre entreprise' : 'Étape 2/2 — Vérification SMS' }}</p>

          <div id="recaptcha-container"></div>

          <div *ngIf="etape === 'formulaire'" class="input-group">
            <ion-item lines="none" class="auth-input-item">
              <ion-icon name="person-outline" slot="start"></ion-icon>
              <ion-input type="text" placeholder="Nom & prénom du gérant" [(ngModel)]="nomComplet" name="nomComplet"></ion-input>
            </ion-item>

            <ion-item lines="none" class="auth-input-item">
              <ion-icon name="mail-outline" slot="start"></ion-icon>
              <ion-input type="email" placeholder="Email professionnel" [(ngModel)]="email" name="email"></ion-input>
            </ion-item>

            <ion-item lines="none" class="auth-input-item">
              <ion-icon name="phone-portrait-outline" slot="start"></ion-icon>
              <ion-input type="tel" placeholder="Téléphone (authentifié par OTP)" [(ngModel)]="telephone" name="telephone"></ion-input>
            </ion-item>

            <ion-item lines="none" class="auth-input-item">
              <ion-icon name="shield-checkmark-outline" slot="start"></ion-icon>
              <ion-select placeholder="Type de partenaire" [(ngModel)]="typePartenaire" name="typePartenaire" interface="popover">
                <ion-select-option value="hote">Hôtel / Logement</ion-select-option>
                <ion-select-option value="transport">Transport</ion-select-option>
                <ion-select-option value="restaurant">Restaurant</ion-select-option>
                <ion-select-option value="evenement">Événement</ion-select-option>
              </ion-select>
            </ion-item>

            <ion-item lines="none" class="auth-input-item">
              <ion-icon name="business-outline" slot="start"></ion-icon>
              <ion-input type="text" placeholder="Nom de l'entreprise / enseigne" [(ngModel)]="nomEntreprise" name="nomEntreprise"></ion-input>
            </ion-item>

            <ion-button expand="block" class="btn-premium" (click)="envoyerOtp()" [disabled]="chargement">
              {{ chargement ? 'Envoi...' : 'Vérifier mon numéro' }}
              <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
            </ion-button>
          </div>

          <div *ngIf="etape === 'otp'" class="input-group">
            <ion-item lines="none" class="auth-input-item">
              <ion-icon name="key-outline" slot="start"></ion-icon>
              <ion-input type="text" inputmode="numeric" maxlength="6" placeholder="Code OTP reçu par SMS" [(ngModel)]="otp" name="otp"></ion-input>
            </ion-item>

            <span class="back-link" (click)="etape = 'formulaire'">Modifier le formulaire</span>

            <ion-button expand="block" class="btn-premium signup-btn" (click)="validerOtp()" [disabled]="chargement">
              {{ chargement ? 'Création...' : 'Créer mon espace partenaire' }}
            </ion-button>
          </div>
        </div>

        <p class="footer-link">Déjà partenaire ? <strong (click)="allerConnexion()">Se connecter</strong></p>
      </div>

      <ion-toast [isOpen]="toastOuvert" [message]="toastMessage" [duration]="2500"
        (didDismiss)="toastOuvert = false" color="dark"></ion-toast>
    </ion-content>
  `,
  styles: [`
    .auth-bg {
      --background: radial-gradient(circle at 10% 20%, rgba(26, 92, 255, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 90% 80%, rgba(255, 74, 34, 0.08) 0%, transparent 40%),
        var(--ion-background-color);
    }
    .auth-wrapper { display: flex; flex-direction: column; align-items: center; min-height: 100%; padding: 24px; position: relative; }
    .back-nav {
      position: absolute; top: 16px; left: 16px; display: flex; align-items: center; gap: 6px;
      font-size: 0.9rem; color: var(--ion-color-secondary); font-weight: 600; cursor: pointer;
    }
    .brand-container { text-align: center; margin-bottom: 20px; &.small { margin-top: 48px; } }
    .app-name { font-size: 1.75rem; font-weight: 800; margin: 0; }
    .app-tagline { font-size: 0.85rem; color: var(--ion-color-medium); margin: 8px 0 0; }
    .auth-card { width: 100%; max-width: 400px; padding: 24px; }
    .step-label { font-size: 0.8rem; color: var(--ion-color-medium); margin: 0 0 16px; }
    .auth-input-item {
      --background: rgba(var(--ion-color-light-rgb), 0.5); --border-radius: 12px; --padding-start: 12px;
      margin-bottom: 14px; border: 1px solid var(--resa-glass-border);
      ion-icon { color: var(--ion-color-medium); margin-right: 8px; }
    }
    .back-link { display: block; text-align: right; font-size: 0.8rem; color: var(--ion-color-secondary); font-weight: 600; cursor: pointer; margin-bottom: 16px; }
    .signup-btn { margin-top: 8px; }
    .footer-link { margin-top: 24px; font-size: 0.9rem; color: var(--ion-color-medium); strong { color: var(--ion-color-primary); cursor: pointer; } }
  `]
})
export class InscriptionPartenairePage {
  nomComplet = '';
  email = '';
  telephone = '';
  nomEntreprise = '';
  typePartenaire: RoleUtilisateur = 'hote';
  otp = '';
  etape: 'formulaire' | 'otp' = 'formulaire';
  chargement = false;
  toastOuvert = false;
  toastMessage = '';

  constructor(
    private authService: AuthentificationService,
    private router: Router
  ) {
    addIcons({
      personOutline, phonePortraitOutline, mailOutline, businessOutline,
      keyOutline, arrowBackOutline, arrowForwardOutline, shieldCheckmarkOutline,
    });
  }

  afficherToast(msg: string) {
    this.toastMessage = msg;
    this.toastOuvert = true;
  }

  envoyerOtp() {
    if (!this.nomComplet.trim() || !this.email.trim() || !this.telephone.trim() || !this.nomEntreprise.trim()) {
      this.afficherToast('Tous les champs sont obligatoires.');
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
      role: this.typePartenaire,
      nomEntreprise: this.nomEntreprise.trim(),
    }).subscribe({
      next: () => {
        this.chargement = false;
        this.etape = 'otp';
        this.afficherToast('Code OTP envoyé.');
      },
      error: (err) => {
        this.chargement = false;
        this.afficherToast(err.message || 'Erreur OTP.');
      },
    });
  }

  validerOtp() {
    const code = AuthentificationService.normaliserCodeOtp(this.otp);
    if (!code) {
      this.afficherToast('Saisissez le code OTP.');
      return;
    }
    this.chargement = true;
    this.authService.finaliserInscriptionOtp(code).subscribe({
      next: (utilisateur) => {
        this.chargement = false;
        this.afficherToast('Espace partenaire créé !');
        this.router.navigateByUrl(this.authService.obtenirRouteApresConnexion(utilisateur.role));
      },
      error: (err) => {
        this.chargement = false;
        this.afficherToast(err.message || 'Code invalide.');
      },
    });
  }

  retourAccueil() {
    this.router.navigate(['/accueil']);
  }

  allerConnexion() {
    this.router.navigate(['/connexion']);
  }

  private emailValide(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
}
