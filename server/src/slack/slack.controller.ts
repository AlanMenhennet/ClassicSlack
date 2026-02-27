import { Controller, Get, Param, Post, Body, Res, Query } from "@nestjs/common";
import { SlackService } from "./slack.service";
import axios from "axios";
import { ConfigService } from "@nestjs/config";
import type { Response } from "express";

@Controller("slack")
export class SlackController {
    constructor(
        private readonly slackService: SlackService,
        private readonly config: ConfigService,
    ) { }

    @Get("messages/new/:ts")
    getNewMessages(@Param("ts") ts: string): string {
        console.log("GET new messages since:", ts);
        return this.slackService.getNewMessages(parseFloat(ts));
    }

    @Get("messages/channel/:channelId")
    async getMessages(@Param("channelId") channelId: string): Promise<string> {
        console.log("Fetching messages for channel:", channelId);

        const msgs = await this.slackService.getMessagesForClassic(channelId);
        console.log(msgs);
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
        return JSON.stringify(await this.slackService.listChannels(), null, 4);
    }

    // ✅ NEW
    @Get("users")
    async getUsers() {
        const returnedUsers = await this.slackService.listUsers();
        console.log("RETURNED", returnedUsers);

        return Object.fromEntries(returnedUsers);
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

        // 🔐 Store this in DB securely
        console.log("User token:", userToken);

        return { success: true };
    }
}
