import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export const ProjectStatus = [
  "backlog",
  "planned",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type ProjectStatus = (typeof ProjectStatus)[number];

export class CreateProjectDto {
  @ApiProperty({
    description: "The name of the project (max 32 characters)",
    example: "Project Name",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "The description of the project (max 255 characters)",
    example: "Project Description",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: "The status of the project",
    example: "backlog",
  })
  @IsEnum(ProjectStatus)
  @IsNotEmpty()
  status: ProjectStatus;

  @ApiProperty({
    description: "The priority of the project",
    example: 0,
  })
  @IsInt()
  @Min(0)
  @Max(4)
  @IsNotEmpty()
  priority: number;
}
