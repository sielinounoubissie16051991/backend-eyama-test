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
  @ApiOperation({ summary: 'Récupérer la liste de tous les objets' })
  @ApiResponse({
    status: 200,
    description: 'Liste des objets récupérée avec succès.',
    type: ObjectResponseDto,
    isArray: true,
  })
  findAll() {
    return this.objectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer les détails d’un objet par son id' })
  @ApiResponse({
    status: 200,
    description: 'Objet trouvé avec succès.',
    type: ObjectResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Objet non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.objectsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un objet par son id' })
  @ApiResponse({ status: 200, description: 'Objet supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Objet non trouvé.' })
  remove(@Param('id') id: string) {
    return this.objectsService.remove(id);
  }
}
