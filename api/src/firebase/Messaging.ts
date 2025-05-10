export interface Notification {
    title?: string;
    body?: string;
    imageUrl?: string;
}

export interface BatchResponse {
    responses: {
        success: boolean;
        messageId?: string;
        error?: {
            code: string;
            message: string;
            stack?: string;
            toJSON(): object;
        };
    }[];
    successCount: number;
    failureCount: number;
}

export interface MulticastMessage {
    tokens: string[];
    notification?: Notification;
}

export interface Messaging {
    sendEachForMulticast(message: MulticastMessage, dryRun?: boolean): Promise<BatchResponse>;
}
