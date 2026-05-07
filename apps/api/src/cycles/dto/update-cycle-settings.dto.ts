import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  Min,
} from "class-validator";

export class UpdateCycleSettingsDto {
  @ApiProperty({
    description: "Whether cycles are enabled for the workspace",
    example: true,
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: "Cycle length in days",
    example: 14,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  lengthDays?: number;

  @ApiProperty({
    description: "Cycle anchor start date",
    example: "2026-05-07",
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;
}
