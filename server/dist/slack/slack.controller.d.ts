import { SlackService } from "./slack.service";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
export declare class SlackController {
    private readonly slackService;
    private readonly config;
    constructor(slackService: SlackService, config: ConfigService);
    getNewMessages(ts: string): string;
    getMessages(channelId: string): Promise<string>;
    postMessage(channelId: string, body: string): Promise<void>;
    getChannels(): Promise<string>;
    getUsers(): Promise<{
        [k: string]: any;
    }>;
    redirectToSlack(res: Response): void;
    oauthCallback(code: string): Promise<{
        success: boolean;
    }>;
}
