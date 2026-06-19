import { Auth, connectAuthEmulator } from '@angular/fire/auth';
import { Firestore, connectFirestoreEmulator } from '@angular/fire/firestore';
import { EMULATOR_PORTS } from './emulator-ports';

export const environment = {
  production: false,
  /** Mettre à false pour utiliser Firebase Auth en ligne (sans émulateur local) */
  useAuthEmulator: true,
  authEmulatorUrl: `http://127.0.0.1:${EMULATOR_PORTS.auth}`,
  firestoreEmulatorHost: '127.0.0.1',
  firestoreEmulatorPort: EMULATOR_PORTS.firestore,
  firebaseConfig: {
    apiKey: 'AIzaSyCIkpHS78f9PbVnHWiWRAOqr3gKAa09ixE',
    authDomain: 'resaguinee.firebaseapp.com',
    projectId: 'resaguinee',
    storageBucket: 'resaguinee.firebasestorage.app',
    messagingSenderId: '181276656465',
    appId: '1:181276656465:web:78e3e3e11b579de64a4970',
  },
};

/** Émulateurs Firebase — dev uniquement (lancer : firebase emulators:start) */
export function configurerAuthEmulateur(auth: Auth): void {
  if (!environment.production && environment.useAuthEmulator) {
    try {
      connectAuthEmulator(auth, environment.authEmulatorUrl, { disableWarnings: true });
    } catch {
      /* déjà connecté (rechargement à chaud) */
    }
    auth.settings.appVerificationDisabledForTesting = true;
  }
}

export function configurerFirestoreEmulateur(firestore: Firestore): void {
  if (!environment.production && environment.useAuthEmulator) {
    try {
      connectFirestoreEmulator(
        firestore,
        environment.firestoreEmulatorHost,
        environment.firestoreEmulatorPort
      );
    } catch {
      /* déjà connecté (rechargement à chaud) */
    }
  }
}
