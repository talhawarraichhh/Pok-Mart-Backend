// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@example.com',
      password: hashSync('admin123', 10),
      admin: { create: {} },
    },
  });

  const sellerUser = await prisma.user.create({
    data: {
      username: 'misty_shop',
      email: 'misty@example.com',
      password: hashSync('watergym', 10),
      seller: { create: { rating: 5 } },
    },
    include: { seller: true },
  });
  const sellerId = sellerUser.seller!.id;

  const customerUser = await prisma.user.create({
    data: {
      username: 'ash_ketchum',
      email: 'ash@example.com',
      password: hashSync('pikachu', 10),
      customer: { create: {} },
    },
    include: { customer: true },
  });
  const customerId = customerUser.customer!.id;

  const [baseSet, jungleSet, fossilSet] = await prisma.$transaction([
    prisma.set.create({ data: { name: 'Base Set', release_Date: new Date('1999-01-09') } }),
    prisma.set.create({ data: { name: 'Jungle',   release_Date: new Date('1999-06-16') } }),
    prisma.set.create({ data: { name: 'Fossil',   release_Date: new Date('1999-10-10') } }),
  ]);

  const products = await prisma.$transaction([
    prisma.product.create({
      data: {
        name: 'Charizard 4/102',
        description: 'Holo Rare',
        productType: 'SingleCard',
        setId: baseSet.id,
        singleCard: {
          create: { condition: 'Near Mint', rarity: 'Rare Holo', type: 'Fire', category: 'Pokemon' },
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Blastoise 2/102',
        description: 'Holo Rare',
        productType: 'SingleCard',
        setId: baseSet.id,
        singleCard: {
          create: { condition: 'Lightly Played', rarity: 'Rare Holo', type: 'Water', category: 'Pokemon' },
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Vaporeon 12/64',
        description: 'Holo Rare',
        productType: 'SingleCard',
        setId: jungleSet.id,
        singleCard: {
          create: { condition: 'Near Mint', rarity: 'Rare Holo', type: 'Water', category: 'Pokemon' },
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Dragonite 4/62',
        description: 'Holo Rare',
        productType: 'SingleCard',
        setId: fossilSet.id,
        singleCard: {
          create: { condition: 'Near Mint', rarity: 'Rare Holo', type: 'Dragon', category: 'Pokemon' },
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Zapdos 15/62',
        description: 'Holo Rare',
        productType: 'SingleCard',
        setId: fossilSet.id,
        singleCard: {
          create: { condition: 'Moderately Played', rarity: 'Rare Holo', type: 'Electric', category: 'Pokemon' },
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Base Set Booster Pack',
        description: 'Factory-sealed 11-card booster',
        productType: 'SealedProduct',
        setId: baseSet.id,
        sealedProduct: {
          create: { condition: 'Sealed', category: 'Booster Pack' },
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'Jungle Booster Box',
        description: 'Factory-sealed 36 booster packs',
        productType: 'SealedProduct',
        setId: jungleSet.id,
        sealedProduct: {
          create: { condition: 'Sealed', category: 'Booster Box' },
        },
      },
    }),
  ]);

  const listingSpecs = [
    { productId: products[0].id, stock: 1,  price: 700 },
    { productId: products[1].id, stock: 2,  price: 350 },
    { productId: products[5].id, stock: 24, price: 15  },
    { productId: products[6].id, stock: 3,  price: 450 },
  ];
  await Promise.all(
    listingSpecs.map((l) =>
      prisma.listing.create({
        data: { ...l, sellerId },   // listings now belong to the seller
      }),
    ),
  );

  const cart = await prisma.cart.create({
    data: {
      customerId,
      numberOfItems: 2,
      items: {
        create: [
          { productId: products[5].id, quantity: 5 },
          { productId: products[0].id, quantity: 1 },
        ],
      },
    },
  });

  const order = await prisma.order.create({
    data: {
      customerId,
      sellerId,
      cost: 5 * 15 + 700,
      items: {
        create: [
          { productId: products[5].id, quantity: 5, purchase_Price: 15 },
          { productId: products[0].id, quantity: 1, purchase_Price: 700 },
        ],
      },
    },
  });

  console.log(
    `Seed OK → admin(${adminUser.email}) seller(${sellerUser.email}) customer(${customerUser.email}) ` +
    `${products.length} products, ${listingSpecs.length} listings, cart ${cart.id}, order ${order.id}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
