import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateWorkspaceDto {
  @ApiProperty({
    description: "The name of the workspace (max 32 characters)",
    example: "Workspace Name Example",
  })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "The slug of the workspace (max 32 characters)",
    example: "workspace-name-example",
  })
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  @IsNotEmpty()
  slug: string;
}
