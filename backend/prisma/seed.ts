import { PrismaClient, Role, CouponType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create default users
  console.log('  Creating default users...');
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('123456', salt);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fb.com' },
    update: { passwordHash },
    create: {
      email: 'admin@fb.com',
      phone: '0987654321',
      fullName: 'Quản trị viên F&B',
      passwordHash,
      role: Role.ADMIN,
      loyaltyTier: 'GOLD',
    },
  });

  const shipper = await prisma.user.upsert({
    where: { email: 'shipper@fb.com' },
    update: { passwordHash },
    create: {
      email: 'shipper@fb.com',
      phone: '0912345678',
      fullName: 'Shipper Nguyễn Văn A',
      passwordHash,
      role: Role.SHIPPER,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@fb.com' },
    update: { passwordHash },
    create: {
      email: 'customer@fb.com',
      phone: '0901234567',
      fullName: 'Khách hàng Trần Thị B',
      passwordHash,
      role: Role.CUSTOMER,
      loyaltyPoints: 120,
      loyaltyTier: 'SILVER',
    },
  });

  console.log(`    Admin created: ${admin.email}`);
  console.log(`    Shipper created: ${shipper.email}`);
  console.log(`    Customer created: ${customer.email}`);

  // 2. Create coupons
  console.log('  Creating coupons...');
  const coupons = [
    {
      code: 'GIAM20',
      type: CouponType.PERCENT,
      value: 20,
      minOrderAmount: 40000,
      maxUsage: 100,
      isActive: true,
    },
    {
      code: 'GIAM50K',
      type: CouponType.FIXED,
      value: 50000,
      minOrderAmount: 150000,
      maxUsage: 50,
      isActive: true,
    },
    {
      code: 'FBFREE',
      type: CouponType.FIXED,
      value: 15000,
      minOrderAmount: 30000,
      maxUsage: 200,
      isActive: true,
    },
  ];

  for (const cp of coupons) {
    await prisma.coupon.upsert({
      where: { code: cp.code },
      update: cp,
      create: cp,
    });
  }

  // 3. Create categories
  console.log('  Creating categories...');
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'tra-sua' },
      update: {},
      create: {
        name: 'Trà sữa',
        slug: 'tra-sua',
        description: 'Trà sữa đa dạng topping béo ngậy',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'nuoc-ep' },
      update: {},
      create: {
        name: 'Nước ép',
        slug: 'nuoc-ep',
        description: 'Nước ép trái cây tươi mát thanh lọc cơ thể',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'snack' },
      update: {},
      create: {
        name: 'Snack & Đồ ăn vặt',
        slug: 'snack',
        description: 'Đồ ăn vặt khoai tây, xiên que thơm ngon',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'combo' },
      update: {},
      create: {
        name: 'Combo tiết kiệm',
        slug: 'combo',
        description: 'Combo món ngon giá cực ưu đãi',
        sortOrder: 4,
      },
    }),
  ]);

  const traSua = categories[0];
  const nuocEp = categories[1];
  const snack = categories[2];
  const combo = categories[3];

  // 4. Create products
  console.log('  Creating products...');

  // Product 1: Trà sữa trân châu đường đen
  await prisma.product.upsert({
    where: { slug: 'tra-sua-tran-chau-duong-den' },
    update: {},
    create: {
      name: 'Trà sữa trân châu đường đen',
      slug: 'tra-sua-tran-chau-duong-den',
      description: 'Trà sữa thơm béo kết hợp trân châu đường đen dai mềm, best seller mọi thời đại.',
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
            name: 'Mức đường',
            required: true,
            minSelect: 1,
            maxSelect: 1,
            sortOrder: 2,
            options: {
              create: [
                { name: '100% Đường', extraPrice: 0, sortOrder: 1 },
                { name: '70% Đường', extraPrice: 0, sortOrder: 2 },
                { name: '50% Đường', extraPrice: 0, sortOrder: 3 },
                { name: '30% Đường', extraPrice: 0, sortOrder: 4 },
              ],
            },
          },
          {
            name: 'Mức đá',
            required: true,
            minSelect: 1,
            maxSelect: 1,
            sortOrder: 3,
            options: {
              create: [
                { name: '100% Đá', extraPrice: 0, sortOrder: 1 },
                { name: '50% Đá', extraPrice: 0, sortOrder: 2 },
                { name: 'Không Đá', extraPrice: 0, sortOrder: 3 },
              ],
            },
          },
          {
            name: 'Topping',
            required: false,
            minSelect: 0,
            maxSelect: 3,
            sortOrder: 4,
            options: {
              create: [
                { name: 'Trân châu đen', extraPrice: 5000, sortOrder: 1 },
                { name: 'Thạch dừa', extraPrice: 5000, sortOrder: 2 },
                { name: 'Pudding trứng', extraPrice: 8000, sortOrder: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Product 2: Trà sữa Matcha
  await prisma.product.upsert({
    where: { slug: 'tra-sua-matcha' },
    update: {},
    create: {
      name: 'Trà sữa Matcha Uji',
      slug: 'tra-sua-matcha',
      description: 'Matcha Nhật Bản thơm ngon đặc trưng, vị thanh nhẹ nhàng kết hợp sữa tươi nguyên kem.',
      basePrice: 40000,
      image: 'https://images.unsplash.com/photo-1515823064-d8953d0312f6?w=600',
      categoryId: traSua.id,
      isFeatured: true,
      sortOrder: 2,
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
                { name: 'Size L', extraPrice: 6000, sortOrder: 2 },
              ],
            },
          },
          {
            name: 'Topping',
            required: false,
            minSelect: 0,
            maxSelect: 2,
            sortOrder: 2,
            options: {
              create: [
                { name: 'Thạch Matcha', extraPrice: 6000, sortOrder: 1 },
                { name: 'Kem Cheese', extraPrice: 10000, sortOrder: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  // Product 3: Nước ép dâu tây
  await prisma.product.upsert({
    where: { slug: 'nuoc-ep-dau-tay' },
    update: {},
    create: {
      name: 'Nước ép Dâu Tây nguyên chất',
      slug: 'nuoc-ep-dau-tay',
      description: 'Nước ép dâu tây Đà Lạt chín mọng, cung cấp lượng lớn vitamin C.',
      basePrice: 45000,
      image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=600',
      categoryId: nuocEp.id,
      sortOrder: 1,
      optionGroups: {
        create: [
          {
            name: 'Mức ngọt',
            required: true,
            minSelect: 1,
            maxSelect: 1,
            sortOrder: 1,
            options: {
              create: [
                { name: 'Ngọt vừa', extraPrice: 0, sortOrder: 1 },
                { name: 'Ít đường', extraPrice: 0, sortOrder: 2 },
                { name: 'Không đường', extraPrice: 0, sortOrder: 3 },
              ],
            },
          },
        ],
      },
    },
  });

  // Product 4: Khoai tây chiên
  await prisma.product.upsert({
    where: { slug: 'khoai-tay-chien' },
    update: {},
    create: {
      name: 'Khoai tây chiên phô mai',
      slug: 'khoai-tay-chien',
      description: 'Khoai tây chiên giòn tan lắc kèm bột phô mai cam mặn ngọt béo ngậy.',
      basePrice: 25000,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600',
      categoryId: snack.id,
      isFeatured: true,
      sortOrder: 1,
    },
  });

  // Product 5: Xiên que
  await prisma.product.upsert({
    where: { slug: 'xien-que-tong-hop' },
    update: {},
    create: {
      name: 'Xiên que tổng hợp 5 loại',
      slug: 'xien-que-tong-hop',
      description: 'Gồm cá viên, bò viên, tôm viên, xúc xích và đậu hũ phô mai chiên nóng hổi.',
      basePrice: 30000,
      image: 'https://images.unsplash.com/photo-1585238342024-78d3877844da?w=600',
      categoryId: snack.id,
      sortOrder: 2,
    },
  });

  // Product 6: Combo Trà sữa & Khoai tây
  await prisma.product.upsert({
    where: { slug: 'combo-tra-sua-an-vat' },
    update: {},
    create: {
      name: 'Combo Trà Sữa & Khoai Tây Chiên',
      slug: 'combo-tra-sua-an-vat',
      description: 'Gồm 1 Trà sữa trân châu đường đen size M và 1 phần Khoai tây chiên phô mai. Tiết kiệm hơn 15%.',
      basePrice: 50000,
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600',
      categoryId: combo.id,
      isFeatured: true,
      sortOrder: 1,
    },
  });

  // 5. Create banners
  console.log('  Creating banners...');
  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
      {
        title: 'Giảm 20% đơn đầu tiên với code GIAM20',
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200',
        link: '/menu',
        sortOrder: 1,
      },
      {
        title: 'Combo trà sữa & ăn vặt chỉ 50K',
        image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=1200',
        link: '/menu?category=combo',
        sortOrder: 2,
      },
    ],
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
