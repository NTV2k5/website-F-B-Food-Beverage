import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
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
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto) {
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
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
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

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBestsellers(limit = 8) {
    const grouped = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const productIds = grouped.map((g) => g.productId);

    if (productIds.length === 0) {
      return this.prisma.product.findMany({
        where: { isFeatured: true, isAvailable: true },
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
        },
      });
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds }, isAvailable: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return productIds
      .map((id) => products.find((p) => p.id === id))
      .filter(Boolean);
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
    const { optionGroups, ...productData } = dto;

    return this.prisma.product.create({
      data: {
        ...productData,
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
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: productInclude,
    });
  }

  async toggleAvailability(id: string, isAvailable: boolean) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { isAvailable },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
