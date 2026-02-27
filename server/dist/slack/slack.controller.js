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
let SlackController = class SlackController {
    slackService;
    config;
    constructor(slackService, config) {
        this.slackService = slackService;
        this.config = config;
    }
    getNewMessages(ts) {
        console.log("GET new messages since:", ts);
        return this.slackService.getNewMessages(parseFloat(ts));
    }
    async getMessages(channelId) {
        console.log("Fetching messages for channel:", channelId);
        const msgs = await this.slackService.getMessagesForClassic(channelId);
        console.log(msgs);
        return msgs;
    }
    async postMessage(channelId, body) {
        console.log("POST BODY:", body);
        await this.slackService.postMessage(channelId, body);
    }
    async getChannels() {
        return JSON.stringify(await this.slackService.listChannels(), null, 4);
    }
    async getUsers() {
        const returnedUsers = await this.slackService.listUsers();
        console.log("RETURNED", returnedUsers);
        return Object.fromEntries(returnedUsers);
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
    __metadata("design:returntype", String)
], SlackController.prototype, "getNewMessages", null);
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
        config_1.ConfigService])
], SlackController);
//# sourceMappingURL=slack.controller.js.map