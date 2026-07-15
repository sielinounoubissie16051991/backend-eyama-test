import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { ObjectEntity, ObjectSchema } from './schemas/object.schema';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { EventsModule } from '../events/events.module';

@Module({
  controllers: [ObjectsController],
  providers: [ObjectsService],
  imports: [],
})
export class ObjectsModule {
  static forRoot(useDatabase: boolean): DynamicModule {
    const imports: Array<DynamicModule | typeof CloudinaryModule | typeof EventsModule> = [CloudinaryModule, EventsModule];

    if (useDatabase) {
      imports.unshift(
        MongooseModule.forFeature([
          { name: ObjectEntity.name, schema: ObjectSchema },
        ]),
      );
    }

    return {
      module: ObjectsModule,
      imports,
      controllers: [ObjectsController],
      providers: [ObjectsService],
    };
  }
}
