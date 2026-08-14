const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const watches = [
  {
    id: 1,
    name: 'Aeterna Solaris',
    tagline: 'Radiance Redefined',
    description: 'Forged from 18K gold and engineered for absolute precision, the Solaris is a statement of power. Its commanding presence on the wrist is matched only by the intricate ballet of its Swiss automatic movement visible through the case back.',
    price: 1000,
    image: '/watches/solaris.png',
    style: 'Gold-tone dial, mesh bracelet, flagship',
    variants: ['Gold Mesh', 'Gold Leather', 'Rose Gold Mesh'],
  },
  {
    id: 2,
    name: 'Aurora Nocturne',
    tagline: 'Elegance After Dark',
    description: 'The Nocturne is the ultimate companion for the evening. Featuring a deep, polished black ceramic case that absorbs the light, it offers a mysterious and highly sophisticated profile that slips effortlessly under a tuxedo cuff.',
    price: 1100,
    image: '/watches/nocturne.png',
    style: 'Black dial, leather strap, dress watch',
    variants: ['Black Leather', 'Navy Leather', 'Burgundy Leather'],
  },
  {
    id: 3,
    name: 'Vanguard Meridian',
    tagline: 'Command Every Timezone',
    description: 'Built for the modern traveler. The Meridian features a robust dual-timezone complication allowing you to track home and local time simultaneously, wrapped in a brushed steel case that can take a beating across continents.',
    price: 1200,
    image: '/watches/meridian.png',
    style: "Dual timezone, silver dial, traveler's watch",
    variants: ['Steel Bracelet', 'Steel/Gold Bracelet', 'Brown Leather'],
  },
  {
    id: 4,
    name: 'Celestia Zenith',
    tagline: 'Rise Above',
    description: 'Stripped of all unnecessary details, the Zenith is an exercise in minimalist perfection. Its stark white dial and slender hands provide ultimate legibility, making it the perfect daily wearer for the discerning minimalist.',
    price: 1300,
    image: '/watches/zenith.png',
    style: 'White dial, minimalist, everyday luxury',
    variants: ['White/Tan Leather', 'White/Black Leather', 'Silver Mesh'],
  },
  {
    id: 5,
    name: 'Helios Titanis',
    tagline: 'Strength in Simplicity',
    description: 'Crafted from aerospace-grade titanium, the Titanis is 40% lighter than steel yet remarkably stronger. This is a rugged, sporty-minimalist watch designed to transition seamlessly from the boardroom to the deep sea.',
    price: 1400,
    image: '/watches/titanis.png',
    style: 'Titanium case, sapphire crystal, sporty-minimal',
    variants: ['Titanium Bracelet', 'Titanium/Rubber', 'Black DLC'],
  },
  {
    id: 6,
    name: 'Nova Première',
    tagline: 'Your First Impression',
    description: 'Your entry into the world of luxury. The Première offers a clean design language and premium finishing at an accessible price point. The perfect foundation for a growing luxury collection.',
    price: 1500,
    image: '/watches/premiere.png',
    style: 'Entry-level, clean design, accessible luxury',
    variants: ['Black Leather', 'Brown Leather', 'Navy NATO'],
  },
];

async function main() {
  console.log('Start seeding...');
  for (const watch of watches) {
    const watchData = {
      id: watch.id.toString(),
      name: watch.name,
      tagline: watch.tagline,
      description: watch.description,
      price: watch.price,
      image: watch.image,
      style: watch.style,
      variants: watch.variants,
    };

    // Upsert ensures we don't duplicate data if we run this multiple times
    const createdWatch = await prisma.watch.upsert({
      where: { id: watchData.id },
      update: watchData,
      create: watchData,
    });
    console.log(`Created/Updated watch with id: ${createdWatch.id}`);
  }
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
