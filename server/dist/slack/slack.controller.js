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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackController = void 0;
const common_1 = require("@nestjs/common");
const slack_service_1 = require("./slack.service");
const axios_1 = __importDefault(require("axios"));
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
let SlackController = class SlackController {
    slackService;
    config;
    eventEmitter;
    configService;
    LONG_POLL_TIMEOUT = 0;
    constructor(slackService, config, eventEmitter, configService) {
        this.slackService = slackService;
        this.config = config;
        this.eventEmitter = eventEmitter;
        this.configService = configService;
        this.LONG_POLL_TIMEOUT =
            this.configService.get("LONG_POLL_TIMEOUT");
        if (this.LONG_POLL_TIMEOUT == 0 || isNaN(this.LONG_POLL_TIMEOUT)) {
            throw new Error("Invalid LONG_POLL_TIMEOUT value");
        }
    }
    getNewMessages(ts) {
        console.log("GET new messages since:", ts);
        return new Promise((resolve) => {
            const timeout = setTimeout(() => {
                this.eventEmitter.removeListener("slack_event", handler);
                resolve("timeout");
            }, this.LONG_POLL_TIMEOUT);
            const handler = (event) => {
                console.log("EVENT:", event);
                clearTimeout(timeout);
                const messages = this.slackService.getNewMessages(parseFloat(ts));
                resolve(messages);
            };
            this.eventEmitter.once("slack_event", handler);
        });
    }
    async handleEvent(body) {
        console.log("Received event via webhook");
        if (body.event && body.event.type === "message") {
            await this.getMessages(body.event.channel);
            this.eventEmitter.emit("slack_event", body.event);
        }
        return body.challenge;
    }
    async getMessages(channelId) {
        const msgs = await this.slackService.getMessagesForClassic(channelId);
        console.log("Fetched messages for channel:", channelId);
        return msgs;
    }
    async postMessage(channelId, body) {
        console.log("POST BODY:", body);
        await this.slackService.postMessage(channelId, body);
    }
    async getChannels() {
        return this.slackService.getChannels();
    }
    async getSidebar() {
        return this.slackService.getSidebar();
    }
    async getUsers() {
        return this.slackService.getUsers();
    }
    redirectToSlack(res) {
        const clientId = this.config.get("SLACK_CLIENT_ID");
        const redirectUri = this.config.get("SLACK_REDIRECT_URI").trim();
        console.log("REDIRECT URI:", redirectUri);
        const url = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=chat:write&user_scope=chat:write&redirect_uri=${redirectUri}`;
        console.log("URL:", url);
        return res.redirect(url);
    }
    async oauthCallback(code) {
        const response = await axios_1.default.post("https://slack.com/api/oauth.v2.access", null, {
            params: {
                client_id: process.env.SLACK_CLIENT_ID,
                client_secret: process.env.SLACK_CLIENT_SECRET,
                code,
                redirect_uri: process.env.SLACK_REDIRECT_URI,
            },
        });
        console.log("OAuth response:", response.data);
        const userToken = response.data.authed_user.access_token;
        console.log("User token:", userToken);
        return { success: true };
    }
};
exports.SlackController = SlackController;
__decorate([
    (0, common_1.Get)("messages/new/:ts"),
    __param(0, (0, common_1.Param)("ts")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SlackController.prototype, "getNewMessages", null);
__decorate([
    (0, common_1.Post)("event"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SlackController.prototype, "handleEvent", null);
__decorate([
    (0, common_1.Get)("messages/channel/:channelId"),
    __param(0, (0, common_1.Param)("channelId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SlackController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Post)("messages/channel/:channelId"),
    __param(0, (0, common_1.Param)("channelId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SlackController.prototype, "postMessage", null);
__decorate([
    (0, common_1.Get)("channels"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SlackController.prototype, "getChannels", null);
__decorate([
    (0, common_1.Get)("sidebar"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SlackController.prototype, "getSidebar", null);
__decorate([
    (0, common_1.Get)("users"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SlackController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)("oauth"),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SlackController.prototype, "redirectToSlack", null);
__decorate([
    (0, common_1.Get)("oauth/callback"),
    __param(0, (0, common_1.Query)("code")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SlackController.prototype, "oauthCallback", null);
exports.SlackController = SlackController = __decorate([
    (0, common_1.Controller)("slack"),
    __metadata("design:paramtypes", [slack_service_1.SlackService,
        config_1.ConfigService,
        event_emitter_1.EventEmitter2,
        config_1.ConfigService])
], SlackController);
//# sourceMappingURL=slack.controller.js.map