import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { parseCategory } from './product-input';

@Controller('products')
export class ProductsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list(@Query('category') category?: string) {
    return this.prisma.product.findMany({
      where: { published: true, category: parseCategory(category) },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const product = await this.prisma.product.findFirst({ where: { slug, published: true } });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }
}
