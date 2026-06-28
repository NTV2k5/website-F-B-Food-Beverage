import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  CreateProductDto,
  ProductQueryDto,
  UpdateProductDto,
} from './dto/product.dto';

const productInclude = {
  category: {
    select: { id: true, name: true, slug: true },
  },
  optionGroups: {
    orderBy: { sortOrder: 'asc' as const },
    include: {
      options: {
        orderBy: { sortOrder: 'asc' as const },
      },
    },
  },
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async clearCache() {
    try {
      // In NestJS Cache-Manager v5+, 'clear' replaces 'reset' for cache flush
      await this.cacheManager.clear();
      console.log('⚡ Products Cache Cleared');
    } catch (err) {
      console.error('Failed to clear cache:', err);
    }
  }

  async findAll(query: ProductQueryDto) {
    const cacheKey = `products:all:${JSON.stringify(query)}`;
    try {
      const cached = await this.cacheManager.get<any>(cacheKey);
      if (cached) {
        return cached;
      }
    } catch (err) {
      console.error('Cache read error:', err);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      isAvailable: true,
    };

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    } else if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.featured) {
      where.isFeatured = true;
    }

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePrice = {};
      if (query.minPrice !== undefined) {
        where.basePrice.gte = query.minPrice;
      }
      if (query.maxPrice !== undefined) {
        where.basePrice.lte = query.maxPrice;
      }
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = {
      sortOrder: 'asc',
    };

    switch (query.sort) {
      case 'price_asc':
        orderBy = { basePrice: 'asc' };
        break;
      case 'price_desc':
        orderBy = { basePrice: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        break;
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    // Map images stringified JSON back to array if needed on client,
    // but the DB has it as TEXT. Let's return it directly.
    const result = {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };

    try {
      await this.cacheManager.set(cacheKey, result, 60000);
    } catch (err) {
      console.error('Cache write error:', err);
    }

    return result;
  }

  async findBestsellers(limit = 8) {
    const cacheKey = `products:bestsellers:${limit}`;
    try {
      const cached = await this.cacheManager.get<any>(cacheKey);
      if (cached) return cached;
    } catch (err) {}

    const grouped = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const productIds = grouped.map((g) => g.productId);
    let result: any[];

    if (productIds.length === 0) {
      result = await this.prisma.product.findMany({
        where: { isFeatured: true, isAvailable: true },
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      });
    } else {
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds }, isAvailable: true },
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      });

      result = productIds
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean);
    }

    try {
      await this.cacheManager.set(cacheKey, result, 60000);
    } catch (err) {}

    return result;
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }

    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: productInclude,
    });

    if (!product) {
      throw new NotFoundException(`Product "${slug}" not found`);
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const { optionGroups, images, ...productData } = dto;

    const newProduct = await this.prisma.product.create({
      data: {
        ...productData,
        images: images ? JSON.stringify(images) : '[]',
        optionGroups: optionGroups?.length
          ? {
              create: optionGroups.map((group) => ({
                name: group.name,
                required: group.required ?? true,
                minSelect: group.minSelect ?? 1,
                maxSelect: group.maxSelect ?? 1,
                sortOrder: group.sortOrder ?? 0,
                options: group.options?.length
                  ? {
                      create: group.options.map((opt) => ({
                        name: opt.name,
                        extraPrice: opt.extraPrice ?? 0,
                        isAvailable: opt.isAvailable ?? true,
                        sortOrder: opt.sortOrder ?? 0,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: productInclude,
    });

    await this.clearCache();
    return newProduct;
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    const { images, ...productData } = dto;

    const data: any = { ...productData };
    if (images) {
      data.images = JSON.stringify(images);
    }

    const updated = await this.prisma.product.update({
      where: { id },
      data,
      include: productInclude,
    });

    await this.clearCache();
    return updated;
  }

  async toggleAvailability(id: string, isAvailable: boolean) {
    await this.findOne(id);
    const updated = await this.prisma.product.update({
      where: { id },
      data: { isAvailable },
    });

    await this.clearCache();
    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    const deleted = await this.prisma.product.delete({ where: { id } });
    await this.clearCache();
    return deleted;
  }
}
