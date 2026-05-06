import { IsEmail, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class NotificationDto {
  @IsString()
  @IsNotEmpty({ message: 'O campo event não pode ser vazio' })
  event!: string;

  @IsEmail({}, { message: 'recipientEmail deve ser um e-mail válido' })
  recipientEmail!: string;

  @IsObject()
  payload!: Record<string, unknown>;
}
