import { requireEnv } from './env';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashPassword } from './auth/password';
import { PrismaClient } from './generated/prisma/client';
import type { Category } from './generated/prisma/enums';
import { slugify } from './products/product-input';

type SeedProduct = {
  name: string;
  category: Category;
  price: number;
  stock: number;
  description: string;
};

const PRODUCTS: SeedProduct[] = [
  {
    name: 'ASUS ROG Strix G16 Gaming Laptop',
    category: 'LAPTOPS',
    price: 34999,
    stock: 5,
    description:
      'Laptop gamer de 16 pulgadas con procesador Intel Core i7, tarjeta GeForce RTX 5060, 16 GB de RAM y pantalla de 165 Hz.',
  },
  {
    name: 'Lenovo Legion Pro 5 Gaming Laptop',
    category: 'LAPTOPS',
    price: 38999,
    stock: 3,
    description:
      'Procesador AMD Ryzen 7, tarjeta GeForce RTX 5070, 32 GB de RAM y pantalla 2.5K de 165 Hz para jugar y crear contenido.',
  },
  {
    name: 'Acer Nitro V 15 Gaming Laptop',
    category: 'LAPTOPS',
    price: 17999,
    stock: 8,
    description:
      'La opción para empezar: Intel Core i5, GeForce RTX 4050, 16 GB de RAM y pantalla Full HD de 144 Hz.',
  },
  {
    name: 'MSI Katana 15 Gaming Laptop',
    category: 'LAPTOPS',
    price: 22999,
    stock: 0,
    description:
      'Intel Core i7, GeForce RTX 4060 y teclado retroiluminado. Pantalla Full HD de 144 Hz.',
  },
  {
    name: 'NVIDIA GeForce RTX 5070 Graphics Card',
    category: 'COMPONENTS',
    price: 13499,
    stock: 6,
    description:
      '12 GB de memoria GDDR7, DLSS 4 y trazado de rayos. Ideal para jugar en 1440p con todo en alto.',
  },
  {
    name: 'AMD Radeon RX 9070 XT Graphics Card',
    category: 'COMPONENTS',
    price: 14999,
    stock: 4,
    description: '16 GB de memoria GDDR6 y FSR 4. Gran rendimiento en 1440p y 4K.',
  },
  {
    name: 'AMD Ryzen 7 9800X3D Processor',
    category: 'COMPONENTS',
    price: 10499,
    stock: 7,
    description: '8 núcleos y 16 hilos con tecnología 3D V-Cache. Socket AM5.',
  },
  {
    name: 'Kingston FURY Beast 32GB DDR5 RAM',
    category: 'COMPONENTS',
    price: 2299,
    stock: 15,
    description: 'Kit de 2 módulos de 16 GB a 6000 MHz con perfiles XMP y EXPO.',
  },
  {
    name: 'Samsung 990 PRO 2TB NVMe SSD',
    category: 'COMPONENTS',
    price: 3499,
    stock: 10,
    description: 'Unidad NVMe PCIe 4.0 con lectura de hasta 7,450 MB/s.',
  },
  {
    name: 'Logitech G PRO X TKL Mechanical Keyboard',
    category: 'PERIPHERALS',
    price: 3299,
    stock: 9,
    description: 'Teclado sin teclado numérico, inalámbrico LIGHTSPEED y switches táctiles.',
  },
  {
    name: 'Razer DeathAdder V3 Pro Wireless Mouse',
    category: 'PERIPHERALS',
    price: 2999,
    stock: 12,
    description: 'Mouse inalámbrico ultraligero de 63 g con sensor óptico Focus Pro de 30K DPI.',
  },
  {
    name: 'HyperX Cloud III Gaming Headset',
    category: 'PERIPHERALS',
    price: 1799,
    stock: 20,
    description: 'Audífonos alámbricos con sonido espacial DTS y micrófono desmontable.',
  },
  {
    name: 'Samsung Odyssey G5 27 Gaming Monitor',
    category: 'MONITORS',
    price: 5499,
    stock: 6,
    description: 'Monitor curvo de 27 pulgadas, resolución QHD y 165 Hz.',
  },
  {
    name: 'LG UltraGear 24 Gaming Monitor',
    category: 'MONITORS',
    price: 3299,
    stock: 11,
    description: 'Monitor de 24 pulgadas Full HD, panel IPS y 180 Hz.',
  },
];

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: requireEnv('DATABASE_URL') }),
  });

  try {
    const email = requireEnv('ADMIN_EMAIL').trim().toLowerCase();
    const name = process.env.ADMIN_NAME ?? 'Administrador';
    const passwordHash = await hashPassword(requireEnv('ADMIN_PASSWORD'));

    await prisma.user.upsert({
      where: { email },
      update: { name, passwordHash },
      create: { email, name, passwordHash },
    });

    for (const product of PRODUCTS) {
      const slug = slugify(product.name);
      await prisma.product.upsert({
        where: { slug },
        update: {},
        create: { ...product, slug },
      });
    }

    console.log(`Seed listo: administrador ${email} y ${PRODUCTS.length} productos.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
