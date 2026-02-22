import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { WebClient } from '@slack/web-api';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SlackService {
  private slackClient: WebClient;
  private users: Map<string, any> = new Map();

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('USER_TOKEN');
    this.slackClient = new WebClient(token);
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
      text: text
    });
  }

  async listChannels() {
    const result = await this.slackClient.conversations.list({
      types: "public_channel,private_channel",
    });

    return result.channels;
  }

  // ✅ NEW: List Users
  async listUsers() {

    try {
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
        this.users.set(user.id!, user);
        console.log(this.users)
      });

      return this.users;
    } catch (error) {
      throw new InternalServerErrorException(error.data || error);
    }
  }
}
