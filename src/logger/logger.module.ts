import { Module } from "@nestjs/common";
import { PrismaModule } from "prisma/prisma.module";
import { LoggerService } from "./logger.service";
import { LoggerController } from "./logger.controller";
import { AuthModule } from "src/auth/auth.module";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [PrismaModule],
    providers: [LoggerService],
    exports: [LoggerService],
    controllers: [LoggerController]
})
export class LoggerModule { }