import { Module } from "@nestjs/common";
import { AuthModule } from "@thallesp/nestjs-better-auth";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { auth } from "./lib/auth";
import { WorkspacesModule } from "./workspaces/workspaces.module";

@Module({
  imports: [
    WorkspacesModule,
    AuthModule.forRoot({
      auth,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
