import { ApiProperty } from '@nestjs/swagger';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ObjectDocument = ObjectEntity & Document;

@Schema({ timestamps: { createdAt: 'createdAt', updatedAt: false } })
export class ObjectEntity {
  @ApiProperty({ example: 'seed-1', description: 'Identifiant optionnel de l’objet' , required: false })
  @Prop()
  id?: string;

  @ApiProperty({ example: 'Mon titre', description: 'Titre de l’objet' })
  @Prop({ required: true })
  title!: string;

  @ApiProperty({ example: 'Ma description', description: 'Description de l’objet' })
  @Prop({ required: true })
  description!: string;

  @ApiProperty({ example: 'https://res.cloudinary.com/...', description: 'URL sécurisée de l’image' })
  @Prop({ required: true })
  imageUrl!: string;

  @ApiProperty({ example: 'abc123', description: 'Identifiant Cloudinary utilisé pour supprimer l’image' })
  @Prop({ required: true })
  imagePublicId!: string;

  @ApiProperty({ example: '2026-07-14T00:00:00.000Z', description: 'Date de création de l’objet' })
  createdAt?: Date;
}

export const ObjectSchema = SchemaFactory.createForClass(ObjectEntity);
