import { ConfigService } from "@nestjs/config";
export declare class SlackService {
    private configService;
    private slackClient;
    private userMap;
    constructor(configService: ConfigService);
    getMessagesForClassic(channelId: string): Promise<string>;
    parseMessage(message: string): string;
    fetchMessages(channelId: string): Promise<import("@slack/web-api/dist/types/response/ConversationsHistoryResponse").MessageElement[] | undefined>;
    postMessage(channelId: string, text: string): Promise<import("@slack/web-api").ChatPostMessageResponse>;
    listChannels(): Promise<import("@slack/web-api/dist/types/response/ConversationsListResponse").Channel[] | undefined>;
    listUsers(): Promise<Map<string, any>>;
}
