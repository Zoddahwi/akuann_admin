const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DESIGNS = [
  // Bridal Couture
  {
    name: "Luxury Wedding Gowns",
    category: "Bridal Couture",
    subcategory: "Ceremony",
    description: "Statement gowns with couture structure, hand-finishing, and elevated fabrics for the aisle.",
    image: "/IMG_9974.jpg.jpeg",
    price: 4500,
  },
  {
    name: "Custom Wedding Gowns (Made-to-Measure)",
    category: "Bridal Couture",
    subcategory: "Bespoke",
    description: "One-of-one silhouettes cut to your measurements with bespoke neckline, sleeve, and train.",
    image: "/_KWA4833 copy.jpg (1).jpeg",
    price: 3500,
  },
  {
    name: "Reception Dresses",
    category: "Bridal Couture",
    subcategory: "Reception",
    description: "Lightweight gowns designed for dancing, outfit changes, and the after-party.",
    image: "/KTM_0523.jpg.jpeg",
    price: 2000,
  },
  {
    name: "Civil Wedding Dresses",
    category: "Bridal Couture",
    subcategory: "Registry",
    description: "Chic, pared-back looks ideal for civil ceremonies and registry celebrations.",
    image: "/KTM_0496.jpg.jpeg",
    price: 1500,
  },
  {
    name: "Church Wedding Gowns",
    category: "Bridal Couture",
    subcategory: "Traditional",
    description: "Classic silhouettes with thoughtful coverage and drama for grand church aisles.",
    image: "/KTM_0569.jpg.jpeg",
    price: 3000,
  },
  {
    name: "Exquisite Kente Wedding Gowns",
    category: "Bridal Couture",
    subcategory: "Traditional",
    description: "Hand-woven Kente heritage meet couture precision. Bespoke silhouettes that celebrate tradition with a modern, high-fashion edge.",
    image: "/KTM_0548.jpg.jpeg",
    price: 3800,
  },

  // Bridal Robes
  {
    name: "Bridal Morning Robes",
    category: "Bridal Robes",
    subcategory: "Morning",
    description: "Soft, photogenic robes for getting-ready moments and bridal portraits.",
    image: "/KTM_0504.jpg.jpeg",
    price: 250,
  },
  {
    name: "Satin Bridal Robes",
    category: "Bridal Robes",
    subcategory: "Satin",
    description: "Lustrous satin robes with elegant drape and a subtle sheen for pre-ceremony moments.",
    image: "/KTM_0504.jpg.jpeg",
    price: 300,
  },
  {
    name: "Silk Bridal Robes",
    category: "Bridal Robes",
    subcategory: "Silk",
    description: "Pure silk robes offering lightweight luxury and a smooth finish for getting-ready portraits.",
    image: "/KTM_0504.jpg.jpeg",
    price: 400,
  },
  {
    name: "Lace Bridal Robes",
    category: "Bridal Robes",
    subcategory: "Lace",
    description: "Delicate lace-trimmed robes adding romance and texture to bridal prep moments.",
    image: "/KTM_0504.jpg.jpeg",
    price: 350,
  },

  // Bridesmaids Collection
  {
    name: "Couture Bridesmaids Dresses",
    category: "Bridesmaids Collection",
    subcategory: "Couture",
    description: "Elevated silhouettes for your bridal party, designed to complement the bride.",
    image: "/_KWA4801 copy 2.jpg.jpeg",
    price: 800,
  },
  {
    name: "Convertible Bridesmaids Dresses",
    category: "Bridesmaids Collection",
    subcategory: "Multi-way",
    description: "Multi-way dresses that can be styled differently to suit each bridesmaid’s preference.",
    image: "/_KWA4801 copy 2.jpg.jpeg",
    price: 650,
  },
  {
    name: "Custom Color Bridesmaids Dresses",
    category: "Bridesmaids Collection",
    subcategory: "Custom",
    description: "Bridesmaid gowns crafted in your exact wedding colors for a perfectly coordinated look.",
    image: "/_KWA4801 copy 2.jpg.jpeg",
    price: 700,
  },

  // Bridal Accessories
  {
    name: "Veils",
    category: "Bridal Accessories",
    subcategory: "Headwear",
    description: "Cathedral, chapel, and fingertip veils to frame your bridal look.",
    image: "/_KWA4800 copy 2.jpg.jpeg",
    price: 200,
  },
  {
    name: "Bridal Gloves",
    category: "Bridal Accessories",
    subcategory: "Handwear",
    description: "Elegant gloves from classic satin to modern lace for a refined bridal finish.",
    image: "/_KWA4800 copy 2.jpg.jpeg",
    price: 120,
  },
  {
    name: "Bridal Capes",
    category: "Bridal Accessories",
    subcategory: "Outerwear",
    description: "Dramatic capes and wraps to add movement and grandeur to your bridal entrance.",
    image: "/_KWA4800 copy 2.jpg.jpeg",
    price: 350,
  },

  // Luxury Evening & Reception
  {
    name: "Evening Gowns",
    category: "Luxury Evening & Reception",
    subcategory: "Evening",
    description: "Floor-length gowns for galas, receptions, and black-tie celebrations.",
    image: "/KTM_0523.jpg.jpeg",
    price: 2500,
  },
  {
    name: "Engagement Dresses",
    category: "Luxury Evening & Reception",
    subcategory: "Engagement",
    description: "Chic dresses perfect for engagement parties, rehearsal dinners, and pre-wedding events.",
    image: "/KTM_0523.jpg.jpeg",
    price: 1800,
  },
  {
    name: "After-Party Dresses",
    category: "Luxury Evening & Reception",
    subcategory: "Party",
    description: "Fun, dance-ready dresses designed for reception after-parties and outfit changes.",
    image: "/KTM_0523.jpg.jpeg",
    price: 1200,
  },

  // Custom Orders
  {
    name: "Book a Consultation",
    category: "Custom Orders",
    subcategory: "Service",
    description: "Schedule a one-on-one design consultation to discuss your vision and requirements.",
    image: "/_KWA4833 copy.jpg (1).jpeg",
    price: 0,
  },
  {
    name: "Design Your Own Gown",
    category: "Custom Orders",
    subcategory: "Bespoke",
    description: "Collaborate on fabric, silhouette, and detailing for a completely bespoke gown.",
    image: "/_KWA4833 copy.jpg (1).jpeg",
    price: 3000,
  },
  {
    name: "Measurement Submission",
    category: "Custom Orders",
    subcategory: "Service",
    description: "Submit your measurements for made-to-fit garments with precision and care.",
    image: "/_KWA4833 copy.jpg (1).jpeg",
    price: 0,
  },
  {
    name: "Express Custom Orders",
    category: "Custom Orders",
    subcategory: "Express",
    description: "Fast-tracked custom creations for tight timelines without compromising on quality.",
    image: "/_KWA4833 copy.jpg (1).jpeg",
    price: 4000,
  },
];

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')   // Remove all non-word chars
    .replace(/--+/g, '-');     // Replace multiple - with single -
}

async function main() {
  console.log('Clearing old data and seeding actual images...');
  
  // Clear existing gowns first to avoid duplicates
  await prisma.gown.deleteMany({});

  for (const design of DESIGNS) {
    await prisma.gown.create({
      data: {
        name: design.name,
        slug: slugify(design.name),
        category: design.category,
        subcategory: design.subcategory,
        description: design.description,
        price: design.price,
        images: [design.image],
        isCustomizable: true,
        rating: 5.0,
        reviewsCount: 12,
      }
    });
  }

  console.log('Successfully seeded collection with actual images!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
