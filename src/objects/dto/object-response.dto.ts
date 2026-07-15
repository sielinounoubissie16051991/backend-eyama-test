import { ApiProperty } from '@nestjs/swagger';

export class ObjectResponseDto {
  @ApiProperty({ example: '64a9c0e75d1f3d0023b0f8d1', description: 'Identifiant MongoDB de l’objet' })
  _id!: string;

  @ApiProperty({ example: 'Mon titre', description: 'Titre de l’objet' })
  title!: string;

  @ApiProperty({ example: 'Ma description', description: 'Description de l’objet' })
  description!: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...', description: 'URL sécurisée de l’image' })
  imageUrl!: string;

  @ApiProperty({ example: 'abc123', description: 'Identifiant Cloudinary utilisé pour supprimer l’image' })
  imagePublicId!: string;

  @ApiProperty({ example: '2026-07-14T00:00:00.000Z', description: 'Date de création de l’objet' })
  createdAt!: Date;
}
