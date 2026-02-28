import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SlackModule } from "./slack/slack.module";
import { EventEmitterModule } from "@nestjs/event-emitter";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        SlackModule,
        EventEmitterModule.forRoot(),
    ],
})
export class AppModule { }
