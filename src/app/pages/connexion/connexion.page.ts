import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, IonHeader, IonToolbar, IonTitle, IonButton, 
  IonItem, IonInput, IonText, IonIcon, IonToast 
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { phonePortraitOutline, mailOutline, keyOutline, arrowForwardOutline, star } from 'ionicons/icons';
import { AuthentificationService } from '../../services/authentification.service';

@Component({
  selector: 'app-connexion',
  standalone: true,
  imports: [
    CommonModule, FormsModule, IonContent, IonHeader, IonToolbar, 
    IonTitle, IonButton, IonItem, IonInput, IonText, IonIcon, IonToast
  ],
  template: `
    <ion-content [fullscreen]="true" class="auth-bg">
      <div class="auth-wrapper fade-in">
        <!-- Logo / Titre -->
        <div class="brand-container">
          <div class="logo-box">
            <span class="logo-text">R</span>
          </div>
          <h1 class="app-name">ResaGuinée</h1>
          <p class="app-tagline">Réservez logements, transports et restos en un clic</p>
        </div>

        <!-- Carte d'authentification -->
        <div class="resa-glass-card auth-card">
          <h2 class="card-title">{{ etape === 'telephone' ? 'Connexion' : 'Validation' }}</h2>
          <p class="card-subtitle">
            {{ etape === 'telephone' ? 'Saisissez votre email et numéro pour recevoir un code de vérification' : 'Entrez le code OTP reçu par SMS' }}
          </p>

          <div id="recaptcha-container"></div>

          <!-- Étape 1 : Email et numéro de téléphone -->
          <div *ngIf="etape === 'telephone'" class="input-group">
            <ion-item lines="none" class="auth-input-item">
              <ion-icon name="mail-outline" slot="start"></ion-icon>
              <ion-input 
                type="email" 
                placeholder="Adresse email (ex: mamadou@email.com)" 
                [(ngModel)]="email"
                name="email"
                required
              ></ion-input>
            </ion-item>

            <ion-item lines="none" class="auth-input-item">
              <ion-icon name="phone-portrait-outline" slot="start"></ion-icon>
              <ion-input 
                type="tel" 
                placeholder="Ex: 622 34 56 78" 
                [(ngModel)]="telephone"
                name="telephone"
              ></ion-input>
            </ion-item>
            
            <p class="info-text">Indicateur par défaut : <strong>+224 (Guinée)</strong></p>
            <p class="emulator-hint" *ngIf="aideEmulateur">{{ aideEmulateur }}</p>

            <ion-button expand="block" class="btn-premium" (click)="envoyerOtp()" [disabled]="chargement">
              {{ chargement ? 'Envoi...' : 'Obtenir le code' }}
              <ion-icon name="arrow-forward-outline" slot="end"></ion-icon>
            </ion-button>
          </div>

          <!-- Étape 2 : Code OTP -->
          <div *ngIf="etape === 'otp'" class="input-group">
            <ion-item lines="none" class="auth-input-item">
              <ion-icon name="key-outline" slot="start"></ion-icon>
              <ion-input 
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="Code reçu par SMS (ex: 123456)" 
                [(ngModel)]="otp"
                name="otp"
              ></ion-input>
            </ion-item>

            <div class="action-links">
              <span class="back-link" (click)="etape = 'telephone'">Modifier le numéro</span>
            </div>

            <ion-button expand="block" class="btn-premium" (click)="validerOtp()" [disabled]="chargement">
              {{ chargement ? 'Vérification...' : 'Confirmer' }}
              <ion-icon name="star" slot="end"></ion-icon>
            </ion-button>
          </div>
        </div>

        <div class="footer-note">
          <p>Pas encore de compte ? <strong (click)="redirigerInscription()">Inscrivez-vous ici</strong></p>
          <p class="partenaire-link">Vous êtes un partenaire ? <strong (click)="redirigerPartenaire()">Inscrivez-vous ici</strong></p>
        </div>
      </div>

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
    .auth-bg {
      --background: radial-gradient(circle at 10% 20%, rgba(255, 74, 34, 0.08) 0%, transparent 40%),
                    radial-gradient(circle at 90% 80%, rgba(26, 92, 255, 0.08) 0%, transparent 40%),
                    var(--ion-background-color);
    }

    .auth-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 100%;
      padding: 24px;
    }

    .brand-container {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-box {
      width: 64px;
      height: 64px;
      background: var(--resa-gradient-primary);
      border-radius: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(255, 74, 34, 0.25);
      margin-bottom: 16px;
    }

    .logo-text {
      color: white;
      font-size: 2.2rem;
      font-weight: 800;
    }

    .app-name {
      font-size: 2.2rem;
      font-weight: 800;
      margin: 0;
      color: var(--ion-text-color);
      letter-spacing: -0.5px;
    }

    .app-tagline {
      font-size: 0.9rem;
      color: var(--ion-color-medium);
      margin: 6px 0 0 0;
      max-width: 280px;
    }

    .auth-card {
      width: 100%;
      max-width: 380px;
      padding: 28px;
    }

    .card-title {
      font-size: 1.4rem;
      font-weight: 700;
      margin: 0 0 6px 0;
      color: var(--ion-text-color);
    }

    .card-subtitle {
      font-size: 0.85rem;
      color: var(--ion-color-medium);
      line-height: 1.4;
      margin: 0 0 24px 0;
    }

    .auth-input-item {
      --background: rgba(var(--ion-color-light-rgb), 0.5);
      --border-radius: 12px;
      --padding-start: 12px;
      margin-bottom: 12px;
      border: 1px solid var(--resa-glass-border);

      ion-icon {
        color: var(--ion-color-medium);
        font-size: 1.2rem;
        margin-right: 8px;
      }
    }

    .info-text {
      font-size: 0.75rem;
      color: var(--ion-color-medium);
      margin: 0 0 20px 4px;
    }

    .emulator-hint {
      font-size: 0.72rem;
      color: var(--ion-color-warning-shade, #b8860b);
      margin: 0 0 16px 4px;
      line-height: 1.35;
    }

    .action-links {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
      
      .back-link {
        font-size: 0.8rem;
        color: var(--ion-color-secondary);
        font-weight: 600;
        cursor: pointer;
      }
    }

    .footer-note {
      margin-top: 32px;
      font-size: 0.9rem;
      color: var(--ion-color-medium);
      text-align: center;
      
      strong {
        color: var(--ion-color-primary);
        cursor: pointer;
      }
    }

    .partenaire-link {
      margin-top: 12px;
      font-size: 0.8rem;
      opacity: 0.85;
    }
  `]
})
export class ConnexionPage implements OnInit {
  email = '';
  telephone = '';
  otp = '';
  etape: 'telephone' | 'otp' = 'telephone';
  chargement = false;
  returnUrl = '/accueil';
  aideEmulateur: string | null = null;
  
