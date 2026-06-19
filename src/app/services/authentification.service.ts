import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import { BehaviorSubject, Observable, defer, from, switchMap, tap } from 'rxjs';
import {
  Auth,
  authState,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut,
  User,
} from '@angular/fire/auth';
import {
  estAuthEmulateurActif,
  preparerRecaptcha,
  AUTH_EMULATEUR_TEST,
} from '../core/firebase-phone-auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import { UtilisateurApp, ProfilInscription, RoleUtilisateur } from '../models/utilisateur.model';

const CLE_ONBOARDING_VU = 'resa_onboarding_vu';
const CLE_SESSION_ACTIVE = 'resa_session_active';

@Injectable({
  providedIn: 'root',
})
export class AuthentificationService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  private utilisateurFirebaseSujet = new BehaviorSubject<User | null>(null);
  public utilisateur$ = authState(this.auth);

  private utilisateurAppSujet = new BehaviorSubject<UtilisateurApp | null>(null);
  public utilisateurApp$ = this.utilisateurAppSujet.asObservable();

  private confirmationResult: ConfirmationResult | null = null;
  private recaptchaVerifier: RecaptchaVerifier | null = null;
  private profilEnAttente: ProfilInscription | null = null;
  private telephoneEnCours = '';

  constructor() {
    this.utilisateur$.subscribe((user) => {
      runInInjectionContext(this.injector, () => {
        void this.traiterChangementUtilisateur(user);
      });
    });
  }

  private async traiterChangementUtilisateur(user: User | null): Promise<void> {
    this.utilisateurFirebaseSujet.next(user);
    if (user) {
      const token = await user.getIdToken();
      localStorage.setItem('resa_token', token);
      await this.chargerProfilFirestore(user.uid);
      this.marquerSessionActive();
    } else {
      localStorage.removeItem('resa_token');
      this.utilisateurAppSujet.next(null);
    }
  }

  doitAfficherOnboarding(): boolean {
    const premiereVisite = !localStorage.getItem(CLE_ONBOARDING_VU);
    const sessionExpiree =
      localStorage.getItem(CLE_SESSION_ACTIVE) === 'true' && !this.estConnecte();
    return premiereVisite || sessionExpiree;
  }

  marquerOnboardingTermine(): void {
    localStorage.setItem(CLE_ONBOARDING_VU, 'true');
    if (!this.estConnecte()) {
      localStorage.setItem(CLE_SESSION_ACTIVE, 'false');
    }
  }

  marquerSessionActive(): void {
    localStorage.setItem(CLE_SESSION_ACTIVE, 'true');
  }

  obtenirUtilisateurCourant(): User | null {
    return this.utilisateurFirebaseSujet.value;
  }

  obtenirUtilisateurApp(): UtilisateurApp | null {
    return this.utilisateurAppSujet.value;
  }

  estConnecte(): boolean {
    return !!this.auth.currentUser;
  }

  normaliserTelephone(telephone: string): string {
    let num = telephone.replace(/\s+/g, '');
    if (!num.startsWith('+')) {
      num = num.startsWith('224') ? `+${num}` : `+224${num}`;
    }
    return num;
  }

  definirProfilEnAttente(profil: ProfilInscription): void {
    this.profilEnAttente = profil;
  }

  private obtenirVerificateurRecaptcha(elementId: string): RecaptchaVerifier {
    this.recaptchaVerifier = preparerRecaptcha(this.auth, elementId, this.recaptchaVerifier);
    return this.recaptchaVerifier;
  }

  /** Message d'aide si l'émulateur Auth est actif */
  obtenirAideOtpEmulateur(): string | null {
    if (!estAuthEmulateurActif()) {
      return null;
    }
    return `Mode émulateur : ajoutez ${AUTH_EMULATEUR_TEST.telephone} (code ${AUTH_EMULATEUR_TEST.code}) dans http://127.0.0.1:4000/auth`;
  }

  static normaliserCodeOtp(code: unknown): string {
    return String(code ?? '').trim();
  }

  demanderOtpFirebase(telephone: string): Observable<{ message: string }> {
    return defer(() =>
      runInInjectionContext(this.injector, async () => {
        this.telephoneEnCours = this.normaliserTelephone(telephone);
        const verifier = this.obtenirVerificateurRecaptcha('recaptcha-container');
        const result = await signInWithPhoneNumber(this.auth, this.telephoneEnCours, verifier);
        this.confirmationResult = result;
        const aide = this.obtenirAideOtpEmulateur();
        return {
          message: aide
            ? `Code envoyé (émulateur). ${aide}`
            : 'Code OTP envoyé par SMS.',
        };
      })
    );
  }

  validerOtpFirebase(codeOtp: string | number): Observable<UtilisateurApp> {
    const code = AuthentificationService.normaliserCodeOtp(codeOtp);
    if (!this.confirmationResult) {
      return from(Promise.reject(new Error('Aucune demande OTP en cours.')));
    }
    if (!code) {
      return from(Promise.reject(new Error('Code OTP invalide.')));
    }

    return defer(() =>
      runInInjectionContext(this.injector, () =>
        this.confirmationResult!.confirm(code)
      )
    ).pipe(
      switchMap((result) => {
        const uid = result.user.uid;
        const profil = this.profilEnAttente ?? {
          nomComplet: result.user.displayName || 'Utilisateur ResaGuinée',
          email: result.user.email || '',
          telephone: result.user.phoneNumber || this.telephoneEnCours,
          role: 'client' as RoleUtilisateur,
        };
        return from(
          runInInjectionContext(this.injector, () =>
            this.enregistrerOuMettreAJourProfil(uid, profil)
          )
        );
      }),
      tap((utilisateur) => {
        this.profilEnAttente = null;
        this.confirmationResult = null;
        this.persistProfilLocal(utilisateur);
        this.marquerSessionActive();
      })
    );
  }

  sinscrireAvecOtp(profil: ProfilInscription): Observable<{ message: string }> {
    this.definirProfilEnAttente({
      ...profil,
      email: profil.email.trim().toLowerCase(),
      telephone: this.normaliserTelephone(profil.telephone),
    });
    return this.demanderOtpFirebase(profil.telephone);
  }

  finaliserInscriptionOtp(codeOtp: string | number): Observable<UtilisateurApp> {
    return this.validerOtpFirebase(codeOtp);
  }

  private async enregistrerOuMettreAJourProfil(
    uid: string,
    profil: ProfilInscription
  ): Promise<UtilisateurApp> {
    const ref = doc(this.firestore, 'utilisateurs', uid);
    const existant = await getDoc(ref);
    const donneesExistantes = existant.exists() ? existant.data() : null;

    const utilisateur: UtilisateurApp = donneesExistantes
      ? {
          uid,
          nomComplet: (donneesExistantes['nomComplet'] as string) || profil.nomComplet.trim(),
          email: (donneesExistantes['email'] as string) || profil.email.trim().toLowerCase(),
          telephone: (donneesExistantes['telephone'] as string) || profil.telephone,
          role: (donneesExistantes['role'] as RoleUtilisateur) || profil.role,
          nomEntreprise: (donneesExistantes['nomEntreprise'] as string) || profil.nomEntreprise,
          photoProfil: (donneesExistantes['photoProfil'] as string) || undefined,
          soldePortefeuille: Number(donneesExistantes['soldePortefeuille'] ?? 0),
        }
      : {
          uid,
          nomComplet: profil.nomComplet.trim(),
          email: profil.email.trim().toLowerCase(),
          telephone: profil.telephone,
          role: profil.role,
          nomEntreprise: profil.nomEntreprise?.trim(),
          photoProfil: undefined,
          soldePortefeuille: 0,
        };

    if (!utilisateur.email && profil.email) {
      utilisateur.email = profil.email.trim().toLowerCase();
    }

    await setDoc(
      ref,
      {
        nomComplet: utilisateur.nomComplet,
        email: utilisateur.email,
        telephone: utilisateur.telephone,
        role: utilisateur.role,
        nomEntreprise: utilisateur.nomEntreprise ?? null,
        photoProfil: utilisateur.photoProfil ?? null,
        soldePortefeuille: utilisateur.soldePortefeuille,
        dateMiseAJour: serverTimestamp(),
        ...(existant.exists() ? {} : { dateCreation: serverTimestamp() }),
      },
      { merge: true }
    );

    return utilisateur;
  }

  private async chargerProfilFirestore(uid: string): Promise<void> {
    const snap = await getDoc(doc(this.firestore, 'utilisateurs', uid));
    if (!snap.exists()) {
      return;
    }
    const d = snap.data();
    const utilisateur: UtilisateurApp = {
      uid,
      nomComplet: d['nomComplet'] ?? '',
      email: d['email'] ?? '',
      telephone: d['telephone'] ?? '',
      role: (d['role'] as RoleUtilisateur) ?? 'client',
      nomEntreprise: d['nomEntreprise'] ?? undefined,
      photoProfil: d['photoProfil'] ?? undefined,
      soldePortefeuille: Number(d['soldePortefeuille'] ?? 0),
    };
    this.persistProfilLocal(utilisateur);
  }

  private persistProfilLocal(utilisateur: UtilisateurApp): void {
    localStorage.setItem('resa_utilisateur', JSON.stringify(utilisateur));
    this.utilisateurAppSujet.next(utilisateur);
  }

  mettreAJourEmailLocal(email: string): void {
    const u = this.utilisateurAppSujet.value;
    if (!u) {
      return;
    }
    const miseAJour = { ...u, email: email.trim().toLowerCase() };
    this.persistProfilLocal(miseAJour);
    if (u.uid) {
      runInInjectionContext(this.injector, () => {
        setDoc(
          doc(this.firestore, 'utilisateurs', u.uid),
          { email: miseAJour.email, dateMiseAJour: serverTimestamp() },
          { merge: true }
        );
      });
    }
  }

  obtenirRouteApresConnexion(role?: RoleUtilisateur): string {
    switch (role) {
      case 'hote':
      case 'transport':
      case 'restaurant':
      case 'evenement':
        return '/dashboards';
      default:
        return '/accueil';
    }
  }

  deconnexion(): Observable<void> {
    return defer(() =>
      runInInjectionContext(this.injector, () =>
        signOut(this.auth).then(() => {
          localStorage.removeItem('resa_token');
          localStorage.removeItem('resa_utilisateur');
          localStorage.setItem(CLE_SESSION_ACTIVE, 'false');
          this.utilisateurAppSujet.next(null);
          this.profilEnAttente = null;
          this.confirmationResult = null;
        })
      )
    );
  }

  obtenirJeton(): string | null {
    return localStorage.getItem('resa_token');
  }

  mettreAJourSoldeLocal(nouveauSolde: number): void {
    const u = this.utilisateurAppSujet.value;
    if (u) {
      const miseAJour = { ...u, soldePortefeuille: nouveauSolde };
      this.persistProfilLocal(miseAJour);
    }
  }
}
