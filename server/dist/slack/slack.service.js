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
const SlackerMessage_1 = require("../model/SlackerMessage");
const SlackerChannel_1 = require("../model/SlackerChannel");
let SlackService = class SlackService {
    configService;
    slackClient;
    userMap = new Map();
    messages = [];
    channels = [];
    constructor(configService) {
        this.configService = configService;
        const token = this.configService.get("USER_TOKEN");
        this.slackClient = new web_api_1.WebClient(token);
        this.init();
    }
    async init() {
        await this.fetchUsers();
        await this.fetchChannels();
    }
    getNewMessages(ts) {
        console.log(this.messages);
        const newMessages = this.messages.filter((message) => message.ts > ts);
        if (newMessages.length === 0) {
            return "";
        }
        return this.messagesToString(newMessages);
    }
    messagesToString(messages) {
        let messageStr = "";
        messages.forEach((message) => {
            messageStr += `${message.toString()}\r\n`;
        });
        messageStr += `LAST MESSAGE:${messages[messages.length - 1].ts} \n`;
        return messageStr;
    }
    async getMessagesForClassic(channelId) {
        const messages = await this.fetchMessages(channelId);
        messages?.reverse().forEach((message) => {
            const messageObj = new SlackerMessage_1.SlackerMessage();
            messageObj.user = this.userMap.get(message.user).name;
            messageObj.text = this.parseMessage(message.text);
            messageObj.ts = parseFloat(message.ts);
            this.messages.push(messageObj);
        });
        let trimmedMessages = this.messages;
        if (this.messages.length > 10) {
            trimmedMessages = this.messages.slice(this.messages.length - 10);
        }
        return this.messagesToString(trimmedMessages);
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
    getChannels() {
        return this.channels.map((channel) => `#${channel.name}`).join("\n");
    }
    getUsers() {
        let users = "";
        this.userMap.forEach((user) => {
            console.log(user);
            users += `@${user.name}\n`;
        });
        return users;
    }
    async fetchChannels() {
        const result = await this.slackClient.conversations.list({
            types: "public_channel,private_channel",
        });
        const slackerChannels = [];
        result.channels?.forEach((channel) => {
            const slackerChannel = new SlackerChannel_1.SlackerChannel();
            slackerChannel.id = channel.id;
            slackerChannel.name = channel.name;
            slackerChannels.push(slackerChannel);
        });
        this.channels = slackerChannels;
    }
    async getSidebar() {
        let sidebar = this.getUsers();
        sidebar += "------\n";
        sidebar += this.getChannels();
        return sidebar;
    }
    async fetchUsers() {
        const result = {
            ok: true,
            members: [
                {
                    id: "USLACKBOT",
                    name: "slackbot",
                    is_bot: false,
                    updated: 0,
                    is_app_user: false,
                    team_id: "T0AGX0GDVPA",
                    deleted: false,
                    color: "757575",
                    is_email_confirmed: false,
                    real_name: "Slackbot",
                    tz: "America/Los_Angeles",
                    tz_label: "Pacific Standard Time",
                    tz_offset: -28800,
                    is_admin: false,
                    is_owner: false,
                    is_primary_owner: false,
                    is_restricted: false,
                    is_ultra_restricted: false,
                    who_can_share_contact_card: "EVERYONE",
                    profile: [Object],
                },
                {
                    id: "U0AFZ97V5TP",
                    name: "alan",
                    is_bot: false,
                    updated: 1771550632,
                    is_app_user: false,
                    team_id: "T0AGX0GDVPA",
                    deleted: false,
                    color: "73769d",
                    is_email_confirmed: true,
                    real_name: "alan",
                    tz: "Australia/Canberra",
                    tz_label: "Australian Eastern Daylight Time",
                    tz_offset: 39600,
                    is_admin: true,
                    is_owner: true,
                    is_primary_owner: true,
                    is_restricted: false,
                    is_ultra_restricted: false,
                    has_2fa: false,
                    who_can_share_contact_card: "EVERYONE",
                    profile: [Object],
                },
                {
                    id: "U0AG0KJJ2JJ",
                    name: "demo_app",
                    is_bot: true,
                    updated: 1771550844,
                    is_app_user: false,
                    team_id: "T0AGX0GDVPA",
                    deleted: false,
                    color: "d1707d",
                    is_email_confirmed: false,
                    real_name: "Demo App",
                    tz: "America/Los_Angeles",
                    tz_label: "Pacific Standard Time",
                    tz_offset: -28800,
                    is_admin: false,
                    is_owner: false,
                    is_primary_owner: false,
                    is_restricted: false,
                    is_ultra_restricted: false,
                    who_can_share_contact_card: "EVERYONE",
                    profile: [Object],
                },
            ],
            cache_ts: 1772255186,
            response_metadata: {
                next_cursor: "",
                scopes: [
                    "identify",
                    "channels:history",
                    "channels:read",
                    "groups:read",
                    "im:read",
                    "mpim:read",
                    "users:read",
                    "chat:write",
                ],
                acceptedScopes: ["users:read"],
            },
        };
        const users = result.members
            ?.filter((user) => !user.is_bot && !user.deleted)
            .map((user) => ({
            id: user.id,
            name: user.name,
            real_name: user.profile?.real_name,
            email: user.profile?.email,
        }));
        users.forEach((user) => {
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