  toastOuvert = false;
  toastMessage = '';

  constructor(
    private authService: AuthentificationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    addIcons({ phonePortraitOutline, mailOutline, keyOutline, arrowForwardOutline, star });
  }

  ngOnInit() {
    this.aideEmulateur = this.authService.obtenirAideOtpEmulateur();
    this.route.queryParams.subscribe(params => {
      this.returnUrl = params['returnUrl'] || '/accueil';
    });
  }

  afficherToast(msg: string) {
    this.toastMessage = msg;
    this.toastOuvert = true;
  }

  envoyerOtp() {
    if (!this.email.trim()) {
      this.afficherToast('Veuillez saisir votre adresse email.');
      return;
    }

    if (!this.emailValide(this.email)) {
      this.afficherToast('Veuillez saisir une adresse email valide.');
      return;
    }

    if (!this.telephone.trim()) {
      this.afficherToast('Veuillez saisir votre numéro de téléphone.');
      return;
    }
    
    this.chargement = true;
    let num = this.telephone.replace(/\s+/g, '');
    if (!num.startsWith('+')) {
      if (num.startsWith('224')) {
        num = '+' + num;
      } else {
        num = '+224' + num;
      }
    }

    this.authService.definirProfilEnAttente({
      nomComplet: 'Utilisateur ResaGuinée',
      email: this.email.trim().toLowerCase(),
      telephone: num,
      role: 'client',
    });

    this.authService.demanderOtpFirebase(num).subscribe({
      next: (res) => {
        this.chargement = false;
        this.afficherToast(res.message || 'Code OTP envoyé.');
        this.etape = 'otp';
      },
      error: (err) => {
        this.chargement = false;
        this.afficherToast(err.message || 'Erreur lors de la demande OTP.');
      }
    });
  }

  validerOtp() {
    const code = AuthentificationService.normaliserCodeOtp(this.otp);
    if (!code) {
      this.afficherToast('Veuillez saisir le code OTP.');
      return;
    }

    this.chargement = true;

    this.authService.validerOtpFirebase(code).subscribe({
      next: (utilisateur) => {
        this.chargement = false;
        this.afficherToast('Connexion réussie !');
        const destination = this.returnUrl !== '/accueil'
          ? this.returnUrl
          : this.authService.obtenirRouteApresConnexion(utilisateur.role);
        this.router.navigateByUrl(destination);
      },
      error: (err) => {
        this.chargement = false;
        this.afficherToast(err.message || 'OTP invalide.');
      }
    });
  }

  redirigerInscription() {
    this.router.navigate(['/inscription-rapide'], { queryParams: { returnUrl: this.returnUrl } });
  }

  redirigerPartenaire() {
    this.router.navigate(['/inscription-partenaire']);
  }

  private emailValide(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }
}
