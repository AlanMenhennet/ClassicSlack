import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as bodyParser from "body-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });

    app.use(bodyParser.text({ type: "text/plain" }));
    const server = app.getHttpServer();
    server.keepAliveTimeout = 60000;
    server.headersTimeout = 65000;

    await app.listen(process.env.PORT ?? 80);
}
bootstrap();
