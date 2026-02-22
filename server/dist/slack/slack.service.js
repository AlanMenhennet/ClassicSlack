"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackService = void 0;
const common_1 = require("@nestjs/common");
const web_api_1 = require("@slack/web-api");
const config_1 = require("@nestjs/config");
let SlackService = class SlackService {
    configService;
    slackClient;
    userMap = new Map();
    constructor(configService) {
        this.configService = configService;
        const token = this.configService.get("USER_TOKEN");
        this.slackClient = new web_api_1.WebClient(token);
    }
    async getMessagesForClassic(channelId) {
        let messageStr = "";
        if (this.userMap.size === 0) {
            await this.listUsers();
        }
        const messages = await this.fetchMessages(channelId);
        messages?.reverse().forEach((message) => {
            const user = this.userMap.get(message.user);
            const userName = user
                ? user.real_name || user.name
                : "Unknown User";
            messageStr += `${userName}: ${this.parseMessage(message.text)}\n`;
        });
        return messageStr;
    }
    parseMessage(message) {
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
    async fetchMessages(channelId) {
        const result = await this.slackClient.conversations.history({
            channel: channelId,
            limit: 50,
        });
        return result.messages;
    }
    async postMessage(channelId, text) {
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
        users.forEach((user) => {
            console.log(user);
            this.userMap.set(user.id, user);
        });
        return this.userMap;
    }
};
exports.SlackService = SlackService;
exports.SlackService = SlackService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SlackService);
//# sourceMappingURL=slack.service.js.map