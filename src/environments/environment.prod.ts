import { Auth } from '@angular/fire/auth';
import { Firestore } from '@angular/fire/firestore';

export const environment = {
  production: true,
  useAuthEmulator: false,
  authEmulatorUrl: '',
  firestoreEmulatorHost: '',
  firestoreEmulatorPort: 0,
  firebaseConfig: {
    apiKey: 'AIzaSyCIkpHS78f9PbVnHWiWRAOqr3gKAa09ixE',
    authDomain: 'resaguinee.firebaseapp.com',
    projectId: 'resaguinee',
    storageBucket: 'resaguinee.firebasestorage.app',
    messagingSenderId: '181276656465',
    appId: '1:181276656465:web:78e3e3e11b579de64a4970',
  },
};

export function configurerAuthEmulateur(_auth: Auth): void {}

export function configurerFirestoreEmulateur(_firestore: Firestore): void {}
