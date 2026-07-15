import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ObjectsService } from './objects.service';
import { CreateObjectDto } from './dto/create-object.dto';
import { ObjectResponseDto } from './dto/object-response.dto';

@ApiTags('objects')
@Controller('objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel objet avec image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Données de l’objet avec image',
    required: true,
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        image: { type: 'string', format: 'binary' },
      },
      required: ['title', 'description', 'image'],
    },
  })
  @ApiResponse({ status: 201, description: 'Objet créé avec succès.', type: ObjectResponseDto })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
  create(
    @Body() dto: CreateObjectDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Image requise et doit être envoyée en multipart/form-data.');
    }

    return this.objectsService.create(dto, file);
  }

  @Get()
  findAll() {
    return this.objectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.objectsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.objectsService.remove(id);
  }
}
