import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.lead.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.service.deleteMany();

  // Create Services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Web Development',
        slug: 'web-development',
        description:
          'Build performant, scalable web applications with modern technologies. We specialize in React, Next.js, and Node.js to deliver exceptional user experiences that drive business results.',
        icon: '🌐',
        order: 1,
        isActive: true,
        startingPrice: 299900, // USD $2,999
        translations: {
          es: {
            name: 'Desarrollo Web',
            description:
              'Aplicaciones web modernas, escalables y de alto rendimiento con React, Next.js y Node.js. Experiencias de usuario excepcionales que impulsan resultados de negocio.',
          },
          en: {
            name: 'Web Development',
            description:
              'Build performant, scalable web applications with modern technologies. We specialize in React, Next.js, and Node.js to deliver exceptional user experiences that drive business results.',
          },
        },
      },
    }),
    prisma.service.create({
      data: {
        name: 'Mobile Apps',
        slug: 'mobile-apps',
        description:
          'Cross-platform mobile applications built with React Native. Native performance with a single codebase for iOS and Android, reducing development time and costs.',
        icon: '📱',
        order: 2,
        isActive: true,
        startingPrice: 499900, // USD $4,999
        translations: {
          es: {
            name: 'Apps Moviles',
            description:
              'Aplicaciones moviles multiplataforma con React Native. Rendimiento nativo con un solo codebase para iOS y Android, reduciendo tiempos y costos de desarrollo.',
          },
          en: {
            name: 'Mobile Apps',
            description:
              'Cross-platform mobile applications built with React Native. Native performance with a single codebase for iOS and Android, reducing development time and costs.',
          },
        },
      },
    }),
    prisma.service.create({
      data: {
        name: 'Business Automation',
        slug: 'automation',
        description:
          'Streamline your operations with custom n8n workflows. Automate sales, customer support, and internal processes to save time, reduce errors, and scale efficiently.',
        icon: '⚡',
        order: 3,
        isActive: true,
        startingPrice: 99900, // USD $999
        translations: {
          es: {
            name: 'Automatizacion de Negocios',
            description:
              'Optimiza tus operaciones con workflows personalizados en n8n. Automatiza ventas, soporte al cliente y procesos internos para ahorrar tiempo y escalar eficientemente.',
          },
          en: {
            name: 'Business Automation',
            description:
              'Streamline your operations with custom n8n workflows. Automate sales, customer support, and internal processes to save time, reduce errors, and scale efficiently.',
          },
        },
      },
    }),
    prisma.service.create({
      data: {
        name: 'MVP Development',
        slug: 'mvp-development',
        description:
          'Transform your idea into a working product fast. We build minimum viable products that validate your concept and get you to market quickly with room to scale.',
        icon: '🚀',
        order: 4,
        isActive: true,
        startingPrice: 199900, // USD $1,999
        translations: {
          es: {
            name: 'Desarrollo MVP',
            description:
              'Transforma tu idea en un producto funcional rapidamente. Construimos productos minimos viables que validan tu concepto y te llevan al mercado con capacidad de escalar.',
          },
          en: {
            name: 'MVP Development',
            description:
              'Transform your idea into a working product fast. We build minimum viable products that validate your concept and get you to market quickly with room to scale.',
          },
        },
      },
    }),
  ]);

  console.log(`✅ Created ${services.length} services`);

  // Create Blog Posts
  const blogPosts = await Promise.all([
    prisma.blogPost.create({
      data: {
        title: 'Why Next.js is the Future of Web Development',
        slug: 'why-nextjs-future-web-development',
        excerpt:
          'Explore why Next.js has become the go-to framework for modern web applications and how it can benefit your next project.',
        content: `
# Why Next.js is the Future of Web Development

Next.js has revolutionized how we build web applications. With its hybrid rendering capabilities, automatic code splitting, and excellent developer experience, it's become the framework of choice for modern web development.

## Key Benefits

1. **Server-Side Rendering (SSR)** - Improved SEO and faster initial page loads
2. **Static Site Generation (SSG)** - Pre-render pages at build time for lightning-fast performance
3. **API Routes** - Build your API alongside your frontend
4. **File-based Routing** - Intuitive and easy to understand

## Conclusion

If you're starting a new project or looking to modernize an existing one, Next.js should be at the top of your list.
        `.trim(),
        isPublished: true,
        publishedAt: new Date(),
        seoMetadata: {
          title: 'Why Next.js is the Future of Web Development',
          description:
            'Learn why Next.js has become the preferred framework for modern web applications.',
        },
      },
    }),
    prisma.blogPost.create({
      data: {
        title: 'Automating Your Business with n8n',
        slug: 'automating-business-n8n',
        excerpt:
          'Learn how n8n can transform your business operations through powerful workflow automation.',
        content: `
# Automating Your Business with n8n

n8n is a powerful open-source workflow automation tool that can connect your apps and automate repetitive tasks.

## What Can You Automate?

- **Lead Management** - Automatically capture and route leads
- **Customer Support** - Create tickets from emails, Slack messages, etc.
- **Data Sync** - Keep your databases and CRMs in sync
- **Notifications** - Alert your team when important events happen

## Getting Started

1. Identify repetitive tasks in your workflow
2. Map out the trigger and actions needed
3. Build and test your workflow
4. Monitor and optimize

Start small and expand as you see results!
        `.trim(),
        isPublished: true,
        publishedAt: new Date(Date.now() - 86400000), // 1 day ago
        seoMetadata: {
          title: 'Automating Your Business with n8n',
          description:
            'Discover how n8n workflow automation can save time and reduce errors.',
        },
      },
    }),
  ]);

  console.log(`✅ Created ${blogPosts.length} blog posts`);

  // Create Sample Lead
  const lead = await prisma.lead.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Acme Inc',
      message: 'Looking to build a custom CRM for our sales team.',
      status: 'NEW',
    },
  });

  console.log(`✅ Created sample lead: ${lead.name}`);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
