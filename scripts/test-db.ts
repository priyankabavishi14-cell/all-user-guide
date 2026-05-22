import { config } from "dotenv";
config();

import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set in .env");
  const adapter = new PrismaNeonHttp(url, {});
  const prisma = new PrismaClient({ adapter });

  console.log("Connecting to database...");

  const userCount = await prisma.user.count();
  const projectCount = await prisma.project.count();
  const pageCount = await prisma.page.count();

  console.log("Connection successful!");
  console.log(`  users:    ${userCount}`);
  console.log(`  projects: ${projectCount}`);
  console.log(`  pages:    ${pageCount}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Database connection failed:", err);
  process.exit(1);
});
