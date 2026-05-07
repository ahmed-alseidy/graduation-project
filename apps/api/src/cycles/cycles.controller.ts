import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
} from "@nestjs/common";
import { ApiCookieAuth } from "@nestjs/swagger";
import { Session, type UserSession } from "@thallesp/nestjs-better-auth";
import { CyclesService } from "./cycles.service";
import { UpdateCycleDto } from "./dto/update-cycle.dto";
import { UpdateCycleSettingsDto } from "./dto/update-cycle-settings.dto";

@ApiCookieAuth()
@Controller("/workspaces/:workspaceId/cycles")
export class CyclesController {
  constructor(private readonly cyclesService: CyclesService) {}

  @Get("settings")
  async getSettings(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Session() session: UserSession
  ) {
    return await this.cyclesService.getSettings(workspaceId, session.user.id);
  }

  @Put("settings")
  async updateSettings(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Body() body: UpdateCycleSettingsDto,
    @Session() session: UserSession
  ) {
    return await this.cyclesService.updateSettings(
      workspaceId,
      session.user.id,
      body
    );
  }

  @Get("current")
  async getCurrentCycle(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Session() session: UserSession
  ) {
    return await this.cyclesService.getCycleByKind(
      workspaceId,
      session.user.id,
      "current"
    );
  }

  @Get("upcoming")
  async getUpcomingCycle(
    @Param('workspaceId', ParseUUIDPipe) workspaceId: string,
    @Session() session: UserSession
  ) {
    return await this.cyclesService.getCycleByKind(
      workspaceId,
      session.user.id,
      "upcoming"
    );
  }

  @Put(":cycleId")
  async updateCycle(
    @Param("workspaceId", ParseUUIDPipe) workspaceId: string,
    @Param("cycleId", ParseUUIDPipe) cycleId: string,
    @Body() body: UpdateCycleDto,
    @Session() session: UserSession
  ) {
    return await this.cyclesService.updateCycle(
      workspaceId,
      cycleId,
      session.user.id,
      body
    );
  }
}
