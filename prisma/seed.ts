import { config } from "dotenv";
config();

import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { scryptSync, randomBytes } from "crypto";

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set in .env");

  const adapter = new PrismaNeon({ connectionString: url });
  const prisma = new PrismaClient({ adapter });

  console.log("Seeding database...");

  // ── Admin user ──────────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: "admin@divinesystems.in" },
    update: {},
    create: {
      name: "Divine Admin",
      email: "admin@divinesystems.in",
      phone: "+1234567890",
      password: hashPassword("Admin@1234"),
    },
  });

  console.log(`  user: ${user.email}`);

  // ── Demo project ────────────────────────────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { slug: "getting-started" },
    update: {},
    create: {
      title: "Getting Started",
      slug: "getting-started",
      description: "A demo project to explore the user guide platform.",
      frontendUrl: "http://localhost:3000/getting-started",
      backendUrl: "http://localhost:3000/admin/getting-started",
      isActive: true,
      createdBy: user.id,
    },
  });

  console.log(`  project: ${project.slug}`);

  // ── Root pages ──────────────────────────────────────────────────────────────
  const introPage = await prisma.page.upsert({
    where: { projectId_slug: { projectId: project.id, slug: "introduction" } },
    update: {},
    create: {
      projectId: project.id,
      title: "Introduction",
      slug: "introduction",
      sequence: 1,
      icon: "📄",
      description: "Overview of the platform.",
      content: `# Introduction\n\nWelcome to the User Guide platform. This guide walks you through everything you need to know to get started.`,
      isActive: true,
    },
  });

  const quickstartPage = await prisma.page.upsert({
    where: { projectId_slug: { projectId: project.id, slug: "quickstart" } },
    update: {},
    create: {
      projectId: project.id,
      title: "Quickstart",
      slug: "quickstart",
      sequence: 2,
      icon: "📄",
      description: "Get up and running in minutes.",
      content: `# Quickstart\n\nFollow these steps to set up your first project and page.`,
      isActive: true,
    },
  });

  console.log(`  pages: ${introPage.slug}, ${quickstartPage.slug}`);

  // ── Sub-pages under Quickstart ───────────────────────────────────────────────
  const installPage = await prisma.page.upsert({
    where: { projectId_slug: { projectId: project.id, slug: "installation" } },
    update: {},
    create: {
      projectId: project.id,
      title: "Installation",
      slug: "installation",
      sequence: 1,
      icon: "📄",
      parentId: quickstartPage.id,
      description: "How to install and configure the platform.",
      content: `# Installation\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``,
      isActive: true,
    },
  });

  const configPage = await prisma.page.upsert({
    where: { projectId_slug: { projectId: project.id, slug: "configuration" } },
    update: {},
    create: {
      projectId: project.id,
      title: "Configuration",
      slug: "configuration",
      sequence: 2,
      icon: "📄",
      parentId: quickstartPage.id,
      description: "Configure your environment and settings.",
      content: `# Configuration\n\nCopy \`.env.example\` to \`.env\` and fill in your Neon database URL.`,
      isActive: true,
    },
  });

  console.log(`  sub-pages: ${installPage.slug}, ${configPage.slug}`);

  console.log("\nSeed complete.");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
