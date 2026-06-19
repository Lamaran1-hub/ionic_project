import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CacheService } from './cache.service';
import { of, tap } from 'rxjs';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') {
    return next(req);
  }

  const cache = inject(CacheService);
  const cacheKey = req.urlWithParams;

  // Si l'utilisateur est hors-ligne
  if (!navigator.onLine) {
    const cachedResponse = cache.recuperer(cacheKey);
    if (cachedResponse) {
      console.log(`[OFFLINE-CACHE] Réponse servie depuis le cache local pour : ${req.url}`);
      return of(new HttpResponse({ body: cachedResponse, status: 200 }));
    }
  }

  return next(req).pipe(
    tap((event) => {
      if (event instanceof HttpResponse) {
        cache.stocker(cacheKey, event.body);
      }
    })
  );
};
