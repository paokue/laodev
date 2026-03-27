import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || "admin@laodev.la"
  const password = process.argv[3] || "admin123"
  const name = process.argv[4] || "Admin"

  const hashedPassword = await bcrypt.hash(password, 12)

  const admin = await prisma.admin.upsert({
    where: { email },
    update: { password: hashedPassword, name },
    create: { email, password: hashedPassword, name },
  })

  console.log(`Admin created/updated:`)
  console.log(`  Email: ${admin.email}`)
  console.log(`  Name: ${admin.name}`)
  console.log(`  Password: ${password}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
