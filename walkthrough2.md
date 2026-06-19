# Walkthrough de la Super Application de Réservation ResaGui

Ce document résume l'implémentation complète, l'architecture logicielle, les tests réalisés et la marche à suivre pour démarrer l'écosystème en production ou développement local.

## Architecture Globale

L'écosystème est divisé en deux parties complémentaires :
1. **Backend (NestJS / Node.js)** : Serveur d'API modulaire avec base de données relationnelle PostgreSQL et cache Redis, prenant en charge l'authentification OTP par SMS, la messagerie en temps réel par WebSockets, et la gestion sécurisée des réservations et des paiements (simulations Orange Money & MTN Momo).
2. **Frontend (Ionic 8 / Angular 20)** : Application mobile hybride "offline-first" reposant sur Angular standalone, un design system premium inspiré d'Airbnb, une synchronisation automatique en tâche de fond et des portefeuilles virtuels intégrés.

---

## Fonctionnalités Implémentées

### 1. Backend (NestJS)
- **Authentification OTP** : Système sans mot de passe utilisant un OTP à 4 chiffres envoyé par SMS (simulé dans la passerelle) pour une connexion rapide et sécurisée.
- **Logements & Hébergements** : Création, recherche multicritères par ville et budget maximum, gestion du calendrier de disponibilité.
- **Réservations** : Calcul des frais de service (5%), validation de disponibilité et processus d'annulation sécurisé par rôle.
- **Passerelles de Paiement** :
  - *Orange Money Guinée* : Débit direct via demande d'OTP.
  - *MTN Mobile Money Guinée* : Débit via notification Push USSD.
  - *Portefeuille interne* : Transactions sans frais à partir d'un solde local.
- **Transports & Flotte** :
  - Entités `Transport`, `Vehicule`, `Trajet`.
  - Recherche de trajets, réservation de billets, location de voitures par jour.
- **Restaurants & Tables** :
  - Entités `Restaurant`, `Menu`, `ReservationTable`.
  - Consultation des cartes des menus, réservation de table pour plusieurs couverts.
- **Événements & Billetterie** :
  - Entités `Evenement`, `TicketEvenement`.
  - Achat de billets avec référence QR Code unique, compostage de billets pour les organisateurs.
- **Notifications** :
  - Entité `Notification` pour l'historique in-app.
  - Simulation de push notifications FCM.
- **Promotions & Codes de Réduction** :
  - Entité `Promotion`.
  - Calcul et application de réductions en pourcentage ou montant fixe en GNF.
- **Tableaux de Bord Propriétaires** :
  - Métriques dédiées aux 4 profils d'hôtes (Hôtelier, Loueur de flotte, Restaurateur, Organisateur d'événements).
- **Administration** :
  - Supervision des utilisateurs et des rôles.
  - Validation et modération des annonces (logements, véhicules).
  - Calcul centralisé des commissions de 5%.
- **Messagerie en Temps Réel** : Passerelle WebSocket (Socket.io) avec persistance des discussions en base de données.
- **Seeder automatique** : Peuplement initial de la base de données (Utilisateurs clients, hôtes, admins et logements types à Conakry, Labé et Kamsar).

### 2. Frontend (Ionic / Angular)
- **Design System Premium** : Fichier `variables.scss` personnalisé aux couleurs de la Guinée (Vert, Jaune, Rouge) avec prise en charge du Dark Mode automatique et du Glassmorphism.
- **Gestion Hors-ligne ("Offline-First")** : 
  - `CacheService` : Stockage intelligent en `localStorage` des requêtes GET.
  - `CacheInterceptor` : Intercepteur HTTP transparent servant le cache en cas de coupure de réseau.
  - `SynchronisationService` : Détecte le retour de connexion (`online`) et envoie automatiquement les réservations en suspens.
  - `GeoService` : Récupération des coordonnées GPS, mise en cache de la position et calculs hors-ligne des distances (Haversine) et durées de trajet.
- **Composants Réutilisables** :
  - [SkeletonLoaderComponent](file:///d:/Cours/Ionic/Ionic_Projet/ionic_project/src/app/components/skeleton-loader/skeleton-loader.component.ts) : Chargement visuel fluide de type skeleton.
  - [TicketQrComponent](file:///d:/Cours/Ionic/Ionic_Projet/ionic_project/src/app/components/ticket-qr/ticket-qr.component.ts) : Billet numérique avec code QR SVG généré dynamiquement.
  - [LogementCardComponent](file:///d:/Cours/Ionic/Ionic_Projet/ionic_project/src/app/components/logement-card/logement-card.component.ts) : Carte d'affichage des annonces de type Airbnb.
- **Écrans & Pages** :
  - `/connexion` et `/inscription` : Authentification et choix de rôle utilisateur.
  - `/accueil` : Recherches filtrées, sélecteurs de services (Hébergement, Transport, Sorties, Événements) et bannières d'état hors-ligne.
  - `/details/:id` : Consultation des hébergements et choix de dates.
  - `/paiement/:id` : Choix du moyen de paiement (Orange Money, MTN, Wallet) avec modales de validation OTP Mobile Money.
  - `/reservations` : Liste des réservations passées et actives avec stubs QR scannables.
  - `/portefeuille` : Suivi du solde GNF, rechargements et historique des transactions.
  - `/chat` : Discussions instantanées avec les hôtes en temps réel.
  - `/transport` : Recherche de bus, réservation de trajets et location de véhicules.
  - `/restaurant` : Liste des restaurants, consultation des plats et réservation de tables.
  - `/evenement` : Achat de billets, visualisation des codes QR des e-billets et console de scanneur de ticket pour les hôtes.
  - `/notifications` : Flux des notifications reçues et marquage en statut "lu".
  - `/favoris` : Enregistrement de ses annonces favorites pour un accès rapide hors-ligne.
  - `/dashboards` : Indicateurs clés d'activité et gestion des réservations pour les hôtes.

---

## Lancement Local

### Lancer le Backend (NestJS) :
```bash
cd serveur
npm install
npm run start:
```
Le serveur sera disponible sur : http://localhost:3000

### Lancer le Frontend (Ionic) :
```bash
npm install
npm run start
```
L'application sera accessible sur : http://localhost:8100

---

## Vérification et Tests

Les tests unitaires ont été exécutés avec succès à l'aide de **Jest** sur le Backend :
```bash
cd serveur
npm test
```

### Résultats des Tests :
- **AppController** : Compiles & executes status checks.
- **AuthentificationService** : Valide le cycle de demande OTP, de création de session JWT et de rejet des codes incorrects.
- **ReservationsService** : Valide le contrôle de disponibilité, les exceptions pour hébergements inexistants et le processus d'annulation sécurisé.
- **PaiementsService** : Valide le débit des comptes clients Orange Money, MTN MoMo, recharges de portefeuille et calculs financiers.
- **MessagerieGateway** : Valide la connexion Socket.io, l'adhésion aux salons de discussion et la diffusion des messages instantanés.

> [!NOTE]
> Tous les tests compilent et passent avec succès (17 tests au total).
