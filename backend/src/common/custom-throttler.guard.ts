import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async throwThrottlingException(context: any, throttlerLimitDetail: any): Promise<void> {
    const ttl = throttlerLimitDetail?.ttl || 60000;
    const minutes = Math.ceil(ttl / 60000);
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: `Too many requests. Please try again after ${minutes} minute${minutes > 1 ? 's' : ''}.`,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
