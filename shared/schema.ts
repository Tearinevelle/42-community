import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Available ranks that can be assigned to users
export const ranks = pgTable("ranks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isSystem: boolean("is_system").default(false), // True if it's a system rank (activity-based)
  level: integer("level").default(0), // Used for activity-based ranks
  createdBy: integer("created_by"), // null for system ranks
  createdAt: timestamp("created_at").defaultNow(),
});

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  telegramId: text("telegram_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar"),
  gender: text("gender"), // "male", "female", "other"
  bannerColor: text("banner_color").default("from-purple-500 to-blue-500"),
  bio: text("bio"),
  status: text("status"), // Статус пользователя
  rank: text("rank").default("Чебоксарец"), // Primary rank displayed
  role: text("role").default("user"), // "owner", "admin", "moderator", "user"
  isBanned: boolean("is_banned").default(false),
  banReason: text("ban_reason"),
  isMuted: boolean("is_muted").default(false),
  muteEndTime: timestamp("mute_end_time"),
  muteReason: text("mute_reason"),
  isVisible: boolean("is_visible").default(true),
  isOnline: boolean("is_online").default(false),
  lastSeen: timestamp("last_seen").defaultNow(),
  activityPoints: integer("activity_points").default(0), // Activity points for automatic rank progression
  rating: doublePrecision("rating").default(0),
  transactionsCount: integer("transactions_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User ranks - allows multiple ranks per user (up to 10)
export const userRanks = pgTable("user_ranks", {
  userId: integer("user_id").notNull().references(() => users.id),
  rankId: integer("rank_id").notNull().references(() => ranks.id),
  isActive: boolean("is_active").default(true), // Whether this rank is currently displayed
  assignedBy: integer("assigned_by").references(() => users.id), // Who assigned this rank
  assignedAt: timestamp("assigned_at").defaultNow(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.rankId] }),
  };
});

// Chats table
export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").notNull().references(() => users.id),
  user2Id: integer("user2_id").notNull().references(() => users.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").notNull().references(() => chats.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Listing categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  creatorId: integer("creator_id").references(() => users.id),
  approved: boolean("approved").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Marketplace listings
export const listings = pgTable("listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price"),
  images: text("images").array(),
  categoryId: integer("category_id").references(() => categories.id),
  listingType: text("listing_type").notNull(), // "product", "service", "job", "resume"
  condition: text("condition"), // "new", "used" - for products only
  employmentType: text("employment_type"), // "full-time", "part-time", "contract" - for jobs only
  salary: jsonb("salary"), // { min: number, max: number, period: "hour"|"month"|"year" }
  experience: text("experience"), // For jobs and resumes
  views: integer("views").default(0),
  status: text("status").default("active"), // "active", "sold", "cancelled"
  createdAt: timestamp("created_at").defaultNow(),
});

// Transactions
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => listings.id),
  buyerId: integer("buyer_id").notNull().references(() => users.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  status: text("status").default("pending"), // "pending", "completed", "cancelled", "disputed"
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Events
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  organizerId: integer("organizer_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventType: text("event_type").notNull(), // "online", "offline"
  category: text("category").notNull(),
  location: text("location"),
  date: timestamp("date").notNull(),
  image: text("image"),
  participantsCount: integer("participants_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Event participants
export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blog posts
export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  image: text("image"),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Videos
export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  authorId: integer("author_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnail: text("thumbnail"),
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema types
export const insertRankSchema = createInsertSchema(ranks).omit({
  id: true,
  createdAt: true,
});

export const insertUserRankSchema = createInsertSchema(userRanks).omit({
  assignedAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  activityPoints: true,
  rating: true,
  transactionsCount: true,
  createdAt: true,
  lastSeen: true,
});

export const insertChatSchema = createInsertSchema(chats).omit({
  id: true,
  lastMessageAt: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  read: true,
  createdAt: true,
});

export const insertListingSchema = createInsertSchema(listings).omit({
  id: true,
  views: true,
  status: true,
  createdAt: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  participantsCount: true,
  createdAt: true,
});

export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  views: true,
  likes: true,
  comments: true,
  createdAt: true,
});

export const insertVideoSchema = createInsertSchema(videos).omit({
  id: true,
  views: true,
  likes: true,
  comments: true,
  createdAt: true,
});

export type InsertRank = z.infer<typeof insertRankSchema>;
export type Rank = typeof ranks.$inferSelect;

export type InsertUserRank = z.infer<typeof insertUserRankSchema>;
export type UserRank = typeof userRanks.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertChat = z.infer<typeof insertChatSchema>;
export type Chat = typeof chats.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof listings.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type Video = typeof videos.$inferSelect;
