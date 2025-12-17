import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEmail, IsNotEmpty } from "class-validator";

export class AddMemberToWorkspaceDto {
  @ApiProperty({
    description: "The emails of the users to add to the workspace",
    example: ["user1@example.com", "user2@example.com"],
  })
  @IsNotEmpty()
  @IsArray({ each: true })
  @IsEmail({}, { each: true })
  emails: string[];
}
