import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff', 'image/svg+xml'];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Injectable()
export class UploadService {
  constructor(private supabase: SupabaseService) {}

  async uploadPaymentScreenshot(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only PNG, JPG, and JPEG are allowed');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File too large. Maximum size is 5MB');
    }

    const sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${Date.now()}-${sanitizedFileName}`;

    const { data: uploadData, error: uploadError } = await this.supabase
      .storage()
      .from('payment-screenshots')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadError) throw new InternalServerErrorException(uploadError.message);

    const { data: { publicUrl } } = this.supabase
      .storage()
      .from('payment-screenshots')
      .getPublicUrl(fileName);

    return { url: publicUrl, fileName };
  }
}
