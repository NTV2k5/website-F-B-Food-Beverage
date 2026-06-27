import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      service: 'fb-shop-api',
      timestamp: new Date().toISOString(),
    };
  }
}
