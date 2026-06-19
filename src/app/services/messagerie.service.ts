import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root',
})
export class MessagerieService {
  private apiUri = 'http://localhost:3000/api/messagerie';
  private socketUrl = 'http://localhost:3000/chat';
  private socket!: Socket;
  private messageSujet = new Subject<any>();

  constructor(private http: HttpClient) {}

  private obtenirEntetes() {
    const token = localStorage.getItem('resa_token');
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  initialiserSocket() {
    if (this.socket && this.socket.connected) {
      return;
    }

    this.socket = io(this.socketUrl, {
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('[WEBSOCKET] Connecté au serveur de chat.');
    });

    this.socket.on('nouveau_message', (message: any) => {
      this.messageSujet.next(message);
    });

    this.socket.on('disconnect', () => {
      console.log('[WEBSOCKET] Déconnecté du serveur de chat.');
    });
  }

  deconnecterSocket() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  rejoindreRoom(room: string) {
    this.initialiserSocket();
    this.socket.emit('rejoindre_room', { room });
  }

  quitterRoom(room: string) {
    if (this.socket) {
      this.socket.emit('quitter_room', { room });
    }
  }

  envoyerMessage(expediteurId: string, destinataireId: string, contenu: string, room: string, imageUrl?: string) {
    this.initialiserSocket();
    this.socket.emit('envoyer_message', {
      expediteurId,
      destinataireId,
      contenu,
      room,
      imageUrl,
    });
  }

  ecouterNouveauxMessages(): Observable<any> {
    return this.messageSujet.asObservable();
  }

  obtenirDiscussions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUri}/discussions`, this.obtenirEntetes());
  }

  obtenirDiscussion(contactId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUri}/discussion/${contactId}`, this.obtenirEntetes());
  }
}
