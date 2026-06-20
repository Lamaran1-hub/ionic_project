# ResaGuinée

> Plateforme de réservation multi-services pour la Guinée — logements, transport, restaurants et événements.

[![Ionic](https://img.shields.io/badge/Ionic-8-blue)](https://ionicframework.com/)
[![Angular](https://img.shields.io/badge/Angular-20-red)](https://angular.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-11-orange)](https://firebase.google.com/)

---

## Table des matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancement en développement](#lancement-en-développement)
- [Structure du projet](#structure-du-projet)
- [Architecture](#architecture)
- [Routing et navigation](#routing-et-navigation)
- [Authentification multi-portail](#authentification-multi-portail)
- [Modèle de données Firestore](#modèle-de-données-firestore)
- [Services principaux](#services-principaux)
- [Composants partagés](#composants-partagés)
- [Guards de route](#guards-de-route)
- [Firebase et backend](#firebase-et-backend)
- [Serveur Node (images)](#serveur-node-images)
- [Cloud Functions](#cloud-functions)
- [Mode hors-ligne](#mode-hors-ligne)
- [Design system](#design-system)
- [Scripts npm](#scripts-npm)
- [Build et déploiement](#build-et-déploiement)
- [Tests et linting](#tests-et-linting)
- [Conventions de code](#conventions-de-code)
- [Dépannage](#dépannage)
- [Documentation complémentaire](#documentation-complémentaire)

---

## Présentation

**ResaGuinée** est une application hybride (web + mobile via Capacitor) qui connecte :

- **Clients** — recherchent, réservent et paient des services
- **Partenaires** — gèrent leurs annonces et répondent aux réservations
- **Administrateur** — supervise l'ensemble de la plateforme

L'application utilise **Firebase** comme backend principal (Auth, Firestore, Storage, Cloud Functions) avec un petit serveur **Node/Express** pour l'upload d'images catalogue.

**Projet Firebase :** `resaguinee`  
**URL production :** `https://resaguinee.web.app`

---

## Fonctionnalités

### Client

- Catalogue unifié (logements, transport, restaurants, événements)
- Recherche par ville et budget
- Réservation avec dates et message
- Authentification (email, Google, Facebook, GitHub, OTP téléphone)
- Favoris, avis, chat temps réel
- Paiement (portefeuille, Orange Money, MTN — simulé)
- Tickets QR et export PDF

### Partenaire (gestionnaire)

- Dashboard split-pane Ionic
- CRUD annonces avec upload/compression d'images
- Gestion réservations (accepter / refuser / indisponible)
- Chat clients, consultation avis
- Connexion sécurisée avec OTP email

### Administrateur

- Portail `/admin-general`
- Gestion utilisateurs (bannissement, rôles)
- Modération annonces et réservations
- Journal d'activités et statistiques

---

## Stack technique

| Couche | Technologies |
|--------|-------------|
| **Frontend** | Ionic 8, Angular 20 (standalone), TypeScript 5.9, RxJS 7.8 |
| **Mobile** | Capacitor 8 (App, Haptics, Keyboard, StatusBar) |
| **Backend** | Firebase Auth, Firestore, Storage, Cloud Functions |
| **Serveur aux.** | Node.js + Express + Multer (port 3000) |
| **Emails** | Brevo / Resend via Cloud Functions |
| **Tests** | Karma, Jasmine, ESLint |

---

## Prérequis

- **Node.js** ≥ 18 (recommandé : 20 LTS)
- **npm** ≥ 9
- **Firebase CLI** : `npm install -g firebase-tools`
- **Compte Firebase** avec accès au projet `resaguinee`
- *(Optionnel)* **Ionic CLI** : `npm install -g @ionic/cli`

---

## Installation

```bash
# 1. Cloner le dépôt et entrer dans le dossier
cd ionic_project

# 2. Installer les dépendances frontend
npm install

# 3. Installer les dépendances du serveur Node (images)
npm run server:install

# 4. Installer les dépendances Cloud Functions
cd functions && npm install && npm run build && cd ..
```

---

## Lancement en développement

Ouvrir **3 terminaux** :

### Terminal 1 — Application Ionic/Angular

```bash
npm start
# ou : ionic serve
# → http://localhost:8100 (Ionic) ou http://localhost:4200 (ng serve)
```

### Terminal 2 — Serveur Node (upload images)

```bash
npm run server
# → http://localhost:3000
```

### Terminal 3 — Émulateurs Firebase *(optionnel)*

```bash
npm run emulators
# UI émulateurs → http://127.0.0.1:4000
```

> Pour utiliser les émulateurs, activer les flags dans `src/environments/environment.ts` :
> ```typescript
> useAuthEmulator: true,
> useStorageEmulator: true,
> useFunctionsEmulator: true,
> ```

---

## Structure du projet

```
ionic_project/
├── src/                          # Code source Angular/Ionic
│   ├── app/
│   │   ├── app.component.ts      # Composant racine
│   │   ├── app.routes.ts         # Définition des routes
│   │   ├── core/                 # Guards, utils Firebase, collections
│   │   ├── models/               # Interfaces TypeScript (5 fichiers)
│   │   ├── services/             # 33 services injectables
│   │   ├── components/           # 8 composants partagés
│   │   └── pages/                # 21 pages (lazy-loaded)
│   ├── environments/             # Config dev/prod + émulateurs
│   ├── theme/variables.scss      # Tokens design ResaGuinée
│   ├── global.scss               # Styles globaux
│   └── main.ts                   # Bootstrap Firebase + Angular
│
├── functions/                    # Cloud Functions (Node 20)
│   └── src/
│       ├── index.ts              # Trigger emails + exports OTP
│       ├── otp.ts                # OTP email admin/partenaire
│       └── email-sender.ts       # Brevo/Resend
│
├── server/                       # API Node locale (images)
│   └── index.js
│
├── scripts/                      # Scripts PowerShell/Node (SMTP, CORS, émulateurs)
├── firebase.json                 # Config Firebase (hosting, functions, rules)
├── firestore.rules               # Règles sécurité Firestore
├── storage.rules                 # Règles sécurité Storage
├── capacitor.config.ts           # Config Capacitor
└── www/                          # Build production (généré)
```

---

## Architecture

### Pattern général

```
Pages (UI)  →  Services (logique métier)  →  Firebase SDK / HTTP
                    ↓
              BehaviorSubject (état réactif)
                    ↓
         localStorage / IndexedDB (offline)
```

### Principes clés

1. **Standalone Components** — Pas de NgModules ; chaque page est autonome
2. **Lazy Loading** — Routes chargées à la demande via `loadComponent`
3. **Inline Templates** — La plupart des pages ont template/style dans le `.page.ts`
4. **Service Layer** — Toute interaction Firestore passe par des services dédiés (`*-firestore.service.ts`)
5. **Multi-portal Auth** — Trois portails distincts via `sessionStorage` (`resa_portail`)

### Bootstrap (`src/main.ts`)

```typescript
bootstrapApplication(AppComponent, {
  providers: [
    provideIonicAngular(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([cacheInterceptor])),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => creerInstanceAuth()),
    provideFirestore(() => initializeFirestore(...)),  // cache persistant
    provideStorage(() => getStorage()),
    provideFunctions(() => getFunctions()),
  ],
});
```

---

## Routing et navigation

Fichier : `src/app/app.routes.ts`

| Route | Page | Auth requise | Rôle |
|-------|------|:------------:|------|
| `/splash` | Splash | — | — |
| `/accueil` | Accueil | — | — |
| `/details/:id` | Détail logement | — | — |
| `/catalogue/:type/:id` | Détail transport/restaurant/événement | — | — |
| `/transport` | Liste transports | — | — |
| `/restaurant` | Liste restaurants | — | — |
| `/evenement` | Liste événements | — | — |
| `/connexion` | Login client | — | — |
| `/inscription-rapide` | Inscription client | — | — |
| `/connexion-partenaire` | Login partenaire | — | — |
| `/inscription-partenaire` | Inscription partenaire | — | — |
| `/admin-general` | Portail admin | Admin | admin |
| `/profil` | Profil | ✅ | Tous |
| `/favoris` | Favoris | ✅ | Client |
| `/reservations` | Mes réservations | ✅ | Client |
| `/paiement/:id` | Paiement | ✅ | Client |
| `/portefeuille` | Portefeuille | ✅ | Client |
| `/chat` | Messagerie | ✅ | Tous |
| `/notifications` | Notifications | ✅ | Tous |
| `/dashboards` | Dashboard partenaire | ✅ | Gestionnaire |

**Redirection par défaut :** `/` → `/splash` → `/accueil`

---

## Authentification multi-portail

### Trois portails

| Portail | Route connexion | Route après login | Clé sessionStorage |
|---------|-----------------|-------------------|--------------------|
| Client | `/connexion` | `/accueil` | `resa_portail = 'client'` |
| Partenaire | `/connexion-partenaire` | `/dashboards` | `resa_portail = 'partenaire'` |
| Admin | `/admin-general` | Dashboard admin | `resa_portail = 'admin'` |

### Méthodes d'authentification

- **Email / mot de passe** — Firebase Auth standard
- **Google, Facebook, GitHub** — OAuth via popup
- **Téléphone OTP** — Format `+224` (Guinée), reCAPTCHA
- **OTP email** — Admin et partenaires (Cloud Functions)

### Service principal

```typescript
// src/app/services/authentification.service.ts
AuthentificationService
  ├── utilisateur$          // Observable Firebase User
  ├── utilisateurApp$       // Observable profil Firestore
  ├── connexionClient()
  ├── connexionPartenaire()
  ├── connexionAdmin()
  ├── inscription()
  └── deconnexion()
```

### Rôles

```typescript
type RoleUtilisateur =
  | 'client'
  | 'hote'        // gestionnaire logements
  | 'transport'   // gestionnaire véhicules
  | 'restaurant'  // gestionnaire restaurants
  | 'evenement'   // gestionnaire événements
  | 'admin';
```

---

## Modèle de données Firestore

Fichier de référence : `src/app/core/firestore-collections.ts`

### Collections

```typescript
export const COLLECTIONS = {
  utilisateurs: 'utilisateurs',           // Profils (UID = doc ID)
  reservations: 'reservations',           // Réservations
  entreprises: 'entreprises',             // Fiches entreprises
  logements: 'logements',                 // Hôtels, maisons, loisirs
  vehicules: 'vehicules',                 // Location et trajets
  evenements: 'evenements',               // Événements
  restaurants: 'restaurants',             // Restaurants
  favoris: 'favoris',                     // Favoris utilisateur
  chats: 'chats',                         // Conversations
  messages: 'messages',                   // Messages chat
  notifications_app: 'notifications_app', // Notifications in-app
  emails_a_envoyer: 'emails_a_envoyer',   // File emails
  journal_activites: 'journal_activites', // Log admin
  verifications_unicite: 'verifications_unicite', // Index unicité
  meta: '_meta',                          // Métadonnées schéma
};
```

### Statuts de réservation

```
en_attente → acceptee → payee
     │           └── annulee
     ├── refusee
     └── indisponible
```

### Modèles TypeScript

| Fichier | Interfaces |
|---------|-----------|
| `utilisateur.model.ts` | `UtilisateurApp`, `ProfilInscription`, `RoleUtilisateur` |
| `reservation.model.ts` | `ReservationFirestore`, `StatutReservation`, `EmailAEnvoyer` |
| `logement.model.ts` | `Logement` |
| `vehicule.model.ts` | `Vehicule` |
| `evenement.model.ts` | `Evenement` |

---

## Services principaux

### Par domaine

#### 🔐 Auth & identité

| Service | Fichier | Description |
|---------|---------|-------------|
| `AuthentificationService` | `authentification.service.ts` | Auth multi-portail, profils Firestore |
| `OtpEmailService` | `otp-email.service.ts` | Vérification OTP Cloud Functions |
| `UniquenessService` | `uniqueness.service.ts` | Unicité email/téléphone à l'inscription |

#### 📋 Catalogue

| Service | Fichier | Description |
|---------|---------|-------------|
| `LogementFirestoreService` | `logement-firestore.service.ts` | Requêtes publiques logements |
| `PartenaireFirestoreService` | `partenaire-firestore.service.ts` | CRUD annonces partenaire |
| `RestaurantService` | `restaurant.service.ts` | Ops restaurants |
| `CatalogueImageService` | `catalogue-image.service.ts` | Upload images catalogue |
| `ImageCompressionService` | `image-compression.service.ts` | Compression avant upload |
| `StorageService` | `storage.service.ts` | Firebase Storage + queue offline |

#### 📅 Réservations & paiement

| Service | Fichier | Description |
|---------|---------|-------------|
| `ReservationFirestoreService` | `reservation-firestore.service.ts` | CRUD réservations |
| `ReservationService` | `reservation.service.ts` | Façade (Firestore + offline) |
| `PaiementService` | `paiement.service.ts` | Portefeuille, mobile money |
| `ReservationPdfService` | `reservation-pdf.service.ts` | Génération PDF billets |

#### 💬 Communication

| Service | Fichier | Description |
|---------|---------|-------------|
| `ChatFirestoreService` | `chat-firestore.service.ts` | Messagerie temps réel ✅ |
| `NotificationFirestoreService` | `notification-firestore.service.ts` | Notifications in-app |
| `EmailNotificationService` | `email-notification.service.ts` | Enfile emails Firestore |

#### ⚙️ Plateforme

| Service | Fichier | Description |
|---------|---------|-------------|
| `FirestoreInitService` | `firestore-init.service.ts` | Seed données démo |
| `PlateformeService` | `plateforme.service.ts` | Admin : users, activités |
| `SynchronisationService` | `synchronisation.service.ts` | Online/offline sync |
| `ThemeService` | `theme.service.ts` | Mode clair/sombre |
| `FavoriService` | `favori.service.ts` | Favoris Firestore + local |
| `SocialService` | `social.service.ts` | Avis, likes, commentaires |

> **Services legacy (non utilisés activement) :** `LogementService`, `TransportService`, `EvenementService`, `AdminService`, `DashboardService`, `MessagerieService`, `PromotionService`, `GeoService`, `NotificationService` — pointent vers `localhost:3000` sans implémentation serveur.

---

## Composants partagés

| Composant | Selector | Usage |
|-----------|----------|-------|
| `ResaStickyHeaderComponent` | `app-resa-sticky-header` | Header sticky + toggle thème |
| `ReservationModalComponent` | `app-reservation-modal` | Modal création réservation |
| `ImageUploaderComponent` | `app-image-uploader` | Upload/compression images |
| `LogementCardComponent` | `app-logement-card` | Carte annonce logement |
| `HotelCardPremiumComponent` | `app-hotel-card-premium` | Carte premium hôtel |
| `TicketQrComponent` | `app-ticket-qr` | QR code billet |
| `SkeletonLoaderComponent` | `app-skeleton-loader` | Placeholder chargement |
| `SplashScreenComponent` | `app-splash-screen` | Animation splash |

---

## Guards de route

| Guard | Fichier | Logique |
|-------|---------|---------|
| `authGuard` | `core/guards/auth.guard.ts` | Redirige vers `/connexion?returnUrl=...` si non connecté |
| `roleGuard('gestionnaire')` | `core/guards/role.guard.ts` | Vérifie rôle hôte/transport/restaurant/événement |
| `adminGuard` | `core/guards/admin.guard.ts` | Accès portail admin uniquement |

---

## Firebase et backend

### Configuration

Fichiers :
- `src/environments/environment.ts` — Dev
- `src/environments/environment.prod.ts` — Production
- `.firebaserc` — Projet `resaguinee`

### Émulateurs (ports)

| Service | Port | Commande |
|---------|------|----------|
| Auth | 9099 | `npm run emulators` |
| Firestore | 8390 | |
| Storage | 9199 | `npm run emulators:storage` |
| Functions | 5001 | |
| UI | 4000 | |

### Règles de sécurité

- `firestore.rules` — Accès par rôle, propriété, validation téléphone +224
- `storage.rules` — Lecture publique, écriture auth ≤ 5 Mo

### Seed automatique

Au premier lancement, `FirestoreInitService` crée des données démo (Conakry) si les collections sont vides : entreprises, logements, véhicules, événements.

---

## Serveur Node (images)

**Port :** 3000  
**Fichier :** `server/index.js`

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/health` | GET | Health check |
| `/api/images/upload` | POST | Upload cover + galerie (multer) |
| `/api/images/**` | GET | Servir images statiques |
| `/api/images` | DELETE | Supprimer dossier images |

```bash
npm run server          # Démarrer
npm run server:stop     # Libérer le port 3000
npm run server:install  # Installer dépendances
```

---

## Cloud Functions

**Runtime :** Node 20  
**Dossier :** `functions/src/`

| Function | Trigger | Description |
|----------|---------|-------------|
| `envoyerEmailFileAttente` | Firestore onCreate `emails_a_envoyer/{id}` | Envoie email via Brevo/Resend |
| `envoyerOtpParEmail` | HTTP callable | Génère et envoie OTP email |
| `verifierOtpParEmail` | HTTP callable | Vérifie code OTP |
| `envoyerOtpConnexion` | HTTP callable | OTP connexion partenaire/admin |
| `verifierOtpConnexion` | HTTP callable | Vérifie OTP connexion |

```bash
cd functions
npm install
npm run build
firebase deploy --only functions
```

### Configuration email

```bash
npm run smtp:configure       # Config SMTP générique
npm run email:configure-brevo # Config Brevo
```

---

## Mode hors-ligne

| Mécanisme | Stockage | Service |
|-----------|----------|---------|
| Cache Firestore | IndexedDB (SDK) | Automatique |
| Réservations en attente | localStorage | `ReservationService` |
| Uploads images | IndexedDB `resa_upload_queue` | `StorageService` |
| Cache HTTP GET | Intercepteur | `cache.interceptor.ts` |
| Détection online/offline | Event listeners | `SynchronisationService` |

La bannière offline s'affiche sur `/accueil` quand `navigator.onLine === false`.

---

## Design system

### Couleurs

| Token | Valeur | Variable SCSS |
|-------|--------|---------------|
| Primaire (coral) | `#ff4a22` | `--ion-color-primary` |
| Fond clair | `#fafafa` | — |
| Fond sombre | `#121212` | `.ion-palette-dark` |

### Fichiers

- `src/theme/variables.scss` — Variables Ionic
- `src/global.scss` — Styles globaux, `.resa-glass-card`, police Outfit

### Thème

```typescript
// src/app/services/theme.service.ts
ThemeService.toggleTheme()  // Bascule clair/sombre
// Stocké dans localStorage, classe .ion-palette-dark sur <html>
```

---

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm start` | Lance `ng serve` |
| `npm run build` | Build production → `www/` |
| `npm run watch` | Build dev en watch |
| `npm test` | Tests Karma/Jasmine |
| `npm run lint` | ESLint Angular |
| `npm run server` | Serveur Node images (port 3000) |
| `npm run server:install` | Installe deps serveur |
| `npm run server:stop` | Libère port 3000 |
| `npm run emulators` | Émulateurs Firebase |
| `npm run emulators:storage` | Émulateur Storage seul |
| `npm run emulators:stop` | Libère ports émulateurs |
| `npm run storage:cors` | Configure CORS Storage |
| `npm run smtp:configure` | Configure SMTP |
| `npm run email:configure-brevo` | Configure Brevo |

---

## Build et déploiement

### Build production

```bash
npm run build
# Output : www/
```

### Déploiement Firebase

```bash
# Connexion (première fois)
firebase login

# Déploiement complet
firebase deploy

# Déploiement partiel
firebase deploy --only hosting
firebase deploy --only firestore:rules,storage
firebase deploy --only functions
```

### Capacitor (mobile natif)

```bash
# Après build
npx cap add android
npx cap add ios
npx cap sync
npx cap open android
npx cap open ios
```

> **Note :** L'app ID Capacitor est encore `io.ionic.starter` — à renommer en `com.resaguinee.app` avant publication store.

---

## Tests et linting

```bash
# Tests unitaires
npm test

# Linting
npm run lint
```

**Couverture actuelle :** minimale (smoke tests `AppComponent` et `HomePage` legacy).

**Recommandé pour les contributions :**
- Tester les services modifiés
- Vérifier le lint avant commit
- Tester manuellement les parcours auth et réservation

---

## Conventions de code

### Nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Pages | `*.page.ts` | `accueil.page.ts` |
| Services | `*.service.ts` | `reservation-firestore.service.ts` |
| Composants | `*.component.ts` | `logement-card.component.ts` |
| Guards | `*.guard.ts` | `auth.guard.ts` |
| Modèles | `*.model.ts` | `utilisateur.model.ts` |
| Collections | Français snake_case | `emails_a_envoyer` |

### Patterns

- **Standalone** : `standalone: true` sur tous les composants
- **Injection** : `inject()` plutôt que constructor injection
- **Firestore** : `runInInjectionContext()` pour les appels AngularFire
- **Observables** : suffixe `$` pour les streams publics
- **Inline templates** : préférés pour les pages (fichiers `.page.ts` volumineux)

### Ajouter une nouvelle page

```bash
# 1. Créer le dossier
src/app/pages/ma-page/ma-page.page.ts

# 2. Ajouter la route dans app.routes.ts
{
  path: 'ma-page',
  loadComponent: () => import('./pages/ma-page/ma-page.page').then(m => m.MaPage),
  canActivate: [authGuard]  // si nécessaire
}

# 3. Créer un service si logique métier
src/app/services/ma-logique.service.ts
```

---

## Dépannage

### L'app ne se connecte pas à Firebase

1. Vérifier `environment.ts` → `firebaseConfig`
2. Si émulateurs actifs, lancer `npm run emulators`
3. Vérifier les flags `useAuthEmulator`, etc.

### Images catalogue ne s'affichent pas

1. Lancer le serveur Node : `npm run server`
2. Vérifier `apiBaseUrl: 'http://localhost:3000'`
3. Pour Storage cloud : `npm run storage:cors`

### OTP email non reçu

1. Configurer Brevo : `npm run email:configure-brevo`
2. Déployer functions : `firebase deploy --only functions`
3. Vérifier collection `emails_a_envoyer` dans Firestore

### Port déjà utilisé

```bash
npm run server:stop      # Port 3000
npm run emulators:stop   # Ports émulateurs
```

### Erreur Firestore "permission denied"

1. Vérifier que l'utilisateur est connecté
2. Consulter `firestore.rules` pour le rôle requis
3. Déployer règles : `firebase deploy --only firestore:rules`

---

## Documentation complémentaire

| Document | Contenu |
|----------|---------|
| [RAPPORT_ResaGuinee.docx](./RAPPORT_ResaGuinee.docx) | **Rapport Word** — version professionnelle (page de garde, sommaire, annexes) |
| [RAPPORT.md](./RAPPORT.md) | Rapport complet du projet (architecture, parcours, sécurité, perspectives) |

### Régénérer le rapport Word

```bash
npm run rapport:docx
# ou : python scripts/generate_rapport_docx.py
```

> Après ouverture dans Word : clic droit sur le sommaire → **Mettre à jour les champs** pour actualiser la table des matières et la pagination.
| [firestore.rules](./firestore.rules) | Règles de sécurité Firestore |
| [storage.rules](./storage.rules) | Règles de sécurité Storage |
| [firebase.json](./firebase.json) | Configuration Firebase |

---

## Licence

Projet privé — ResaGuinée © 2025-2026
