import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="'skeleton-container ' + layout">
      <!-- Layout de Carte (Style Logement / Restaurant) -->
      <div *ngIf="layout === 'carte'" class="skeleton-card">
        <div class="skeleton-media skeleton-pulse"></div>
        <div class="skeleton-text skeleton-title skeleton-pulse"></div>
        <div class="skeleton-text skeleton-subtitle skeleton-pulse"></div>
        <div class="skeleton-text skeleton-price skeleton-pulse"></div>
      </div>

      <!-- Layout de Liste (Style Discussion / Notifications) -->
      <div *ngIf="layout === 'liste'" class="skeleton-list-item">
        <div class="skeleton-avatar skeleton-pulse"></div>
        <div class="skeleton-content">
          <div class="skeleton-text skeleton-title skeleton-pulse"></div>
          <div class="skeleton-text skeleton-message skeleton-pulse"></div>
        </div>
      </div>

      <!-- Layout Simple (Texte brut/Paragraphes) -->
      <div *ngIf="layout === 'texte'" class="skeleton-text-block">
        <div class="skeleton-text skeleton-title skeleton-pulse" style="width: 60%"></div>
        <div class="skeleton-text skeleton-pulse" style="width: 90%"></div>
        <div class="skeleton-text skeleton-pulse" style="width: 80%"></div>
        <div class="skeleton-text skeleton-pulse" style="width: 40%"></div>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-container {
      width: 100%;
      box-sizing: border-box;
    }
    
    .skeleton-pulse {
      background: linear-gradient(-90deg, var(--ion-color-light) 0%, var(--ion-color-light-shade) 50%, var(--ion-color-light) 100%);
      background-size: 400% 400%;
      animation: pulse-animation 1.5s ease-in-out infinite;
    }

    @keyframes pulse-animation {
      0% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }

    // Styles de Carte
    .skeleton-card {
      background: var(--ion-background-color);
      border-radius: 16px;
      overflow: hidden;
      padding: 12px;
      border: 1px solid var(--resa-glass-border, rgba(0,0,0,0.05));
    }
    .skeleton-media {
      height: 180px;
      width: 100%;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .skeleton-text {
      height: 16px;
      border-radius: 4px;
      margin-bottom: 8px;
    }
    .skeleton-title {
      height: 20px;
      width: 70%;
    }
    .skeleton-subtitle {
      width: 45%;
    }
    .skeleton-price {
      width: 30%;
      margin-top: 12px;
      height: 18px;
    }

    // Styles de Liste
    .skeleton-list-item {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--ion-color-light-shade);
    }
    .skeleton-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      margin-right: 16px;
      flex-shrink: 0;
    }
    .skeleton-content {
      flex: 1;
    }
    .skeleton-message {
      width: 85%;
      height: 12px;
      margin-top: 6px;
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() layout: 'carte' | 'liste' | 'texte' = 'carte';
}
