import { SlackService } from "./slack.service";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import { EventEmitter2 } from "@nestjs/event-emitter";
export declare class SlackController {
    private readonly slackService;
    private readonly config;
    private readonly eventEmitter;
    private readonly configService;
    private LONG_POLL_TIMEOUT;
    constructor(slackService: SlackService, config: ConfigService, eventEmitter: EventEmitter2, configService: ConfigService);
    getNewMessages(ts: string): Promise<string>;
    handleEvent(body: any): Promise<string>;
    getMessages(channelId: string): Promise<string>;
    postMessage(channelId: string, body: string): Promise<void>;
    getChannels(): Promise<string>;
    getSidebar(): Promise<string>;
    getUsers(): Promise<string>;
    redirectToSlack(res: Response): void;
    oauthCallback(code: string): Promise<{
        success: boolean;
    }>;
}
