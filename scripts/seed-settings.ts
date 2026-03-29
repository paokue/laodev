import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const defaults = [
  // General
  { key: "platformName", value: "LaoDev", type: "string", group: "general" },
  { key: "siteUrl", value: "https://laodev.la", type: "string", group: "general" },
  { key: "description", value: "Connect with top developers in Laos. Find consultants, get mentorship, and build your tech career.", type: "string", group: "general" },
  { key: "defaultLanguage", value: "en", type: "string", group: "general" },
  { key: "timezone", value: "asia-vientiane", type: "string", group: "general" },
  { key: "maintenanceMode", value: "false", type: "boolean", group: "general" },

  // Notifications
  { key: "notifyNewDeveloperApps", value: "true", type: "boolean", group: "notifications" },
  { key: "notifyNewBookings", value: "true", type: "boolean", group: "notifications" },
  { key: "notifyPaymentAlerts", value: "true", type: "boolean", group: "notifications" },
  { key: "notifyFlaggedContent", value: "true", type: "boolean", group: "notifications" },
  { key: "weeklyReports", value: "false", type: "boolean", group: "notifications" },

  // Payments
  { key: "defaultCurrency", value: "LAK", type: "string", group: "payments" },
  { key: "platformFee", value: "10", type: "number", group: "payments" },
  { key: "minPayoutAmount", value: "50000", type: "number", group: "payments" },
  { key: "payoutSchedule", value: "weekly", type: "string", group: "payments" },
  { key: "autoPayouts", value: "true", type: "boolean", group: "payments" },
  { key: "coffeePricePerCup", value: "20000", type: "number", group: "payments" },

  // Security
  { key: "twoFactorAuth", value: "true", type: "boolean", group: "security" },
  { key: "emailVerification", value: "true", type: "boolean", group: "security" },
  { key: "developerVerification", value: "true", type: "boolean", group: "security" },
  { key: "sessionTimeout", value: "60", type: "number", group: "security" },
  { key: "maxLoginAttempts", value: "5", type: "number", group: "security" },

  // Email
  { key: "smtpHost", value: "smtp.example.com", type: "string", group: "email" },
  { key: "smtpPort", value: "587", type: "number", group: "email" },
  { key: "smtpUsername", value: "noreply@laodev.la", type: "string", group: "email" },
  { key: "smtpPassword", value: "", type: "string", group: "email" },
  { key: "fromEmail", value: "LaoDev <noreply@laodev.la>", type: "string", group: "email" },
  { key: "emailTls", value: "true", type: "boolean", group: "email" },
]

async function main() {
  for (const setting of defaults) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log(`Seeded ${defaults.length} settings`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
