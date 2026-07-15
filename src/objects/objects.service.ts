import { Injectable, NotFoundException, OnModuleInit, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ObjectEntity, ObjectDocument } from './schemas/object.schema';
import { CreateObjectDto } from './dto/create-object.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ObjectsService implements OnModuleInit {
  private readonly inMemoryObjects: ObjectEntity[] = [];

  constructor(
    @Optional()
    @InjectModel(ObjectEntity.name)
    private readonly objectModel: Model<ObjectDocument> | undefined,
    private readonly cloudinaryService: CloudinaryService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  onModuleInit() {
    // Seeds: use string `_id` so `findById('107f1f77bcf86cd799439011')` works consistently
    const seedObjects: any[] = [
      {
        _id: '107f1f77bcf86cd799439011',
        id: '107f1f77bcf86cd799439011',
        title: 'Vase en céramique',
        description: 'Un objet de décoration à exposer dans un salon moderne.',
        imageUrl:
          'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=900&q=80',
        imagePublicId: 'seed-vase-ceramique',
        createdAt: new Date('2026-07-10T09:30:00.000Z'),
      },
      {
        _id: '207f1f77bcf86cd799439011',
        id: '207f1f77bcf86cd799439011',
        title: 'Lampe de bureau',
        description: 'Lampe compacte avec une lumière douce pour les soirées de travail.',
        imageUrl:
          'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80',
        imagePublicId: 'seed-lampe-bureau',
        createdAt: new Date('2026-07-12T15:45:00.000Z'),
      },
    ];

    if (this.objectModel) {
      const model = this.objectModel;

      // Ensure seeds exist: insert individually if missing (by string _id)
      (async () => {
        try {
          for (const seed of seedObjects) {
            const found = await model.findById(seed._id).exec();
            if (!found) {
              await model.create(seed);
              console.log(`Seed inséré: ${seed._id}`);
            }
          }
        } catch (error) {
          console.error('Échec de l’insertion des seeds MongoDB:', error);
        }
      })();

      return;
    }

    this.inMemoryObjects.push(...(seedObjects as ObjectEntity[]));
  }

  private createMemoryObject(dto: CreateObjectDto, uploadResult: any): ObjectEntity {
    const object: ObjectEntity = {
      title: dto.title,
      description: dto.description,
      imageUrl: uploadResult.secure_url,
      imagePublicId: uploadResult.public_id,
      createdAt: new Date(),
    } as ObjectEntity;

    return object;
  }

  async create(
    dto: CreateObjectDto,
    file: any,
  ): Promise<ObjectEntity> {
    const uploadResult = await this.cloudinaryService.uploadImage(file);

    if (this.objectModel) {
      const created = new this.objectModel({
        title: dto.title,
        description: dto.description,
        imageUrl: uploadResult.secure_url,
        imagePublicId: uploadResult.public_id,
      });

      const saved = await created.save();
      this.eventsGateway.emitObjectCreated(saved);
      return saved;
    }

    const saved = this.createMemoryObject(dto, uploadResult);
    (saved as any)._id = new Types.ObjectId().toHexString();
    this.inMemoryObjects.unshift(saved);
    this.eventsGateway.emitObjectCreated(saved);
    return saved;
  }

  async findAll(): Promise<ObjectEntity[]> {
    if (this.objectModel) {
      return this.objectModel.find().sort({ createdAt: -1 }).exec();
    }
    return [...this.inMemoryObjects];
  }

  async findOne(id: string): Promise<ObjectEntity> {
    if (this.objectModel) {
      const found = await this.objectModel.findById(id).exec();
      if (!found) {
        throw new NotFoundException(`Objet ${id} introuvable`);
      }
      return found;
    }

    const found = this.inMemoryObjects.find((item) =>
      (item as any)._id?.toString() === id,
    );
    if (!found) {
      throw new NotFoundException(`Objet ${id} introuvable`);
    }
    return found;
  }

  async remove(id: string): Promise<void> {
    if (this.objectModel) {
      const found = await this.objectModel.findById(id).exec();
      if (!found) {
        throw new NotFoundException(`Objet ${id} introuvable`);
      }

      await this.cloudinaryService.deleteImage(found.imagePublicId);
      await this.objectModel.findByIdAndDelete(id).exec();
      this.eventsGateway.emitObjectDeleted(id);
      return;
    }

    const index = this.inMemoryObjects.findIndex(
      (item) => (item as any)._id?.toString() === id,
    );
    if (index === -1) {
      throw new NotFoundException(`Objet ${id} introuvable`);
    }

    const found = this.inMemoryObjects[index];
    if (found.imagePublicId && !found.imagePublicId.startsWith('seed-')) {
      await this.cloudinaryService.deleteImage(found.imagePublicId);
    }
    this.inMemoryObjects.splice(index, 1);
    this.eventsGateway.emitObjectDeleted(id);
  }
}
