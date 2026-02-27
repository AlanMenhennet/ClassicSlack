import { Injectable } from "@nestjs/common";
import { WebClient } from "@slack/web-api";
import { ConfigService } from "@nestjs/config";

class Message {
    user: string = "";
    text: string = "";
    ts: number = 0;

    toString(): string {
        return `${this.getFormattedDate(this.getDate())} | ${this.user}: ${this.text}`;
    }

    getDate(): Date {
        const date = new Date(
            parseInt(this.ts.toString().split(".")[0]) * 1000,
        );
        return date;
    }

    getFormattedDate(date: Date): string {
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }
}

@Injectable()
export class SlackService {
    private slackClient: WebClient;
    private userMap: Map<string, any> = new Map();
    private messages: Message[] = [];

    constructor(private configService: ConfigService) {
        const token = this.configService.get<string>("USER_TOKEN");
        this.slackClient = new WebClient(token);
    }

    getNewMessages(ts: number): string {
        console.log(this.messages);
        const newMessages = this.messages.filter((message) => message.ts > ts);
        if (newMessages.length === 0) {
            return "";
        }
        return this.messagesToString(newMessages);
    }

    messagesToString(messages: Message[]): string {
        let messageStr = "";
        messages.forEach((message) => {
            messageStr += `${message.toString()}\r\n`;
        });

        messageStr += `LAST MESSAGE:${messages[messages.length - 1].ts} \n`;
        return messageStr;
    }

    async getMessagesForClassic(channelId: string): Promise<string> {
        const messageStr = "";
        if (this.userMap.size === 0) {
            await this.listUsers();
        }
        const messages = await this.fetchMessages(channelId);
        console.log(messages);
        messages?.reverse().forEach((message) => {
            const messageObj = new Message();
            messageObj.user = this.userMap.get(message.user!).name;
            messageObj.text = this.parseMessage(message.text!);
            messageObj.ts = parseFloat(message.ts!);
            this.messages.push(messageObj);
        });

        let trimmedMessages = this.messages;
        if (this.messages.length > 10) {
            trimmedMessages = this.messages.slice(this.messages.length - 10);
        }
        return this.messagesToString(trimmedMessages);
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
            message = message.replace(match[0], `@${userName}`);
        }
        return message;
    }

    async fetchMessages(channelId: string) {
        const result = await this.slackClient.conversations.history({
            channel: channelId,
            limit: 50,
        });

        return result.messages!;
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
            this.userMap.set(user.id!, user);
        });

        return this.userMap;
    }
}
