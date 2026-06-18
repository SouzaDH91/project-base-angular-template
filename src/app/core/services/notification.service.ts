import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as signalR from '@microsoft/signalr';
import { GlobalComponent } from '../../global-component';
import { Notification, ResponseViewModel } from '../models/notification.models';

const API_URL = GlobalComponent.API_URL;
const API_VERSION = GlobalComponent.API_VERSION;

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private http = inject(HttpClient);
    private hubConnection!: signalR.HubConnection;

    // Rota base com o versionamento da sua controller
    private apiUrl = `${API_URL}/${API_VERSION}notifications`;

    // Estocagem de Estado Reativa com Signals (Angular 19)
    public notifications = signal<Notification[]>([]);
    public unreadCount = signal<number>(0);

    constructor() {
        this.loadInitialHistory();
        this.startHubConnection();
    }

    /**
     * GET: api/v1/notifications/get-all
     */
    private loadInitialHistory() {
        this.http.get<ResponseViewModel<Notification[]>>(`${this.apiUrl}/get-all`).subscribe({
            next: (response) => {
                // Adicionado fallback de array vazio '|| []' para blindar o Signal contra retornos nulos
                if (response && response.success) {
                    const data = response.data || [];
                    this.notifications.set(data);
                    this.unreadCount.set(data.filter(n => !n.isRead).length);
                }
            },
            error: (err) => {
                console.error('Error returned by the API:', err);
            }
        });
    }

    /**
     * Conecta à camada de Infrastructure via WebSocket enviando JWT Bearer Token
     */
    private startHubConnection() {
        const token = localStorage.getItem('token') || '';

        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(`${API_URL}/hub/notifications`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets,
                accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

        this.hubConnection
            .start()
            .then(() => console.log('SignalR: Connected and authenticated successfully!'))
            .catch((err: any) => console.error('SignalR: Fail on connection. WebSocket:', err));

        // Ouve os eventos disparados via SendAsync pela camada de infra do .NET 10
        this.hubConnection.on('ReceiveNotification', (data: any) => {
            const newIncomingNotification: Notification = {
                id: data.id,
                userId: data.userId,
                title: data.title,
                message: data.message,
                type: data.type,
                isRead: data.isRead || false,
                created: data.created || new Date().toISOString()
            };

            // Atualização atômica do estado dos Signals
            this.notifications.update(currentList => [newIncomingNotification, ...currentList]);
            this.unreadCount.update(count => count + 1);
        });
    }

    /**
     * PUT: api/v1/notifications/{id}/read
     */
    public markAsRead(id: string) {
        this.http.put<ResponseViewModel<string>>(`${this.apiUrl}/${id}/read`, {}).subscribe({
            next: (res) => {
                if (res.success) {
                    // FILTRO: Mantém no Signal apenas as notificações que NÃO possuem o ID clicado
                    this.notifications.update(list => list.filter(n => n.id !== id));

                    // Decrementa o contador de não lidas com segurança
                    this.unreadCount.update(count => Math.max(0, count - 1));
                }
            }
        });
    }

    /**
     * PUT: api/v1/notifications/read-all
     */
    public markAllAsRead() {
        this.http.put<ResponseViewModel<string>>(`${this.apiUrl}/read-all`, {}).subscribe({
            next: (res) => {
                if (res.success) {
                    // Zera tudo: limpa o contador e esvazia o array de notificações na tela
                    this.unreadCount.set(0);
                    this.notifications.set([]);
                }
            }
        });
    }
}