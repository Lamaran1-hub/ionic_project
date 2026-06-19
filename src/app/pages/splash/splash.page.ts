import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthentificationService } from '../../services/authentification.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [CommonModule, IonContent],
  template: `
    <ion-content class="splash-bg">
      <div class="splash-container fade-scale-in">
        <div class="logo-box">
          <span class="logo-text">R</span>
        </div>
        <h1 class="app-name">ResaGuinée</h1>
        <p class="app-tagline">Réservez logements, transports et restos en un clic</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .splash-bg {
      --background: radial-gradient(circle at 50% 50%, rgba(255, 74, 34, 0.15) 0%, var(--ion-background-color) 70%);
    }

    .splash-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      text-align: center;
      padding: 24px;
    }

    .logo-box {
      width: 100px;
      height: 100px;
      background: var(--resa-gradient-primary, linear-gradient(135deg, #FF4A22 0%, #FF8A00 100%));
      border-radius: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 32px rgba(255, 74, 34, 0.3);
      margin-bottom: 24px;
    }

    .logo-text {
      color: white;
      font-size: 3.5rem;
      font-weight: 800;
    }

    .app-name {
      font-size: 2.8rem;
      font-weight: 800;
      color: var(--ion-text-color, #ffffff);
      letter-spacing: -0.5px;
      margin: 0;
    }

    .app-tagline {
      font-size: 0.95rem;
      color: var(--ion-color-medium);
      margin: 12px 0 0;
      max-width: 280px;
    }

    .fade-scale-in {
      animation: fadeScale 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    @keyframes fadeScale {
      0% { opacity: 0; transform: scale(0.85); }
      100% { opacity: 1; transform: scale(1); }
    }
  `]
})
export class SplashPage implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthentificationService
  ) {}

  ngOnInit() {
    setTimeout(() => {
      this.authService.marquerOnboardingTermine();
      const destination = this.authService.estConnecte()
        ? this.authService.obtenirRouteApresConnexion(this.authService.obtenirUtilisateurApp()?.role)
        : '/accueil';
      this.router.navigateByUrl(destination, { replaceUrl: true });
    }, 5000);
  }
}
