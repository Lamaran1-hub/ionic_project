# Walkthrough de la Super Application de Réservation (Marché Africain / Guinée)

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
- **Messagerie en Temps Réel** : Passerelle WebSocket (Socket.io) avec persistance des discussions en base de données.
- **Seeder automatique** : Peuplement initial de la base de données (Utilisateurs clients, hôtes, admins et logements types à Conakry, Labé et Kamsar).

### 2. Frontend (Ionic / Angular)
- **Design System Premium** : Fichier `variables.scss` personnalisé aux couleurs de la Guinée (Vert, Jaune, Rouge) avec prise en charge du Dark Mode automatique et du Glassmorphism.
- **Gestion Hors-ligne ("Offline-First")** : 
  - La file d'attente locale `localStorage` capture les actions utilisateur si le réseau coupe.
  - Le `SynchronisationService` détecte le retour de connexion (`online`) et envoie automatiquement les requêtes en suspens.
- **Composants Réutilisables** :
  - [SkeletonLoaderComponent](file:///d:/Cours/Ionic/Ionic_Projet/ionic_project/src/app/components/skeleton-loader/skeleton-loader.component.ts) : Chargement visuel fluide de type skeleton.
  - [TicketQrComponent](file:///d:/Cours/Ionic/Ionic_Projet/ionic_project/src/app/components/ticket-qr/ticket-qr.component.ts) : Billet numérique avec code QR SVG généré dynamiquement.
  - [LogementCardComponent](file:///d:/Cours/Ionic/Ionic_Projet/ionic_project/src/app/components/logement-card/logement-card.component.ts) : Carte d'affichage des annonces de type Airbnb.
- **Écrans & Pages** :
  - `/connexion` et `/inscription` : Authentification et choix de rôle utilisateur.
  - `/accueil` : Recherches filtrées, sélecteurs de services et bannières d'état hors-ligne.
  - `/details/:id` : Consultation des hébergements et choix de dates.
  - `/paiement/:id` : Choix du moyen de paiement (Orange Money, MTN, Wallet) avec modales de validation OTP Mobile Money.
  - `/reservations` : Liste des réservations passées et actives avec stubs QR scannables.
  - `/portefeuille` : Suivi du solde GNF, rechargements et historique des transactions.
  - `/chat` : Discussions instantanées avec les hôtes en temps réel.

---

## Conteneurisation (Docker)

Le projet intègre un fichier `docker-compose.yml` à la racine qui permet d'orchestrer tout le système.

### Fichiers de Configuration
- **Root Docker-compose** : [docker-compose.yml](file:///d:/Cours/Ionic/Ionic_Projet/ionic_project/docker-compose.yml)
- **Frontend Dockerfile** : [Dockerfile](file:///d:/Cours/Ionic/Ionic_Projet/ionic_project/Dockerfile) (Compile les fichiers web et les sert via Nginx)
- **Backend Dockerfile** : [serveur/Dockerfile](file:///d:/Cours/Ionic/Ionic_Projet/ionic_project/serveur/Dockerfile) (Compile NestJS en dist et le démarre avec Node.js)

### Lancer l'application avec Docker
Pour lancer l'ensemble de l'écosystème, exécutez la commande suivante à la racine :
```bash
docker-compose up --build
```
Les services seront disponibles aux adresses suivantes :
- **Application Frontend (Nginx)** : http://localhost:8080
- **Serveur d'API (NestJS)** : http://localhost:3000
- **Documentation Interactive (Swagger)** : http://localhost:3000/api/docs

---

## Vérification et Tests

Les tests unitaires ont été exécutés avec succès à l'aide de **Jest** :
```bash
cd serveur
npm test
```

### Résultats des Tests :
- **AppController** : Compiles & executes status checks.
- **AuthentificationService** : Valide le cycle de demande OTP, de création de session JWT et de rejet des codes incorrects.
- **ReservationsService** : Valide le contrôle de disponibilité, les exceptions pour hébergements inexistants et le processus d'annulation sécurisé.

> [!NOTE]
> Tous les tests compilent et passent avec succès (9 tests réussis).
