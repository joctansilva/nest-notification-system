import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class NotificationDto {
  @IsString()
  @IsNotEmpty({ message: 'O campo event não pode ser vazio' })
  event!: string;

  @IsEmail({}, { message: 'recipientEmail deve ser um e-mail válido' })
  recipientEmail!: string;

  @IsObject()
  payload!: Record<string, unknown>;
}

export class BulkTestDto {
  @IsInt()
  @Min(1)
  @Max(100)
  total!: number;

  @IsInt()
  @Min(0)
  failCount!: number;
}
