export interface Notification {
    id: string;
    userId?: string;
    title: string;
    message: string;
    type: string; // success, warning, danger, info
    isRead: boolean;
    created: string;
}

export interface ResponseViewModel<T> {
    success: boolean;
    data: T;
    errors?: any[];
}

export interface NotificationPayloadDTO {
    title: string;
    message: string;
    type?: string;
}

export interface UserNotificationDTO extends NotificationPayloadDTO {
    userId: string;
}