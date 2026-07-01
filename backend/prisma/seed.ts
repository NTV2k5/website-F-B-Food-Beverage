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
      loyaltyPoints: 500,
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
      where: { slug: 'ca-phe' },
      update: {},
      create: {
        name: 'Cà phê',
        slug: 'ca-phe',
        description: 'Cà phê nguyên chất đậm vị truyền thống',
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'combo' },
      update: {},
      create: {
        name: 'Combo tiết kiệm',
        slug: 'combo',
        description: 'Combo món ngon giá cực ưu đãi',
        sortOrder: 5,
      },
    }),
  ]);

  const traSua = categories[0];
  const nuocEp = categories[1];
  const snack = categories[2];
  const caPhe = categories[3];
  const combo = categories[4];

  // 4. Create products
  console.log('  Creating products...');

  // Option templates helper
  const drinkOptions = [
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
  ];

  const snackOptions = [
    {
      name: 'Hương vị',
      required: true,
      minSelect: 1,
      maxSelect: 1,
      sortOrder: 1,
      options: {
        create: [
          { name: 'Truyền thống', extraPrice: 0, sortOrder: 1 },
          { name: 'Cay nồng', extraPrice: 0, sortOrder: 2 },
          { name: 'Xốt phô mai', extraPrice: 3000, sortOrder: 3 },
        ],
      },
    },
  ];

  // Base list of 26 items (Original 6 + 20 New items)
  const menuItems = [
    // === Category: Trà sữa (traSua) ===
    {
      name: 'Trà sữa trân châu đường đen',
      slug: 'tra-sua-tran-chau-duong-den',
      description: 'Trà sữa thơm béo kết hợp trân châu đường đen dai mềm, best seller mọi thời đại.',
      basePrice: 35000,
      image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600',
      categoryId: traSua.id,
      isFeatured: true,
      sortOrder: 1,
      isDrink: true,
    },
    {
      name: 'Trà sữa Matcha Uji',
      slug: 'tra-sua-matcha',
      description: 'Matcha Nhật Bản thơm ngon đặc trưng, vị thanh nhẹ kết hợp kem sữa béo ngậy.',
      basePrice: 40000,
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600',
      categoryId: traSua.id,
      isFeatured: true,
      sortOrder: 2,
      isDrink: true,
    },
    {
      name: 'Trà sữa Thái Xanh',
      slug: 'tra-sua-thai-xanh',
      description: 'Hương trà Thái đặc trưng thanh mát kết hợp trân châu thạch dừa giòn sần sật.',
      basePrice: 32000,
      image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600',
      categoryId: traSua.id,
      isFeatured: true,
      sortOrder: 3,
      isDrink: true,
    },
    {
      name: 'Trà sữa Khoai Môn hoàng kim',
      slug: 'tra-sua-khoai-mon',
      description: 'Vị bùi béo tự nhiên của khoai môn tím và trân châu hoàng kim dai giòn.',
      basePrice: 38000,
      image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600',
      categoryId: traSua.id,
      isFeatured: false,
      sortOrder: 4,
      isDrink: true,
    },
    {
      name: 'Hồng trà kem cheese đặc biệt',
      slug: 'hong-tra-kem-cheese',
      description: 'Cốt hồng trà đậm đà kết hợp với lớp kem sữa phô mai mặn béo ngậy.',
      basePrice: 36000,
      image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600',
      categoryId: traSua.id,
      isFeatured: true,
      sortOrder: 5,
      isDrink: true,
    },
    {
      name: 'Trà sữa Oreo kem cheese',
      slug: 'tra-sua-oreo-kem-cheese',
      description: 'Trà sữa truyền thống, kem cheese phô mai phủ thêm vụn bánh quy Oreo giòn giòn.',
      basePrice: 42000,
      image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600',
      categoryId: traSua.id,
      isFeatured: false,
      sortOrder: 6,
      isDrink: true,
    },
    {
      name: 'Trà Oolong vải hoa hồng',
      slug: 'tra-oolong-vai',
      description: 'Hương oolong hảo hạng kết hợp nước ép vải ngọt ngào và cánh hoa hồng khô quý phái.',
      basePrice: 39000,
      image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600',
      categoryId: traSua.id,
      isFeatured: false,
      sortOrder: 7,
      isDrink: true,
    },

    // === Category: Nước ép (nuocEp) ===
    {
      name: 'Nước ép Dâu Tây Đà Lạt',
      slug: 'nuoc-ep-dau-tay',
      description: 'Nước ép dâu tây Đà Lạt chín mọng, thanh ngọt tự nhiên, cung cấp lượng lớn vitamin C.',
      basePrice: 45000,
      image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600',
      categoryId: nuocEp.id,
      isFeatured: false,
      sortOrder: 8,
      isDrink: true,
    },
    {
      name: 'Nước ép cam nguyên chất',
      slug: 'nuoc-ep-cam',
      description: 'Nước ép cam sành tươi nguyên chất vắt tay giàu dưỡng chất tăng đề kháng.',
      basePrice: 35000,
      image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600',
      categoryId: nuocEp.id,
      isFeatured: true,
      sortOrder: 9,
      isDrink: true,
    },
    {
      name: 'Nước ép thơm nhiệt đới',
      slug: 'nuoc-ep-thom',
      description: 'Thơm mật tươi ép lạnh giữ nguyên vị ngọt chua đặc trưng mát lạnh giải nhiệt.',
      basePrice: 32000,
      image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600',
      categoryId: nuocEp.id,
      isFeatured: false,
      sortOrder: 10,
      isDrink: true,
    },
    {
      name: 'Sinh tố bơ sáp Đắk Lắk',
      slug: 'sinh-to-bo',
      description: 'Bơ sáp chín cây xay nhuyễn mịn cùng sữa đặc thơm béo ngậy thơm ngon.',
      basePrice: 48000,
      image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600',
      categoryId: nuocEp.id,
      isFeatured: true,
      sortOrder: 11,
      isDrink: true,
    },
    {
      name: 'Sinh tố xoài cát lọt lòng',
      slug: 'sinh-to-xoai',
      description: 'Xoài cát hòa quyện đá xay thơm lừng, ngọt dịu sảng khoái ngày hè.',
      basePrice: 42000,
      image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600',
      categoryId: nuocEp.id,
      isFeatured: false,
      sortOrder: 12,
      isDrink: true,
    },
    {
      name: 'Trà đào cam sả hoàng gia',
      slug: 'tra-dao-cam-sa',
      description: 'Sự kết hợp hoàn hảo giữa trà đào đen đậm đà, cam tươi mọng nước và hương sả thơm nồng.',
      basePrice: 38000,
      image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?w=600',
      categoryId: nuocEp.id,
      isFeatured: true,
      sortOrder: 13,
      isDrink: true,
    },

    // === Category: Snack & Đồ ăn vặt (snack) ===
    {
      name: 'Khoai tây chiên phô mai',
      slug: 'khoai-tay-chien',
      description: 'Khoai tây chiên giòn tan lắc kèm bột phô mai cam mặn ngọt béo ngậy.',
      basePrice: 25000,
      image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600',
      categoryId: snack.id,
      isFeatured: true,
      sortOrder: 14,
      isDrink: false,
    },
    {
      name: 'Xiên que tổng hợp 5 loại',
      slug: 'xien-que-tong-hop',
      description: 'Gồm cá viên, bò viên, tôm viên, xúc xích và đậu hũ phô mai chiên nóng hổi.',
      basePrice: 30000,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
      categoryId: snack.id,
      isFeatured: false,
      sortOrder: 15,
      isDrink: false,
    },
    {
      name: 'Nem chua rán Hà Nội giòn',
      slug: 'nem-chua-ran',
      description: 'Nem chua rán bọc bột chiên xù giòn bên ngoài, bên trong dẻo dai nóng hổi chuẩn vị.',
      basePrice: 32000,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
      categoryId: snack.id,
      isFeatured: true,
      sortOrder: 16,
      isDrink: false,
    },
    {
      name: 'Phô mai que kéo sợi hảo hạng',
      slug: 'pho-mai-que',
      description: 'Lớp vỏ chiên xù giòn tan bọc khối phô mai mozzarella kéo sợi dài béo ngậy chấm tương cà.',
      basePrice: 28000,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
      categoryId: snack.id,
      isFeatured: true,
      sortOrder: 17,
      isDrink: false,
    },
    {
      name: 'Bánh tráng trộn đặc biệt Sài Gòn',
      slug: 'banh-trang-tron',
      description: 'Bánh tráng sợi trộn khô bò, khô mực, trứng cút, hành phi, xoài xanh bào và muối Tây Ninh.',
      basePrice: 22000,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
      categoryId: snack.id,
      isFeatured: true,
      sortOrder: 18,
      isDrink: false,
    },
    {
      name: 'Da heo chiên lắc phô mai tỏi ớt',
      slug: 'da-heo-lac-pho-mai',
      description: 'Da heo sấy phồng chiên giòn rụm lắc bột phô mai mặn ngọt pha chút vị cay nhẹ tỏi ớt.',
      basePrice: 24000,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
      categoryId: snack.id,
      isFeatured: false,
      sortOrder: 19,
      isDrink: false,
    },
    {
      name: 'Cá viên chiên nước mắm tỏi phi',
      slug: 'ca-vien-chien-nuoc-mam',
      description: 'Cá viên chiên sốt nước mắm keo mặn ngọt tỏi ớt xào rau muống kèm hành phi thơm phức.',
      basePrice: 35000,
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600',
      categoryId: snack.id,
      isFeatured: false,
      sortOrder: 20,
      isDrink: false,
    },

    // === Category: Cà phê (caPhe) ===
    {
      name: 'Bạc Xỉu đá cốt dừa',
      slug: 'bac-xiu-da',
      description: 'Cà phê nguyên chất pha sữa đặc và một chút nước cốt dừa béo dịu thơm lừng.',
      basePrice: 29000,
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
      categoryId: caPhe.id,
      isFeatured: true,
      sortOrder: 21,
      isDrink: true,
    },
    {
      name: 'Cà phê Muối xứ Huế',
      slug: 'ca-phe-muoi',
      description: 'Sự kết hợp giữa vị đắng cà phê espresso truyền thống và lớp kem sữa muối mặn mòi ngọt béo.',
      basePrice: 32000,
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
      categoryId: caPhe.id,
      isFeatured: true,
      sortOrder: 22,
      isDrink: true,
    },
    {
      name: 'Cà phê đen đá robusta',
      slug: 'ca-phe-den-da',
      description: 'Cà phê Robusta Đắk Lắk nguyên chất pha phin đậm đặc đánh thức mọi giác quan.',
      basePrice: 22000,
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
      categoryId: caPhe.id,
      isFeatured: false,
      sortOrder: 23,
      isDrink: true,
    },
    {
      name: 'Cà phê cốt dừa đá xay',
      slug: 'ca-phe-cot-dua',
      description: 'Cốt dừa sữa tươi xay đá mịn sánh đổ trực tiếp lên shot cà phê đậm đặc.',
      basePrice: 38000,
      image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600',
      categoryId: caPhe.id,
      isFeatured: false,
      sortOrder: 24,
      isDrink: true,
    },

    // === Category: Combo tiết kiệm (combo) ===
    {
      name: 'Combo Trà Sữa & Khoai Tây Chiên',
      slug: 'combo-tra-sua-an-vat',
      description: 'Gồm 1 Trà sữa trân châu đường đen size M và 1 phần Khoai tây chiên phô mai. Tiết kiệm hơn 15%.',
      basePrice: 50000,
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600',
      categoryId: combo.id,
      isFeatured: true,
      sortOrder: 25,
      isDrink: false,
    },
    {
      name: 'Combo Bạc Xỉu & Nem Chua Rán',
      slug: 'combo-cafe-an-vat',
      description: 'Bộ đôi tuyệt hảo cho ngày dài làm việc: 1 cốc Bạc Xỉu đá cùng 1 đĩa Nem chua rán giòn rụm.',
      basePrice: 55000,
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600',
      categoryId: combo.id,
      isFeatured: true,
      sortOrder: 26,
      isDrink: false,
    },
  ];

  // Insert products with their option configuration templates
  for (const item of menuItems) {
    const { isDrink, ...prodData } = item;
    
    // Check if product already exists
    const existing = await prisma.product.findUnique({
      where: { slug: prodData.slug },
    });

    if (existing) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: prodData.name,
          description: prodData.description,
          basePrice: prodData.basePrice,
          image: prodData.image,
          categoryId: prodData.categoryId,
          isFeatured: prodData.isFeatured,
          sortOrder: prodData.sortOrder,
        },
      });
      console.log(`    Updated product: ${prodData.name}`);
    } else {
      const optionGroupsToCreate = isDrink ? drinkOptions : snackOptions;
      await prisma.product.create({
        data: {
          ...prodData,
          optionGroups: {
            create: optionGroupsToCreate.map((group) => ({
              name: group.name,
              required: group.required,
              minSelect: group.minSelect,
              maxSelect: group.maxSelect,
              sortOrder: group.sortOrder,
              options: {
                create: group.options.create,
              },
            })),
          },
        },
      });
      console.log(`    Created product: ${prodData.name}`);
    }
  }

  // 5. Create banners
  console.log('  Creating banners...');
  await prisma.banner.deleteMany({});
  await prisma.banner.createMany({
    data: [
      {
        title: 'Giảm 20% đơn đầu tiên với code GIAM20',
        image: 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=1200',
        link: '/menu',
        sortOrder: 1,
      },
      {
        title: 'Combo trà sữa & ăn vặt chỉ 50K',
        image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200',
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
