import { Controller, Get, Param, Post, Body, Res, Query } from "@nestjs/common";
import { SlackService } from "./slack.service";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Controller("slack")
export class SlackController {
    private LONG_POLL_TIMEOUT = 0;

    constructor(
        private readonly slackService: SlackService,
        private readonly config: ConfigService,
        private readonly eventEmitter: EventEmitter2,
        private readonly configService: ConfigService,
    ) {
        this.LONG_POLL_TIMEOUT =
            this.configService.get<number>("LONG_POLL_TIMEOUT")!;
        if (this.LONG_POLL_TIMEOUT == 0 || isNaN(this.LONG_POLL_TIMEOUT)) {
            throw new Error("Invalid LONG_POLL_TIMEOUT value");
        }
    }

    @Get("messages/new/:ts")
    getNewMessages(@Param("ts") ts: string): Promise<string> {
        console.log("GET new messages since:", ts);

        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                this.eventEmitter.removeListener("slack_event", handler);
                resolve("timeout"); //timeout
            }, this.LONG_POLL_TIMEOUT);

            const handler = (event: any) => {
                console.log("EVENT:", event);
                clearTimeout(timeout);
                const messages = this.slackService.getNewMessages(
                    parseFloat(ts),
                );
                resolve(messages);
            };
            this.eventEmitter.once("slack_event", handler);
        });
    }

    @Post("event")
    async handleEvent(@Body() body: any): Promise<string> {
        console.log("Received event via webhook");
        if (body.event && body.event.type === "message") {
            await this.getMessages(body.event.channel);
            this.eventEmitter.emit("slack_event", body.event);
        }
        return body.challenge;
    }

    @Get("messages/channel/:channelId")
    async getMessages(@Param("channelId") channelId: string): Promise<string> {
        const msgs = await this.slackService.getMessagesForClassic(channelId);
        console.log("Fetched messages for channel:", channelId);

        return msgs;
    }

    @Post("messages/channel/:channelId")
    async postMessage(
        @Param("channelId") channelId: string,
        @Body() body: string,
    ): Promise<void> {
        console.log("POST BODY:", body);
        await this.slackService.postMessage(channelId, body);
    }

    @Get("channels")
    async getChannels() {
        return this.slackService.getChannels();
    }

    @Get("sidebar")
    async getSidebar() {
        return this.slackService.getSidebar();
    }

    @Get("users")
    async getUsers() {
        return this.slackService.getUsers();
    }

    @Get("oauth")
    redirectToSlack(@Res() res: Response) {
        const clientId: any = this.config.get("SLACK_CLIENT_ID");
        const redirectUri: any = this.config.get("SLACK_REDIRECT_URI").trim();
        console.log("REDIRECT URI:", redirectUri);

        const url = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=chat:write&user_scope=chat:write&redirect_uri=${redirectUri}`;
        console.log("URL:", url);
        return res.redirect(url);
    }

    @Get("oauth/callback")
    async oauthCallback(@Query("code") code: string) {
        const response = await axios.post(
            "https://slack.com/api/oauth.v2.access",
            null,
            {
                params: {
                    client_id: process.env.SLACK_CLIENT_ID,
                    client_secret: process.env.SLACK_CLIENT_SECRET,
                    code,
                    redirect_uri: process.env.SLACK_REDIRECT_URI,
                },
            },
        );
        console.log("OAuth response:", response.data);
        const userToken = response.data.authed_user.access_token;

        console.log("User token:", userToken);

        return { success: true };
    }
}
