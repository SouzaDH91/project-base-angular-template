export interface PaginatedResponse<T> {
    success: boolean;
    totalItems: number;
    data: T[];
}