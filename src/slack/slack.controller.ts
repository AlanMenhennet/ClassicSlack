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
  ) {}

  @Get("messages/:channelId")
  async getMessages(@Param("channelId") channelId: string) {
    const resp = await this.slackService.fetchMessages(channelId);
    return JSON.stringify(resp, null, 4);
  }

  @Post("messages/:channelId")
  async postMessage(
    @Param("channelId") channelId: string,
    @Body() body: string,
  ) {
    console.log("POST BODY:", body);
    return this.slackService.postMessage(channelId, body);
  }


  @Get("channels")
  async getChannels() {
    return JSON.stringify(await this.slackService.listChannels(), null, 4);
  }

  // ✅ NEW
  @Get("users")
  async getUsers() {
    return this.slackService.listUsers();
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
