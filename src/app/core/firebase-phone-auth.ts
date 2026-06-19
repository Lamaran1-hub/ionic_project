import { Auth, connectAuthEmulator, RecaptchaVerifier } from '@angular/fire/auth';
import { environment } from '../../environments/environment';

/** Numéro/code à configurer dans l'UI émulateur : http://127.0.0.1:4000/auth */
export const AUTH_EMULATEUR_TEST = {
  telephone: '+224621000001',
  code: '123456',
} as const;

export function estAuthEmulateurActif(): boolean {
  return !environment.production && environment.useAuthEmulator;
}

/**
 * À appeler une seule fois au démarrage (main.ts).
 * L'émulateur doit être connecté AVANT toute init reCAPTCHA.
 */
export function configurerAuthPourEmulateur(auth: Auth): void {
  if (!estAuthEmulateurActif()) {
    return;
  }
  try {
    connectAuthEmulator(auth, environment.authEmulatorUrl, { disableWarnings: true });
  } catch {
    /* rechargement à chaud */
  }
  auth.settings.appVerificationDisabledForTesting = true;
}

/**
 * Obligatoire avant signInWithPhoneNumber — le SDK exige un vrai RecaptchaVerifier
 * (un objet mock provoque auth/argument-error).
 */
export function preparerRecaptcha(
  auth: Auth,
  elementId: string,
  existant: RecaptchaVerifier | null
): RecaptchaVerifier {
  if (estAuthEmulateurActif()) {
    auth.settings.appVerificationDisabledForTesting = true;
  }

  if (existant) {
    try {
      existant.clear();
    } catch {
      /* ignore */
    }
  }

  return new RecaptchaVerifier(auth, elementId, { size: 'invisible' });
}
