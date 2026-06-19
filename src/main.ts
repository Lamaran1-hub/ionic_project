import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { cacheInterceptor } from './app/services/cache.interceptor';
import { environment, configurerFirestoreEmulateur } from './environments/environment';
import { provideFirebaseApp, initializeApp, getApp } from '@angular/fire/app';
import { provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import {
  initializeAuth,
  browserLocalPersistence,
  getAuth,
  Auth,
} from 'firebase/auth';
import { configurerAuthPourEmulateur } from './app/core/firebase-phone-auth';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';

function creerInstanceAuth(): Auth {
  const app = getApp();
  let auth: Auth;
  try {
    auth = initializeAuth(app, { persistence: browserLocalPersistence });
  } catch {
    auth = getAuth(app);
  }
  configurerAuthPourEmulateur(auth);
  return auth;
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(withInterceptors([cacheInterceptor])),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => creerInstanceAuth()),
    provideFirestore(() => {
      const firestore = getFirestore();
      configurerFirestoreEmulateur(firestore);
      return firestore;
    }),
  ],
});
