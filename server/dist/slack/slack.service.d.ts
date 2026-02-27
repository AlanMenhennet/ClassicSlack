import { ConfigService } from "@nestjs/config";
declare class Message {
    user: string;
    text: string;
    ts: number;
    toString(): string;
    getDate(): Date;
    getFormattedDate(date: Date): string;
}
export declare class SlackService {
    private configService;
    private slackClient;
    private userMap;
    private messages;
    constructor(configService: ConfigService);
    getNewMessages(ts: number): string;
    messagesToString(messages: Message[]): string;
    getMessagesForClassic(channelId: string): Promise<string>;
    parseMessage(message: string): string;
    fetchMessages(channelId: string): Promise<import("@slack/web-api/dist/types/response/ConversationsHistoryResponse").MessageElement[]>;
    postMessage(channelId: string, text: string): Promise<import("@slack/web-api").ChatPostMessageResponse>;
    listChannels(): Promise<import("@slack/web-api/dist/types/response/ConversationsListResponse").Channel[] | undefined>;
    listUsers(): Promise<Map<string, any>>;
}
export {};
