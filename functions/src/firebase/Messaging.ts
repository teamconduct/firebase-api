/**
 * Represents a notification payload for Firebase Cloud Messaging.
 */
export interface Notification {
    /**
     * The notification title.
     */
    title?: string;
    /**
     * The notification body text.
     */
    body?: string;
    /**
     * URL of an image to be displayed in the notification.
     */
    imageUrl?: string;
}

/**
 * Response from sending batch messages to multiple devices.
 */
export interface BatchResponse {
    /**
     * Array of individual message responses.
     */
    responses: {
        /**
         * Whether the message was sent successfully.
         */
        success: boolean;
        /**
         * The message ID if successful.
         */
        messageId?: string;
        /**
         * Error information if the message failed to send.
         */
        error?: {
            /**
             * Error code identifier.
             */
            code: string;
            /**
             * Human-readable error message.
             */
            message: string;
            /**
             * Optional stack trace for debugging.
             */
            stack?: string;
            /**
             * Converts the error to a JSON object.
             */
            toJSON(): object;
        };
    }[];
    /**
     * Number of messages sent successfully.
     */
    successCount: number;
    /**
     * Number of messages that failed to send.
     */
    failureCount: number;
}

/**
 * Message to be sent to multiple device tokens.
 */
export interface MulticastMessage {
    /**
     * Array of device registration tokens to send the message to.
     */
    tokens: string[];
    /**
     * Optional notification payload to include in the message.
     */
    notification?: Notification;
}

/**
 * Firebase Cloud Messaging service interface.
 */
export interface Messaging {
    /**
     * Sends a multicast message to multiple devices.
     *
     * @param message - The multicast message containing tokens and notification
     * @param dryRun - If true, validates the message without actually sending it
     * @returns Promise resolving to batch response with success/failure details
     */
    sendEachForMulticast(message: MulticastMessage, dryRun?: boolean): Promise<BatchResponse>;
}
