import {
  BadRequestException,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CloudinaryService } from './cloudinary.service';

@ApiTags('cloudinary')
@Controller('cloudinary')
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  /**
   * Endpoint de test d'upload Cloudinary.
   * Attends un fichier en multipart/form-data sous le champ `file`.
   */
  
  @Post('upload')
  @ApiOperation({ summary: "Uploader une image sur Cloudinary" })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fichier à uploader',
    required: true,
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Image uploadée avec succès.' })
  @ApiResponse({ status: 400, description: 'Fichier manquant ou invalide.' })
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: any) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Le fichier est requis pour l\'upload');
    }

    const result = await this.cloudinaryService.uploadImage(file);
    return {
      success: true,
      publicId: result.public_id,
      secureUrl: result.secure_url,
    };
  }

  /**
   * Endpoint de suppression Cloudinary pour tester `deleteImage`.
   */
  @Delete(':publicId')
  @ApiOperation({ summary: 'Supprimer une image Cloudinary par publicId' })
  @ApiResponse({ status: 200, description: 'Image supprimée.' })
  @ApiResponse({ status: 400, description: 'publicId requis.' })
  async remove(@Param('publicId') publicId: string) {
    if (!publicId) {
      throw new BadRequestException('Le publicId est requis');
    }

    const result = await this.cloudinaryService.deleteImage(publicId);
    return {
      success: result.result === 'ok',
      result,
    };
  }
}