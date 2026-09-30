const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Database Seeding ---');

  // 1. Settings
  const settings = [
    { key: 'site_name', value: 'DevGive', description: 'Platform brand name' },
    { key: 'site_title', value: 'DevGive - Developer Source Code Sharing & Resource Platform', description: 'Platform title for SEO' },
    { key: 'site_description', value: 'DevGive is a developer resource platform where original source code projects are shared for learning and development purposes.', description: 'Site description' },
    { key: 'currency', value: 'USD', description: 'Default currency code' },
    { key: 'currency_symbol', value: '$', description: 'Currency symbol' },
    { key: 'youtube_default_duration', value: '60', description: 'Default required seconds to watch before free claim' },
    { key: 'telegram_url', value: 'https://t.me/codetai', description: 'Telegram contact/support link' },
    { key: 'youtube_channel_url', value: 'https://www.youtube.com/@Codetai', description: 'YouTube channel URL' },
    { key: 'manual_payment_info', value: 'Send USDT (TRC20) to TXyz123456789DevGiveWallet or PayPal to payments@devgive.com. Paste your transaction reference or proof below.', description: 'Payment instructions for donations/purchases' },
    { key: 'allow_registration', value: 'true', description: 'Whether new users can register' }
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }
  console.log('✓ Settings seeded');

  // 2. Categories
  const categories = [
    { name: 'SaaS', slug: 'saas', description: 'Software as a Service web applications', icon: 'cloud' },
    { name: 'E-Commerce', slug: 'e-commerce', description: 'Online shopping, marketplaces, and stores', icon: 'shopping-cart' },
    { name: 'Trading', slug: 'trading', description: 'Cryptocurrency, forex, and automated bot platforms', icon: 'trending-up' },
    { name: 'Banking', slug: 'banking', description: 'Digital banking, wallets, and fintech engines', icon: 'dollar-sign' },
    { name: 'Marketing', slug: 'marketing', description: 'Automation, bulk messaging, and CRM systems', icon: 'mail' },
    { name: 'Social Media', slug: 'social-media', description: 'Community portals, chat, and feed apps', icon: 'users' },
  ];

  const categoryMap = {};
  for (const c of categories) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description, icon: c.icon },
      create: c,
    });
    categoryMap[c.slug] = cat.id;
  }
  console.log('✓ Categories seeded');

  // 3. Admin Account
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@devgive.com').toLowerCase();

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      status: 'ACTIVE',
      passwordHash,
    },
    create: {
      email: adminEmail,
      username: 'admin',
      name: 'Platform Administrator',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      bio: 'Lead developer and site owner.',
      country: 'United States',
    },
  });
  console.log(`✓ Admin user ready: ${admin.email} (password: ${adminPassword})`);

  // 4. Sample Projects (Real items matching DevGive)
  const projects = [
    {
      title: 'Multi-Tenancy eCommerce SaaS Engine – Automated Subdomains & Multi-Database Architecture',
      slug: 'multi-tenancy-ecommerce-saas-engine',
      categoryId: categoryMap['saas'],
      shortDescription: 'Launch a high-performance eCommerce website builder SaaS platform with this complete script featuring isolated databases per tenant, automated subdomains, POS, and 20+ payment gateways.',
      description: `Launch a high-performance eCommerce website builder SaaS platform with this complete PHP & Next.js script. Featuring a separate database for each tenant, it ensures maximum speed, data privacy, and scalability.

Tenants get automated subdomains, custom domain support, 8 responsive themes, and drag-and-drop page, menu, and form builders. It supports physical and digital products, 20+ payment gateways, 150+ currencies, inventory management, POS system, dynamic coupons, and powerful marketing modules. Start and manage your own multi-tenant eCommerce business effortlessly with full source code.`,
      techStack: JSON.stringify(['PHP 8.2', 'Laravel 11', 'Next.js', 'MySQL', 'Redis', 'Docker', 'Stripe']),
      version: '2.4.0',
      liveDemoUrl: 'https://demo-multitenancy.example.com',
      isPremium: true,
      price: 29.00,
      sourcePackagePath: 'storage/packages/ecommerce-saas.zip',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0a67e5572263?auto=format&fit=crop&w=800&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeRequiredDuration: 60,
      published: true,
      downloadCount: 20,
      viewCount: 111,
    },
    {
      title: 'Complete Real Estate Marketplace SaaS Script',
      slug: 'complete-real-estate-marketplace-saas',
      categoryId: categoryMap['saas'],
      shortDescription: 'Launch your multi-vendor Real Estate SaaS platform with flexible subscription plans, real-time map search, agent portals, and 20+ online payment gateways.',
      description: `Launch your multi-vendor Real Estate SaaS platform effortlessly with this complete free source code! Features 3 stunning themes, flexible subscription plans, and real-time map search.

Vendors can manage properties, projects, and agents, while admins monetize via subscription packages, featured listings, Google Adsense, and 20+ online payment gateways. Built for global and local businesses with full multilingual/RTL support, secret login, drag-and-drop menu builder, and role permissions.`,
      techStack: JSON.stringify(['React', 'Node.js', 'PostgreSQL', 'Express', 'Mapbox GL', 'Prisma']),
      version: '1.8.2',
      liveDemoUrl: 'https://demo-realestate.example.com',
      isPremium: false,
      price: 0.00,
      sourcePackagePath: 'storage/packages/real-estate-saas.zip',
      thumbnail: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeRequiredDuration: 15,
      published: true,
      downloadCount: 19,
      viewCount: 94,
    },
    {
      title: 'Ultimate Multi-Vendor E-Commerce & Marketplace SaaS Script',
      slug: 'ultimate-multi-vendor-ecommerce-marketplace',
      categoryId: categoryMap['e-commerce'],
      shortDescription: 'Sell physical products, digital downloads, or license keys with integrated AI content generation, dynamic variations, and hierarchical commissions.',
      description: `Launch your own online business with this ultimate multi-vendor e-commerce and marketplace SaaS script. Sell physical products, digital downloads, or license keys effortlessly.

It features an integrated AI content generator, dynamic product variations, multiple global payment gateways, and a flexible hierarchical commission system. Fully SEO-optimized and PWA-ready, the platform ensures top-tier security and includes a dedicated dashboard for vendors.`,
      techStack: JSON.stringify(['Vue 3', 'Tailwind CSS', 'Laravel 10', 'MySQL', 'PayPal', 'AI API']),
      version: '3.1.0',
      liveDemoUrl: 'https://demo-marketplace.example.com',
      isPremium: false,
      price: 0.00,
      sourcePackagePath: 'storage/packages/ecommerce-saas.zip',
      thumbnail: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=800&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeRequiredDuration: 20,
      published: true,
      downloadCount: 28,
      viewCount: 142,
    },
    {
      title: 'All-in-One Marketing Automation SaaS: WhatsApp, Messenger, SMS & Email',
      slug: 'marketing-automation-omnichannel-saas',
      categoryId: categoryMap['marketing'],
      shortDescription: 'Omnichannel team inbox with AI-powered RAG chatbots, visual no-code automation builder, bulk broadcast campaigns, CRM, and white-label billing.',
      description: `Launch your own SaaS with this complete, self-hosted omnichannel marketing automation platform. Built with Laravel 12 and React 19, it unifies WhatsApp Business, Facebook Messenger, Instagram DMs, SMS, and Email into a single team inbox.

Features include AI-powered RAG chatbots, a visual no-code automation builder, bulk broadcast campaigns, CRM, e-commerce sync, and a full multi-tenant SaaS admin with white-label billing. Clean, modular code with REST API, webhooks, and i18n support.`,
      techStack: JSON.stringify(['Laravel 12', 'React 19', 'WhatsApp Cloud API', 'OpenAI', 'Redis', 'PostgreSQL']),
      version: '1.2.0',
      liveDemoUrl: 'https://demo-marketing.example.com',
      isPremium: true,
      price: 39.00,
      sourcePackagePath: 'storage/packages/ecommerce-saas.zip',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeRequiredDuration: 60,
      published: true,
      downloadCount: 108,
      viewCount: 420,
    },
    {
      title: 'Crypto Trading Bot Platform with Automated Deposits and Withdrawals',
      slug: 'crypto-trading-bot-platform',
      categoryId: categoryMap['trading'],
      shortDescription: 'Automated bot management, multi-chain wallet integration, real-time position replication, deposit monitoring, withdrawal workflows, and KYC tools.',
      description: `Launch a self-hosted crypto trading and copy-trading platform with automated bot management, multi-chain wallet integration, real-time position replication, deposit monitoring, withdrawal workflows, KYC tools, affiliate tracking, analytics, and white-label branding.

Built for flexible deployment on your own server with full source-code access and direct blockchain connectivity. Designed for educational, testing, and lawful commercial use.`,
      techStack: JSON.stringify(['Python FastAPI', 'Next.js 14', 'Web3.py', 'PostgreSQL', 'Binance API', 'Docker']),
      version: '2.0.4',
      liveDemoUrl: 'https://demo-trading.example.com',
      isPremium: true,
      price: 49.00,
      sourcePackagePath: 'storage/packages/trading-bot.zip',
      thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=800&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeRequiredDuration: 60,
      published: true,
      downloadCount: 33,
      viewCount: 210,
    },
    {
      title: 'Advanced Stock Image Gallery Script with Subscription System',
      slug: 'advanced-stock-image-gallery-subscription',
      categoryId: categoryMap['saas'],
      shortDescription: 'Supports PWA, 2FA security, Stripe Connect, multi-cloud storage (AWS, DigitalOcean, Wasabi), subscription tiers, and automated invoices.',
      description: `Advanced Stock Image Gallery Script with Subscription System is a feature-rich, open-source platform for building high-quality stock photo websites.

Equipped with modern tech, it supports PWA, 2FA security, Stripe Connect, PayPal donations, and multi-cloud storage (AWS, DigitalOcean, Wasabi). Features include subscription plans, automated taxes/invoices, advanced image search, social login, and user interactions.`,
      techStack: JSON.stringify(['Next.js', 'TypeScript', 'Tailwind CSS', 'AWS S3', 'Stripe Connect']),
      version: '1.5.0',
      liveDemoUrl: 'https://demo-stockphoto.example.com',
      isPremium: false,
      price: 0.00,
      sourcePackagePath: 'storage/packages/real-estate-saas.zip',
      thumbnail: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?auto=format&fit=crop&w=800&q=80',
      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      youtubeRequiredDuration: 10,
      published: true,
      downloadCount: 17,
      viewCount: 88,
    }
  ];

  for (const p of projects) {
    await prisma.project.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log(`✓ Seeded ${projects.length} real projects`);

  console.log('--- Database Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
