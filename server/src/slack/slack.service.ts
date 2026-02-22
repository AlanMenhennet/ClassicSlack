import { Injectable } from "@nestjs/common";
import { WebClient } from "@slack/web-api";
import { ConfigService } from "@nestjs/config";
import { text } from "express";
import { async } from "rxjs";
import { channel } from "diagnostics_channel";

@Injectable()
export class SlackService {
    private slackClient: WebClient;
    private userMap: Map<string, any> = new Map();

    constructor(private configService: ConfigService) {
        const token = this.configService.get<string>("USER_TOKEN");
        this.slackClient = new WebClient(token);
    }

    async getMessagesForClassic(channelId: string): Promise<string> {
        let messageStr = "";
        if (this.userMap.size === 0) {
            await this.listUsers();
        }
        const messages = await this.fetchMessages(channelId);
        messages?.reverse().forEach((message) => {
            const user = this.userMap.get(message.user!);
            const userName = user
                ? user.real_name || user.name
                : "Unknown User";
            messageStr += `${userName}: ${this.parseMessage(message.text!)}\n`;
        });
        return messageStr;
    }

    parseMessage(message: string): string {
        const userMentionRegex = /<@(\w+)>/g;
        let match;
        while ((match = userMentionRegex.exec(message)) !== null) {
            const userId = match[1];
            const user = this.userMap.get(userId);
            const userName = user
                ? user.real_name || user.name
                : "Unknown User";
            console.log(`Found user mention: ${userId} (${userName})`);
            message = message.replace(match[0], `@${userName}`);
        }
        return message;
    }

    async fetchMessages(channelId: string) {
        const result = await this.slackClient.conversations.history({
            channel: channelId,
            limit: 50,
        });

        return result.messages;
    }

    async postMessage(channelId: string, text: string) {
        return this.slackClient.chat.postMessage({
            channel: channelId,
            text: text,
        });
    }

    async listChannels() {
        const result = await this.slackClient.conversations.list({
            types: "public_channel,private_channel",
        });

        return result.channels;
    }

    async listUsers() {
        const result = await this.slackClient.users.list({});

        const users = result.members
            ?.filter((user) => !user.is_bot && !user.deleted)
            .map((user) => ({
                id: user.id,
                name: user.name,
                real_name: user.profile?.real_name,
                email: user.profile?.email,
            }));

        users!.forEach((user) => {
            console.log(user);
            this.userMap.set(user.id!, user);
        });

        return this.userMap;
    }
}
