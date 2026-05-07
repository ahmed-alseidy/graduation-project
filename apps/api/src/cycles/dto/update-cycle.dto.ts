import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateCycleDto {
  @ApiProperty({
    description: "Cycle name",
    example: "Cycle 12",
    required: false,
  })
  @IsString()
  @MaxLength(120)
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: "Cycle start date",
    example: "2026-05-07",
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: "Cycle end date",
    example: "2026-05-21",
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;
}
