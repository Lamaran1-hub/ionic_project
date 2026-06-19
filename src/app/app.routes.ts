import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { AuthentificationService } from './services/authentification.service';
import { Router } from '@angular/router';

export const routes: Routes = [
  {
    path: 'onboarding',
    loadComponent: () => import('./pages/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'connexion',
    loadComponent: () => import('./pages/connexion/connexion.page').then((m) => m.ConnexionPage),
  },
  {
    path: 'inscription',
    redirectTo: 'inscription-rapide',
    pathMatch: 'full',
  },
  {
    path: 'inscription-rapide',
    loadComponent: () =>
      import('./pages/inscription-rapide/inscription-rapide.page').then((m) => m.InscriptionRapidePage),
  },
  {
    path: 'inscription-partenaire',
    loadComponent: () =>
      import('./pages/inscription-partenaire/inscription-partenaire.page').then((m) => m.InscriptionPartenairePage),
  },
  {
    path: 'accueil',
    loadComponent: () => import('./pages/accueil/accueil.page').then((m) => m.AccueilPage),
  },
  {
    path: 'details/:id',
    loadComponent: () => import('./pages/details/details.page').then((m) => m.DetailsPage),
  },
  {
    path: 'paiement/:id',
    loadComponent: () => import('./pages/paiement/paiement.page').then((m) => m.PaiementPage),
  },
  {
    path: 'reservations',
    loadComponent: () => import('./pages/reservations/reservations.page').then((m) => m.ReservationsPage),
  },
  {
    path: 'portefeuille',
    loadComponent: () => import('./pages/portefeuille/portefeuille.page').then((m) => m.PortefeuillePage),
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.page').then((m) => m.ChatPage),
  },
  {
    path: 'transport',
    loadComponent: () => import('./pages/transport/transport.page').then((m) => m.TransportPage),
  },
  {
    path: 'restaurant',
    loadComponent: () => import('./pages/restaurant/restaurant.page').then((m) => m.RestaurantPage),
  },
  {
    path: 'evenement',
    loadComponent: () => import('./pages/evenement/evenement.page').then((m) => m.EvenementPage),
  },
  {
    path: 'notifications',
    loadComponent: () => import('./pages/notifications/notifications.page').then((m) => m.NotificationsPage),
  },
  {
    path: 'favoris',
    loadComponent: () => import('./pages/favoris/favoris.page').then((m) => m.FavorisPage),
  },
  {
    path: 'dashboards',
    loadComponent: () => import('./pages/dashboards/dashboards.page').then((m) => m.DashboardsPage),
  },
  {
    path: 'splash',
    redirectTo: 'onboarding',
    pathMatch: 'full',
  },
  {
    path: '',
    pathMatch: 'full',
    canActivate: [
      () => {
        const auth = inject(AuthentificationService);
        const router = inject(Router);
        if (auth.doitAfficherOnboarding()) {
          return router.createUrlTree(['/onboarding']);
        }
        if (auth.estConnecte()) {
          return router.createUrlTree([
            auth.obtenirRouteApresConnexion(auth.obtenirUtilisateurApp()?.role),
          ]);
        }
        return router.createUrlTree(['/accueil']);
      },
    ],
    loadComponent: () => import('./pages/accueil/accueil.page').then((m) => m.AccueilPage),
  },
];
