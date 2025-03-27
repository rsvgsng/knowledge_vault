import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IssuesModule } from './issues/issues.module';
import { ProgramsModule } from './programs/programs.module';

@Module({
  imports: [ProgramsModule, IssuesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
