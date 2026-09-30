import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Srijan Multi-Tenant Seed Process...');

  // Hash password
  const passwordHash = await bcrypt.hash('Admin123!', 10);

  // ==========================================
  // BRAND 1: AURA BEAUTY (Luxury Skincare)
  // ==========================================
  console.log('📦 Seeding Tenant 1: Aura Beauty...');

  const tenant1 = await prisma.tenant.upsert({
    where: { slug: 'aura-beauty' },
    update: { owner_email: 'admin@aura-beauty.com', owner_phone: '9876543210' },
    create: {
      id: 'aura-beauty-tenant-uuid-001',
      name: 'Aura Beauty',
      slug: 'aura-beauty',
      plan: 'BUSINESS',
      status: 'ACTIVE',
      owner_email: 'admin@aura-beauty.com',
      owner_phone: '9876543210',
    },
  });


  await prisma.domain.upsert({
    where: { domain: 'aurabeauty.srijanplatform.com' },
    update: {},
    create: {
      tenant_id: tenant1.id,
      domain: 'aurabeauty.srijanplatform.com',
      is_primary: true,
      ssl_status: 'ACTIVE',
    },
  });

  await prisma.tenantTheme.upsert({
    where: { tenant_id: tenant1.id },
    update: {},
    create: {
      tenant_id: tenant1.id,
      brand_name: 'Aura Beauty',
      logo_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=80',
      primary_color: '#7C3AED',   // Violet
      secondary_color: '#EC4899', // Pink
      accent_color: '#10B981',    // Emerald
      background_color: '#0F172A',// Dark Slate
      text_color: '#F8FAFC',
      heading_font: 'Playfair Display',
      body_font: 'Plus Jakarta Sans',
      border_radius: '16px',
      card_style: 'glassmorphism',
      header_style: 'sticky',
    },
  });

  await prisma.user.upsert({
    where: { tenant_id_email: { tenant_id: tenant1.id, email: 'owner@aurabeauty.com' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      name: 'Priya Sharma',
      email: 'owner@aurabeauty.com',
      password_hash: passwordHash,
      role: 'OWNER',
    },
  });

  const catSerums = await prisma.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenant1.id, slug: 'serums' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      name: 'Face Serums',
      slug: 'serums',
      description: 'High-performance botanical & peptide elixirs for radiant glow.',
    },
  });

  const product1 = await prisma.product.upsert({
    where: { tenant_id_slug: { tenant_id: tenant1.id, slug: 'glow-radiance-vitamin-c-serum' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      title: 'Aura Glow Radiance 15% Vitamin C Serum',
      slug: 'glow-radiance-vitamin-c-serum',
      description: 'Clinical grade 15% L-Ascorbic Acid infused with Ferulic Acid and Hyaluronic Acid for instant luminosity, collagen boost, and hyperpigmentation defense.',
      category_id: catSerums.id,
      mrp: 1499,
      price: 1199,
      sku: 'AURA-SER-001',
      ingredients: '15% L-Ascorbic Acid, Ferulic Acid, Hyaluronic Acid, Rosehip Extract',
      benefits: 'Brightens skin, reduces dark spots, boosts skin elasticity',
      usage_instructions: 'Apply 3-4 drops in the morning on cleansed face. Follow up with sunscreen.',
      is_bestseller: true,
      is_new_launch: true,
      seo_title: '15% Vitamin C Serum for Radiant Glow | Aura Beauty',
      seo_description: 'Transform dull skin with Aura 15% Vitamin C Glow Serum.',
    },
  });

  await prisma.productVariant.upsert({
    where: { tenant_id_sku: { tenant_id: tenant1.id, sku: 'AURA-SER-001-30ML' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      product_id: product1.id,
      title: '30ml Dropper Bottle',
      sku: 'AURA-SER-001-30ML',
      price: 1199,
      mrp: 1499,
      inventory_count: 45,
    },
  });

  // Additional Luxury Products for Aura Beauty
  const catMoisturizer = await prisma.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenant1.id, slug: 'moisturizers' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      name: 'Barrier & Moisture',
      slug: 'moisturizers',
      description: 'Ceramides, peptides, and deep moisture lock creams.',
    },
  });

  const catSunscreen = await prisma.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenant1.id, slug: 'sunscreens' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      name: 'Sun Care',
      slug: 'sunscreens',
      description: 'Zero white-cast, lightweight daily UV shields.',
    },
  });

  const productAura2 = await prisma.product.upsert({
    where: { tenant_id_slug: { tenant_id: tenant1.id, slug: 'hydra-barrier-peptide-cream' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      title: 'Hydra-Barrier 5-Ceramide & Peptide Glaze Cream',
      slug: 'hydra-barrier-peptide-cream',
      description: 'Advanced lipid-replenishing barrier balm formulated with 5 essential ceramides, copper peptides, and botanical squalane. Restores damaged moisture barriers in 72 hours.',
      category_id: catMoisturizer.id,
      mrp: 1199,
      price: 899,
      sku: 'AURA-CRM-002',
      ingredients: 'Ceramide NP/AP/EOP, Copper Tripeptide-1, Squalane, Centella Asiatica',
      benefits: '72hr barrier hydration, soothes redness, dewy glass skin finish',
      is_bestseller: true,
      seo_title: 'Hydra-Barrier 5-Ceramide Glaze Cream | Aura Beauty',
    },
  });

  await prisma.productVariant.upsert({
    where: { tenant_id_sku: { tenant_id: tenant1.id, sku: 'AURA-CRM-002-50G' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      product_id: productAura2.id,
      title: '50g Luxury Glass Jar',
      sku: 'AURA-CRM-002-50G',
      price: 899,
      mrp: 1199,
      inventory_count: 50,
    },
  });

  await prisma.productMedia.create({
    data: {
      tenant_id: tenant1.id,
      product_id: productAura2.id,
      url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
      sort_order: 0,
    },
  });

  const productAura3 = await prisma.product.upsert({
    where: { tenant_id_slug: { tenant_id: tenant1.id, slug: 'velvet-touch-spf50-gel-sunscreen' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      title: 'Velvet Petal Invisible Water-Gel Sunscreen SPF 50+ PA++++',
      slug: 'velvet-touch-spf50-gel-sunscreen',
      description: 'Ultra-lightweight invisible water-gel sunscreen with next-gen UV filters. Zero white cast, water-resistant for 80 minutes, enriched with Vitamin E and Cica extract.',
      category_id: catSunscreen.id,
      mrp: 899,
      price: 699,
      sku: 'AURA-SUN-003',
      ingredients: 'Tinosorb M, Uvinul A Plus, Cica Extract, Hyaluronic Acid, Niacinamide',
      benefits: 'Zero white cast, non-sticky matte finish, protects against blue light & UVA/UVB',
      is_bestseller: true,
      seo_title: 'Velvet Petal SPF 50+ Gel Sunscreen | Aura Beauty',
    },
  });

  await prisma.productVariant.upsert({
    where: { tenant_id_sku: { tenant_id: tenant1.id, sku: 'AURA-SUN-003-50ML' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      product_id: productAura3.id,
      title: '50ml Pump Tube',
      sku: 'AURA-SUN-003-50ML',
      price: 699,
      mrp: 899,
      inventory_count: 75,
    },
  });

  await prisma.productMedia.create({
    data: {
      tenant_id: tenant1.id,
      product_id: productAura3.id,
      url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80',
      sort_order: 0,
    },
  });

  const productAura4 = await prisma.product.upsert({
    where: { tenant_id_slug: { tenant_id: tenant1.id, slug: 'moonlit-bakuchiol-night-elixir' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      title: 'Moonlit Botanical 2% Bakuchiol & Squalane Night Elixir',
      slug: 'moonlit-bakuchiol-night-elixir',
      description: 'All-natural plant-based retinol alternative. Clinically proven to diminish fine lines, smooth skin texture, and restore firmness without redness or purging.',
      category_id: catSerums.id,
      mrp: 1599,
      price: 1299,
      sku: 'AURA-ELX-004',
      ingredients: '2% Pure Bakuchiol, Olive Squalane, Marula Oil, Blue Tansy',
      benefits: 'Cellular renewal overnight, fine line softening, non-comedogenic',
      is_bestseller: false,
      seo_title: 'Moonlit 2% Bakuchiol Night Elixir | Aura Beauty',
    },
  });

  await prisma.productVariant.upsert({
    where: { tenant_id_sku: { tenant_id: tenant1.id, sku: 'AURA-ELX-004-30ML' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      product_id: productAura4.id,
      title: '30ml Violet Dropper Bottle',
      sku: 'AURA-ELX-004-30ML',
      price: 1299,
      mrp: 1599,
      inventory_count: 30,
    },
  });

  await prisma.productMedia.create({
    data: {
      tenant_id: tenant1.id,
      product_id: productAura4.id,
      url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=600&auto=format&fit=crop&q=80',
      sort_order: 0,
    },
  });

  await prisma.coupon.upsert({
    where: { tenant_id_code: { tenant_id: tenant1.id, code: 'GLOW20' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      code: 'GLOW20',
      discount_type: 'PERCENTAGE',
      discount_value: 20,
      min_order_value: 999,
      is_active: true,
    },
  });

  // ==========================================
  // BRAND 2: VEDA ORGANICS (Ayurvedic Wellness)
  // ==========================================
  console.log('📦 Seeding Tenant 2: Veda Organics...');

  const tenant2 = await prisma.tenant.upsert({
    where: { slug: 'veda-organics' },
    update: { owner_email: 'admin@veda-organics.com', owner_phone: '9123456789' },
    create: {
      id: 'veda-organics-tenant-uuid-002',
      name: 'Veda Organics',
      slug: 'veda-organics',
      plan: 'PRO',
      status: 'ACTIVE',
      owner_email: 'admin@veda-organics.com',
      owner_phone: '9123456789',
    },
  });


  await prisma.domain.upsert({
    where: { domain: 'vedaorganics.srijanplatform.com' },
    update: {},
    create: {
      tenant_id: tenant2.id,
      domain: 'vedaorganics.srijanplatform.com',
      is_primary: true,
      ssl_status: 'ACTIVE',
    },
  });

  await prisma.tenantTheme.upsert({
    where: { tenant_id: tenant2.id },
    update: {},
    create: {
      tenant_id: tenant2.id,
      brand_name: 'Veda Organics',
      logo_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=200&auto=format&fit=crop&q=80',
      primary_color: '#059669',   // Emerald Green
      secondary_color: '#D97706', // Amber
      accent_color: '#10B981',
      background_color: '#F0FDF4',// Light Mint Green
      text_color: '#064E3B',
      heading_font: 'Cinzel',
      body_font: 'Roboto',
      border_radius: '6px',
      card_style: 'bordered',
      header_style: 'centered',
    },
  });

  await prisma.user.upsert({
    where: { tenant_id_email: { tenant_id: tenant2.id, email: 'admin@vedaorganics.com' } },
    update: {},
    create: {
      tenant_id: tenant2.id,
      name: 'Aarav Mehta',
      email: 'admin@vedaorganics.com',
      password_hash: passwordHash,
      role: 'OWNER',
    },
  });

  const catHair = await prisma.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenant2.id, slug: 'hair-care' } },
    update: {},
    create: {
      tenant_id: tenant2.id,
      name: 'Ayurvedic Hair Oils',
      slug: 'hair-care',
      description: 'Cold-pressed authentic herb-infused oils for hair growth and scalp nourishment.',
    },
  });

  const product2 = await prisma.product.upsert({
    where: { tenant_id_slug: { tenant_id: tenant2.id, slug: 'bhringraj-kesh-oil' } },
    update: {},
    create: {
      tenant_id: tenant2.id,
      title: 'Kesh Sanjivani Bhringraj & Amla Hair Oil',
      slug: 'bhringraj-kesh-oil',
      description: 'Traditional Kshirapak method infused with 21 medicinal herbs including Bhringraj, Amla, Brahmi, and Sesame oil.',
      category_id: catHair.id,
      mrp: 899,
      price: 699,
      sku: 'VEDA-OIL-001',
      ingredients: 'Organic Bhringraj, Virgin Sesame Oil, Amla, Brahmi, Jatamansi',
      benefits: 'Prevents hair fall, stops premature graying, promotes deep sleep',
      is_bestseller: true,
      seo_title: 'Ayurvedic Bhringraj Hair Oil | Veda Organics',
    },
  });

  await prisma.productVariant.upsert({
    where: { tenant_id_sku: { tenant_id: tenant2.id, sku: 'VEDA-OIL-001-200ML' } },
    update: {},
    create: {
      tenant_id: tenant2.id,
      product_id: product2.id,
      title: '200ml Glass Bottle',
      sku: 'VEDA-OIL-001-200ML',
      price: 699,
      mrp: 899,
      inventory_count: 60,
    },
  });

  await prisma.productMedia.createMany({
    data: [
      {
        tenant_id: tenant2.id,
        product_id: product2.id,
        url: 'https://images.unsplash.com/photo-1608248597260-657d64438a64?w=600&auto=format&fit=crop&q=80',
        sort_order: 0,
      },
    ],
  });

  const catFaceVeda = await prisma.category.upsert({
    where: { tenant_id_slug: { tenant_id: tenant2.id, slug: 'ayurvedic-face' } },
    update: {},
    create: {
      tenant_id: tenant2.id,
      name: 'Classical Face Elixirs',
      slug: 'ayurvedic-face',
      description: 'Kumkumadi, 24K Gold Ubtan, and copper-churned herbs.',
    },
  });

  const productVeda2 = await prisma.product.upsert({
    where: { tenant_id_slug: { tenant_id: tenant2.id, slug: 'kumkumadi-saffron-miracle-fluid' } },
    update: {},
    create: {
      tenant_id: tenant2.id,
      title: 'Kumkumadi Tailam Miraculous Saffron Beauty Fluid',
      slug: 'kumkumadi-saffron-miracle-fluid',
      description: 'Authentic Ashtanga Hridaya formulation with Grade-A Kashmiri Mogra Saffron, Blue Lotus, Sandalwood, and Goat milk. Delivers luminous golden radiance and fades age spots.',
      category_id: catFaceVeda.id,
      mrp: 1999,
      price: 1499,
      sku: 'VEDA-TAILAM-002',
      ingredients: 'Kashmiri Saffron, Sandalwood, Indian Madder (Manjistha), Blue Lotus',
      benefits: 'Imparts timeless royal radiance, illuminates dull complexion, anti-aging',
      is_bestseller: true,
      seo_title: 'Pure Kumkumadi Tailam Saffron Fluid | Veda Organics',
    },
  });

  await prisma.productVariant.upsert({
    where: { tenant_id_sku: { tenant_id: tenant2.id, sku: 'VEDA-TAILAM-002-15ML' } },
    update: {},
    create: {
      tenant_id: tenant2.id,
      product_id: productVeda2.id,
      title: '15ml Glass Flacon with Dropper',
      sku: 'VEDA-TAILAM-002-15ML',
      price: 1499,
      mrp: 1999,
      inventory_count: 40,
    },
  });

  await prisma.productMedia.create({
    data: {
      tenant_id: tenant2.id,
      product_id: productVeda2.id,
      url: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=600&auto=format&fit=crop&q=80',
      sort_order: 0,
    },
  });

  const productVeda3 = await prisma.product.upsert({
    where: { tenant_id_slug: { tenant_id: tenant2.id, slug: 'tejaswini-24k-gold-radiance-ubtan' } },
    update: {},
    create: {
      tenant_id: tenant2.id,
      title: 'Tejaswini 24K Gold & Saffron Radiance Ubtan',
      slug: 'tejaswini-24k-gold-radiance-ubtan',
      description: 'Hand-pounded bridal body & face polish infused with real 24-karat gold bhasma, sandalwood, turmeric roots, and wild rose petals.',
      category_id: catFaceVeda.id,
      mrp: 999,
      price: 799,
      sku: 'VEDA-UBTAN-003',
      ingredients: '24K Gold Bhasma, Kasturi Manjal, Pure Chandan, Rose Petal Powder',
      benefits: 'Exfoliates dead cells, unveils bridal glow, reduces tan instantly',
      is_bestseller: true,
      seo_title: '24K Gold Radiance Ubtan Polish | Veda Organics',
    },
  });

  await prisma.productVariant.upsert({
    where: { tenant_id_sku: { tenant_id: tenant2.id, sku: 'VEDA-UBTAN-003-100G' } },
    update: {},
    create: {
      tenant_id: tenant2.id,
      product_id: productVeda3.id,
      title: '100g Artisan Brass Jar',
      sku: 'VEDA-UBTAN-003-100G',
      price: 799,
      mrp: 999,
      inventory_count: 55,
    },
  });

  await prisma.productMedia.create({
    data: {
      tenant_id: tenant2.id,
      product_id: productVeda3.id,
      url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
      sort_order: 0,
    },
  });

  // ── SEED CUSTOMERS & SAMPLE ORDERS FOR LIVE TESTING ─────────────────────
  const cust1 = await prisma.customer.upsert({
    where: { tenant_id_phone: { tenant_id: tenant1.id, phone: '9876543210' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      name: 'Aarav Sharma',
      email: 'aarav@example.com',
      phone: '9876543210',
      total_orders: 2,
      total_spent: 1898,
    },
  });

  await prisma.customerAddress.deleteMany({
    where: { customer_id: cust1.id },
  });

  await prisma.customerAddress.create({
    data: {
      tenant_id: tenant1.id,
      customer_id: cust1.id,
      name: 'Aarav Sharma',
      phone: '9876543210',
      address_line1: 'B-402, Lotus Grandeur, Veera Desai Road',
      address_line2: 'Andheri West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400053',
      is_default: true,
    },
  });

  const sampleOrder1 = await prisma.order.upsert({
    where: { tenant_id_order_number: { tenant_id: tenant1.id, order_number: 'AUR-1001' } },
    update: {},
    create: {
      tenant_id: tenant1.id,
      order_number: 'AUR-1001',
      customer_id: cust1.id,
      customer_name: 'Aarav Sharma',
      customer_email: 'aarav@example.com',
      customer_phone: '9876543210',
      shipping_address_json: JSON.stringify({
        line1: 'B-402, Lotus Grandeur, Veera Desai Road',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400053',
      }),
      subtotal: 999,
      discount_amount: 100,
      shipping_fee: 0,
      total_amount: 899,
      payment_method: 'RAZORPAY',
      payment_status: 'PAID',
      fulfillment_status: 'CONFIRMED',
      tracking_awb: null,
      tracking_courier: null,
    },
  });

  await prisma.orderItem.deleteMany({
    where: { order_id: sampleOrder1.id },
  });

  await prisma.orderItem.create({
    data: {
      tenant_id: tenant1.id,
      order_id: sampleOrder1.id,
      product_id: product1.id,
      product_title: 'Radiance 10% Vitamin C Glow Serum',
      sku: 'AURA-SER-001-30ML',
      price: 999,
      quantity: 1,
    },
  });

  await prisma.orderEvent.deleteMany({
    where: { order_id: sampleOrder1.id },
  });

  await prisma.orderEvent.create({
    data: {
      tenant_id: tenant1.id,
      order_id: sampleOrder1.id,
      status: 'PAID',
      note: 'Payment captured successfully via Razorpay (pay_mock_123)',
      created_by: 'RAZORPAY_WEBHOOK',
    },
  });

  await prisma.orderEvent.create({
    data: {
      tenant_id: tenant1.id,
      order_id: sampleOrder1.id,
      status: 'CONFIRMED',
      note: 'Order confirmed and ready for packaging',
      created_by: 'SYSTEM',
    },
  });

  console.log('✅ Seed completed successfully with customers and sample orders!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
