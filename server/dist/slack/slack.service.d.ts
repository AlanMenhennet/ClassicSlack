import { ConfigService } from "@nestjs/config";
import { SlackerMessage } from "src/model/SlackerMessage";
export declare class SlackService {
    private configService;
    private slackClient;
    private userMap;
    private messages;
    private channels;
    constructor(configService: ConfigService);
    init(): Promise<void>;
    getNewMessages(ts: number): string;
    messagesToString(messages: SlackerMessage[]): string;
    getMessagesForClassic(channelId: string): Promise<string>;
    parseMessage(message: string): string;
    fetchMessages(channelId: string): Promise<import("@slack/web-api/dist/types/response/ConversationsHistoryResponse").MessageElement[]>;
    postMessage(channelId: string, text: string): Promise<import("@slack/web-api").ChatPostMessageResponse>;
    getChannels(): string;
    getUsers(): string;
    fetchChannels(): Promise<void>;
    getSidebar(): Promise<string>;
    fetchUsers(): Promise<Map<string, any>>;
}
