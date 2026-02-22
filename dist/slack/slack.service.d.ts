import { ConfigService } from '@nestjs/config';
export declare class SlackService {
    private configService;
    private slackClient;
    private users;
    constructor(configService: ConfigService);
    fetchMessages(channelId: string): Promise<import("@slack/web-api/dist/types/response/ConversationsHistoryResponse").MessageElement[] | undefined>;
    postMessage(channelId: string, text: string): Promise<import("@slack/web-api").ChatPostMessageResponse>;
    listChannels(): Promise<import("@slack/web-api/dist/types/response/ConversationsListResponse").Channel[] | undefined>;
    listUsers(): Promise<Map<string, any>>;
}
