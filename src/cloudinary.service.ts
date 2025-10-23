/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/no-floating-promises */
import fs from 'fs';
import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // Upload a multer file. Supports memory (file.buffer), disk (file.path) or stream.
  async uploadBuffer(
    file: Express.Multer.File,
  ): Promise<
    (UploadApiResponse & { downloadUrl?: string }) | UploadApiErrorResponse
  > {
    const resource_type = file.mimetype?.startsWith('image/') ? 'image' : 'raw';
    const publicId = `${Date.now()}-${(file.originalname ?? 'file').replace(/\s+/g, '_')}`;

    return new Promise((resolve, reject) => {
      const cb = (error: any, result: any) => {
        if (error) return reject(error);
        if (!result)
          return reject(new Error('Cloudinary upload returned no result'));

        // Prefer result.secure_url if available (works for most cases)
        const secureUrl = result.secure_url as string | undefined;

        // For raw files, build a download URL. If your Cloudinary account requires signed downloads,
        // set env CLOUDINARY_SIGNED_DOWNLOADS=true to use private_download_url.
        if (result.resource_type === 'raw') {
          let downloadUrl: string;
          const useSigned = process.env.CLOUDINARY_SIGNED_DOWNLOADS === 'true';
          if (useSigned) {
            // signed private download URL requires a `format` second argument (file extension)
            const format = (file.originalname?.split('.').pop() ?? '');
            downloadUrl = cloudinary.utils.private_download_url(
              result.public_id,
              format,
              {
                resource_type: 'raw',
                attachment: true, // boolean per typings
              },
            );
          } else {
            // unsigned/raw URL (may lead to Cloudinary preview page)
            downloadUrl = cloudinary.url(result.public_id, {
              resource_type: 'raw',
              secure: true,
              attachment: true, // use boolean to satisfy types
            });
          }
          resolve({ ...result, secure_url: secureUrl, downloadUrl });
        } else {
          resolve({ ...result, secure_url: secureUrl });
        }
      };

      // memory buffer
      if (file.buffer && Buffer.isBuffer(file.buffer) && file.buffer.length) {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'infosync', resource_type, public_id: publicId },
          cb,
        );
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
        return;
      }

      // disk path
      const anyFile = file as any;
      if (anyFile.path && fs.existsSync(anyFile.path)) {
        cloudinary.uploader.upload(
          anyFile.path,
          { folder: 'infosync', resource_type, public_id: publicId },
          cb,
        );
        return;
      }

      // stream
      if (anyFile.stream && typeof anyFile.stream.pipe === 'function') {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'infosync', resource_type, public_id: publicId },
          cb,
        );
        anyFile.stream.pipe(uploadStream);
        return;
      }

      reject(
        new Error(
          'File has no buffer, path or stream. Configure multer to use memoryStorage or provide file.path.',
        ),
      );
    });
  }

  async uploadImage(
    filePath: string,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return cloudinary.uploader.upload(filePath, {
      folder: 'infosync',
      resource_type: 'image',
    });
  }
}
