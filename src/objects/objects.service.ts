import { Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ObjectEntity, ObjectDocument } from './schemas/object.schema';
import { CreateObjectDto } from './dto/create-object.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class ObjectsService {
  private readonly inMemoryObjects: ObjectEntity[] = [];

  constructor(
    @Optional()
    @InjectModel(ObjectEntity.name)
    private readonly objectModel: Model<ObjectDocument> | undefined,
    private readonly cloudinaryService: CloudinaryService,
    private readonly eventsGateway: EventsGateway,
  ) {}

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
    await this.cloudinaryService.deleteImage(found.imagePublicId);
    this.inMemoryObjects.splice(index, 1);
    this.eventsGateway.emitObjectDeleted(id);
  }
}
