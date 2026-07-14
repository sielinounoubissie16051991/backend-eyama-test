import { Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 } from 'cloudinary';
import * as streamifier from 'streamifier';
import { CLOUDINARY } from './cloudinary.provider';

/**
 * Service Cloudinary pour uploader et supprimer des images.
 *
 * Utilise le provider `CLOUDINARY` pour récupérer le client Cloudinary
 * configuré dans `cloudinary.provider.ts`.
 */
@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private cloudinary: typeof v2) {}

  /**
   * Upload une image vers Cloudinary.
   *
   * @param file - objet attendu avec un `buffer` (Multer file)
   * @returns réponse Cloudinary après upload
   */
  uploadImage(file: any): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      if (!file || !file.buffer) {
        return reject(new Error('Fichier invalide ou buffer manquant'));
      }

      const uploadStream = this.cloudinary.uploader.upload_stream(
        { folder: 'heyama-objects' },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          if (!result) {
            return reject(new Error('Aucune réponse de Cloudinary'));
          }
          resolve(result as UploadApiResponse);
        },
      );

      uploadStream.on('error', (error) => reject(error));

      try {
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Supprime une image Cloudinary par son publicId.
   *
   * @param publicId - identifiant Cloudinary de l'image
   */
  deleteImage(publicId: string): Promise<any> {
    if (!publicId || typeof publicId !== 'string') {
      return Promise.reject(new Error('publicId requis pour la suppression'));
    }

    return this.cloudinary.uploader.destroy(publicId);
  }
}
