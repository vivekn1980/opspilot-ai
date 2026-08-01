import { IsIn, IsOptional } from "class-validator";
import { AI_PROVIDERS, AiProvider } from "../constants";

export class UpdateSettingsDto {
  @IsIn(AI_PROVIDERS)
  @IsOptional()
  aiProvider?: AiProvider;
}
