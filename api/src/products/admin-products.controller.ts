import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma.service';
import { parseProductInput, slugify } from './product-input';
import { MAX_IMAGE_BYTES, removeImage, saveImage, type UploadedImage } from './uploads';

@Controller('admin/products')
@UseGuards(AuthGuard)
export class AdminProductsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.product.findMany({ orderBy: { updatedAt: 'desc' } });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.findOrFail(id);
  }

  @Post()
  async create(@Body() body: unknown) {
    const data = parseProductInput(body, false);
    return this.withUniqueName(() =>
      this.prisma.product.create({ data: { ...data, slug: slugify(data.name) } }),
    );
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    await this.findOrFail(id);
    const data = parseProductInput(body, true);
    return this.withUniqueName(() =>
      this.prisma.product.update({
        where: { id },
        data: data.name ? { ...data, slug: slugify(data.name) } : data,
      }),
    );
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const product = await this.findOrFail(id);
    await this.prisma.product.delete({ where: { id } });
    await removeImage(product.image);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('image', { limits: { fileSize: MAX_IMAGE_BYTES } }))
  async uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: UploadedImage | undefined,
  ) {
    const product = await this.findOrFail(id);
    const image = await saveImage(file);
    const updated = await this.prisma.product.update({ where: { id }, data: { image } });
    await removeImage(product.image);
    return updated;
  }

  private async findOrFail(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`No existe el producto ${id}`);
    }
    return product;
  }

  private async withUniqueName<T>(operation: () => Promise<T>): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Ya existe un producto con ese nombre');
      }
      throw error;
    }
  }
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002';
}
