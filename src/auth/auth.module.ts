import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  imports: [PrismaModule,
    JwtModule.register({
      global: true,
      secret: "supersecretkey"
    }),

  ],
  providers: [AuthService],
})
export class AuthModule { }
