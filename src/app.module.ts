import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProgramsModule } from './programs/programs.module';
import { AuthModule } from './auth/auth.module';
import { RepoModule } from './repo/repo.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { IssuesModule } from './issues/issues.module';

@Module({
  imports: [ProgramsModule, AuthModule, RepoModule,

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    IssuesModule,



  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
