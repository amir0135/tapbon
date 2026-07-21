import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  uuid,
  jsonb,
  char,
  customType,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => 'bytea',
});
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  // Onboarding-rollevalg huskes: 'private' → /mine, 'business' → dashboard (null = ikke valgt endnu)
  preferredMode: varchar('preferred_mode', { length: 10 }),
  // Glemt adgangskode (specs/legal-pages.md): SHA-256 af engangstoken + udløb
  resetTokenHash: char('reset_token_hash', { length: 64 }),
  resetTokenExpires: timestamp('reset_token_expires'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;

// ─── Tapbon domain ──────────────────────────────────────────────────────────
// All money amounts are integer øre/öre/cents. VAT rates are basis points
// (2500 = 25.00%). Receipts are IMMUTABLE once issued — never UPDATE them;
// corrections are new receipts referencing the original.

export const merchants = pgTable('merchants', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  businessName: varchar('business_name', { length: 200 }).notNull(),
  cvrNumber: varchar('cvr_number', { length: 20 }).notNull(),
  vatNumber: varchar('vat_number', { length: 30 }),
  logoUrl: text('logo_url'),
  locale: varchar('locale', { length: 5 }).notNull().default('da'),
  currency: char('currency', { length: 3 }).notNull().default('DKK'),
  googleReviewUrl: text('google_review_url'),
  // Onboarding-svar (specs/onboarding-wizard.md):
  // { businessType, posSystem, dailyReceipts }
  onboardingProfile: jsonb('onboarding_profile'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const terminals = pgTable('terminals', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id')
    .notNull()
    .references(() => merchants.id),
  publicId: varchar('public_id', { length: 12 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  // Tapbon Bridge (specs/printer-emulation.md): SHA-256 hex of the device's
  // bearer token — the plaintext token is shown once and never stored.
  deviceTokenHash: char('device_token_hash', { length: 64 }).unique(),
  lastSeenAt: timestamp('last_seen_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const receipts = pgTable(
  'receipts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    merchantId: integer('merchant_id')
      .notNull()
      .references(() => merchants.id),
    terminalId: integer('terminal_id').references(() => terminals.id),
    receiptNumber: serial('receipt_number'),
    issuedAt: timestamp('issued_at').notNull().defaultNow(),
    currency: char('currency', { length: 3 }).notNull(),
    totalGross: integer('total_gross').notNull(),
    totalNet: integer('total_net').notNull(),
    totalVat: integer('total_vat').notNull(),
    // Per-rate breakdown: [{ rate: 2500, gross: 10000, net: 8000, vat: 2000 }]
    vatBreakdown: jsonb('vat_breakdown').notNull(),
    // 'structured' = issued from items (VAT breakdown is real).
    // 'file' = captured print job (PDF/PNG in receipt_files); totals are 0 and
    // the VAT/CVR shown is whatever the POS printed on the receipt itself.
    kind: varchar('kind', { length: 10 }).notNull().default('structured'),
    // SHA-256: canonical receipt JSON for 'structured', raw file bytes for 'file'.
    hash: char('hash', { length: 64 }).notNull(),
    correctsReceiptId: uuid('corrects_receipt_id'),
    // ── Delivery metadata (tap/claim flow) — NOT covered by the hash and the
    // only fields that may ever be UPDATEd. Receipt content stays immutable.
    status: varchar('status', { length: 10 }).notNull().default('pending'), // pending | claimed | expired
    confirmationCode: char('confirmation_code', { length: 4 }),
    expiresAt: timestamp('expires_at'),
    claimedAt: timestamp('claimed_at'),
    printJobId: varchar('print_job_id', { length: 100 }),
  },
  (table) => [
    uniqueIndex('receipts_terminal_print_job_idx').on(
      table.terminalId,
      table.printJobId
    ),
  ]
);

// Captured print jobs (Tapbon Bridge). Files live in Postgres because tenant
// policy forces the storage account network-disabled (same as Key Vault).
export const receiptFiles = pgTable('receipt_files', {
  id: serial('id').primaryKey(),
  receiptId: uuid('receipt_id')
    .notNull()
    .unique()
    .references(() => receipts.id),
  mimeType: varchar('mime_type', { length: 30 }).notNull(), // image/png | application/pdf
  byteSize: integer('byte_size').notNull(),
  data: bytea('data').notNull(),
});

// Uploadede forretningslogoer (vises på kvitteringssiden). Egen tabel så
// logo-bytes ikke slæbes med på hvert merchant-select.
export const merchantLogos = pgTable('merchant_logos', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id')
    .notNull()
    .unique()
    .references(() => merchants.id),
  mimeType: varchar('mime_type', { length: 30 }).notNull(), // image/png | image/jpeg | image/webp
  byteSize: integer('byte_size').notNull(),
  data: bytea('data').notNull(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const receiptItems = pgTable('receipt_items', {
  id: serial('id').primaryKey(),
  receiptId: uuid('receipt_id')
    .notNull()
    .references(() => receipts.id),
  name: varchar('name', { length: 200 }).notNull(),
  qty: integer('qty').notNull(),
  unitPriceGross: integer('unit_price_gross').notNull(),
  vatRate: integer('vat_rate').notNull(),
  lineTotalGross: integer('line_total_gross').notNull(),
});

export const loyaltyCards = pgTable('loyalty_cards', {
  id: serial('id').primaryKey(),
  merchantId: integer('merchant_id')
    .notNull()
    .references(() => merchants.id),
  cardToken: uuid('card_token').notNull().unique().defaultRandom(),
  stamps: integer('stamps').notNull().default(0),
  stampsRequired: integer('stamps_required').notNull().default(10),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Regnskabs-forwarding (specs/customer-profile.md) — indbakke-e-mails hos de
// tre store danske regnskabsprogrammer. Alle felter valgfri.
export type AccountingForwards = {
  economic?: string;
  dinero?: string;
  billy?: string;
};

// ── Valgfri kunde-konto (specs/customer-account.md) — opt-in, kun e-mail ────
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 100 }),
  phone: varchar('phone', { length: 30 }),
  // Valgfri adgangskode (specs/customer-profile.md) — magic link forbliver default
  passwordHash: text('password_hash'),
  // Auto-forward gemte boner til e-conomic/Dinero/Billy-indbakker
  accountingForwards: jsonb('accounting_forwards').$type<AccountingForwards>(),
  loginTokenHash: char('login_token_hash', { length: 64 }),
  loginTokenExpires: timestamp('login_token_expires'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ── Projekter: gruppér gemte boner pr. job/kunde/momsperiode (customer-projects) ──
export const customerProjects = pgTable('customer_projects', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id')
    .notNull()
    .references(() => customers.id),
  name: varchar('name', { length: 80 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const customerReceipts = pgTable(
  'customer_receipts',
  {
    id: serial('id').primaryKey(),
    customerId: integer('customer_id')
      .notNull()
      .references(() => customers.id),
    receiptId: uuid('receipt_id')
      .notNull()
      .references(() => receipts.id),
    // Valgfrit projekt (null = ikke i noget projekt)
    projectId: integer('project_id').references(() => customerProjects.id),
    savedAt: timestamp('saved_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('customer_receipts_pair_idx').on(table.customerId, table.receiptId),
  ]
);

export const merchantsRelations = relations(merchants, ({ one, many }) => ({
  user: one(users, { fields: [merchants.userId], references: [users.id] }),
  terminals: many(terminals),
  receipts: many(receipts),
}));

export const terminalsRelations = relations(terminals, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [terminals.merchantId],
    references: [merchants.id],
  }),
  receipts: many(receipts),
}));

export const receiptsRelations = relations(receipts, ({ one, many }) => ({
  merchant: one(merchants, {
    fields: [receipts.merchantId],
    references: [merchants.id],
  }),
  terminal: one(terminals, {
    fields: [receipts.terminalId],
    references: [terminals.id],
  }),
  items: many(receiptItems),
  file: one(receiptFiles, {
    fields: [receipts.id],
    references: [receiptFiles.receiptId],
  }),
}));

export const receiptItemsRelations = relations(receiptItems, ({ one }) => ({
  receipt: one(receipts, {
    fields: [receiptItems.receiptId],
    references: [receipts.id],
  }),
}));

export type Merchant = typeof merchants.$inferSelect;
export type NewMerchant = typeof merchants.$inferInsert;
export type Terminal = typeof terminals.$inferSelect;
export type Receipt = typeof receipts.$inferSelect;
export type NewReceipt = typeof receipts.$inferInsert;
export type ReceiptItem = typeof receiptItems.$inferSelect;
export type NewReceiptItem = typeof receiptItems.$inferInsert;
export type ReceiptFile = typeof receiptFiles.$inferSelect;
export type LoyaltyCard = typeof loyaltyCards.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type CustomerProject = typeof customerProjects.$inferSelect;
export type VatBreakdownEntry = {
  rate: number;
  gross: number;
  net: number;
  vat: number;
};
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}
