import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'tra-sua' },
      update: {},
      create: {
        name: 'Trà sữa',
        slug: 'tra-sua',
        description: 'Trà sữa đa dạng topping',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'nuoc-ep' },
      update: {},
      create: {
        name: 'Nước ép',
        slug: 'nuoc-ep',
        description: 'Nước ép trái cây tươi',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'snack' },
      update: {},
      create: {
        name: 'Snack',
        slug: 'snack',
        description: 'Đồ ăn vặt hot trend',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'combo' },
      update: {},
      create: {
        name: 'Combo',
        slug: 'combo',
        description: 'Combo tiết kiệm',
        sortOrder: 4,
      },
    }),
  ]);

  const traSua = categories[0];
  const snack = categories[2];

  await prisma.product.upsert({
    where: { slug: 'tra-sua-tran-chau-duong-den' },
    update: {},
    create: {
      name: 'Trà sữa trân châu đường đen',
      slug: 'tra-sua-tran-chau-duong-den',
      description:
        'Trà sữa thơm béo kết hợp trân châu đường đen dai mềm, best seller mọi thời đại.',
      basePrice: 35000,
      image: 'https://images.unsplash.com/photo-1576092768241-dec2318790d1?w=600',
      categoryId: traSua.id,
      isFeatured: true,
      sortOrder: 1,
      optionGroups: {
        create: [
          {
            name: 'Size',
            required: true,
            minSelect: 1,
            maxSelect: 1,
            sortOrder: 1,
            options: {
              create: [
                { name: 'Size M', extraPrice: 0, sortOrder: 1 },
                { name: 'Size L', extraPrice: 5000, sortOrder: 2 },
              ],
            },
          },
          {
            name: 'Mức đá',
            required: true,
            minSelect: 1,
            maxSelect: 1,
            sortOrder: 2,
            options: {
              create: [
                { name: '100% đá', extraPrice: 0, sortOrder: 1 },
                { name: '50% đá', extraPrice: 0, sortOrder: 2 },
                { name: 'Không đá', extraPrice: 0, sortOrder: 3 },
              ],
            },
          },
          {
            name: 'Topping',
            required: false,
            minSelect: 0,
            maxSelect: 3,
            sortOrder: 3,
            options: {
              create: [
                { name: 'Trân châu', extraPrice: 5000, sortOrder: 1 },
                { name: 'Thạch dừa', extraPrice: 5000, sortOrder: 2 },
                { name: 'Pudding', extraPrice: 8000, sortOrder: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.product.upsert({
    where: { slug: 'tra-sua-matcha' },
    update: {},
    create: {
      name: 'Trà sữa Matcha',
      slug: 'tra-sua-matcha',
      description: 'Matcha Nhật Bản thơm béo, vị thanh nhẹ.',
      basePrice: 40000,
      image: 'https://images.unsplash.com/photo-1515823064-d8953d0312f6?w=600',
      categoryId: traSua.id,
      isFeatured: true,
      sortOrder: 2,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'khoai-tay-chien' },
    update: {},
    create: {
      name: 'Khoai tây chiên',
      slug: 'khoai-tay-chien',
      description: 'Khoai tây chiên giòn rụm, ăn kèm sốt phô mai.',
      basePrice: 25000,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600',
      categoryId: snack.id,
      isFeatured: true,
      sortOrder: 1,
    },
  });

  await prisma.product.upsert({
    where: { slug: 'xien-bong' },
    update: {},
    create: {
      name: 'Xiên bông gòn',
      slug: 'xien-bong',
      description: 'Xiên bông gòn nhiều vị, snack hot trend.',
      basePrice: 15000,
      image: 'https://images.unsplash.com/photo-1585238342024-78d3877844da?w=600',
      categoryId: snack.id,
      sortOrder: 2,
    },
  });

  await prisma.banner.createMany({
    data: [
      {
        title: 'Giảm 20% đơn đầu tiên',
        image:
          'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200',
        link: '/menu',
        sortOrder: 1,
      },
      {
        title: 'Combo trà sữa chỉ 49K',
        image:
          'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=1200',
        link: '/menu?category=combo',
        sortOrder: 2,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
