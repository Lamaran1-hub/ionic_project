import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { star, locationOutline } from 'ionicons/icons';

@Component({
  selector: 'app-logement-card',
  standalone: true,
  imports: [CommonModule, IonIcon],
  template: `
    <div class="logement-card fade-in" (click)="onClick.emit(logement)" *ngIf="logement">
      <!-- Media Section -->
      <div class="media-container">
        <!-- Rendu de l'image (si disponible) ou dégradé premium dynamique selon le type -->
        <div 
          *ngIf="!logement.photos || logement.photos.length === 0" 
          [class]="'placeholder-gradient type-' + logement.typeLogement"
        >
          <span class="placeholder-emoji">{{ obtenirEmoji(logement.typeLogement) }}</span>
        </div>
        <img 
          *ngIf="logement.photos && logement.photos.length > 0" 
          [src]="logement.photos[0]" 
          [alt]="logement.nom" 
          class="logement-img"
        />
        
        <!-- Badge de Rating style Airbnb -->
        <div class="rating-badge">
          <ion-icon name="star"></ion-icon>
          <span>4.8</span>
        </div>
      </div>

      <!-- Content Section -->
      <div class="card-content">
        <div class="location-row">
          <span class="type-badge">{{ logement.typeLogement | titlecase }}</span>
          <div class="location">
            <ion-icon name="location-outline"></ion-icon>
            <span>{{ logement.ville }}</span>
          </div>
        </div>

        <h3 class="title">{{ logement.nom }}</h3>
        <p class="description">{{ logement.description | slice:0:80 }}{{ logement.description.length > 80 ? '...' : '' }}</p>

        <div class="price-row">
          <div class="price-box">
            <span class="amount">{{ logement.prixParNuit | number }} GNF</span>
            <span class="period"> / nuit</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .logement-card {
      background: var(--ion-card-background, #ffffff);
      border-radius: 20px;
      overflow: hidden;
      margin: 16px 0;
      border: 1px solid var(--resa-glass-border, rgba(0,0,0,0.05));
      box-shadow: 0 4px 16px rgba(0,0,0,0.03);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
      cursor: pointer;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 10px 24px rgba(0,0,0,0.08);
      }
      &:active {
        transform: scale(0.98);
      }
    }

    .media-container {
      position: relative;
      height: 200px;
      width: 100%;
      overflow: hidden;
    }

    .logement-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }

    .logement-card:hover .logement-img {
      transform: scale(1.05);
    }

    // Dégradé de remplacement si pas de photos
    .placeholder-gradient {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &.type-appartement {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
      }
      &.type-villa {
        background: linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%);
      }
      &.type-hotel {
        background: linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%);
      }
      &.type-chambre {
        background: linear-gradient(120deg, #fdfbf7 0%, #eff2f5 100%);
      }
    }

    .placeholder-emoji {
      font-size: 3.5rem;
    }

    .rating-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(8px);
      padding: 4px 8px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8rem;
      font-weight: 700;
      color: #1e1e24;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);

      ion-icon {
        color: #ffc409;
        font-size: 0.95rem;
      }
    }

    // Section Infos
    .card-content {
      padding: 16px;
    }

    .location-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .type-badge {
      background: var(--ion-color-light);
      color: var(--ion-color-dark-tint);
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 6px;
    }

    .location {
      display: flex;
      align-items: center;
      gap: 2px;
      font-size: 0.8rem;
      color: var(--ion-color-medium);
      font-weight: 500;

      ion-icon {
        font-size: 0.9rem;
      }
    }

    .title {
      font-size: 1.15rem;
      font-weight: 700;
      margin: 0 0 6px 0;
      color: var(--ion-text-color);
      line-height: 1.3;
    }

    .description {
      font-size: 0.85rem;
      color: var(--ion-color-medium);
      margin: 0 0 16px 0;
      line-height: 1.4;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--ion-color-light-shade);
      padding-top: 12px;
    }

    .price-box {
      .amount {
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--ion-color-primary);
      }
      .period {
        font-size: 0.8rem;
        color: var(--ion-color-medium);
        font-weight: 500;
      }
    }
  `]
})
export class LogementCardComponent {
  @Input() logement: any;
  @Output() onClick = new EventEmitter<any>();

  constructor() {
    addIcons({ star, locationOutline });
  }

  obtenirEmoji(type: string): string {
    switch (type) {
      case 'villa': return '🏡';
      case 'appartement': return '🏢';
      case 'hotel': return '🏨';
      default: return '🛌';
    }
  }
}
