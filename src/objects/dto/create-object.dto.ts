import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateObjectDto {
  @ApiProperty({ example: 'Mon titre', description: 'Titre de l’objet' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Ma description', description: 'Description de l’objet' })
  @IsString()
  @IsNotEmpty()
  description!: string;
}
