import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { requireEnv } from './env';
import { HealthController } from './health.controller';
import { PrismaService } from './prisma.service';
import { AdminProductsController } from './products/admin-products.controller';
import { ProductsController } from './products/products.controller';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: requireEnv('JWT_SECRET'),
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [HealthController, AuthController, ProductsController, AdminProductsController],
  providers: [PrismaService],
})
export class AppModule {}
