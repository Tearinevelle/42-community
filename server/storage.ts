import { 
  User, InsertUser, 
  Chat, InsertChat, 
  Message, InsertMessage,
  Listing, InsertListing,
  Event, InsertEvent,
  BlogPost, InsertBlogPost,
  Video, InsertVideo,
  Rank, InsertRank,
  UserRank, InsertUserRank,
  eventParticipants, categories,
  users, chats, messages, listings, events, blogPosts, videos, ranks, userRanks
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sql, count, not } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getAllUsers(offset?: number, limit?: number): Promise<User[]>;
  updateUserRole(id: number, role: string): Promise<void>;
  updateUserProfile(id: number, updateData: Partial<User>): Promise<User>;
  banUser(id: number, reason: string): Promise<void>;
  unbanUser(id: number): Promise<void>;
  muteUser(id: number, muteEndTime: Date, reason: string): Promise<void>;
  unmuteUser(id: number): Promise<void>;
  updateUserPrimaryRank(id: number, rank: string): Promise<void>;
  addActivityPoints(id: number, points: number): Promise<void>;
  getUserByTelegramId(telegramId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void>;
  getPopularUsers(limit: number): Promise<User[]>;
  
  // Ranks
  getAllRanks(): Promise<Rank[]>;
  getRank(id: number): Promise<Rank | undefined>;
  createRank(rank: InsertRank): Promise<Rank>;
  assignRankToUser(userRank: InsertUserRank): Promise<void>;
  removeRankFromUser(userId: number, rankId: number): Promise<void>;
  getUserRanks(userId: number): Promise<(UserRank & { rank: Rank })[]>;
  
  // Chats & Messages
  createChat(chat: InsertChat): Promise<Chat>;
  getUserChats(userId: number): Promise<(Chat & { otherUser: User, lastMessage?: Message })[]>;
  getChatMessages(chatId: number): Promise<(Message & { sender: User })[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(chatId: number, userId: number): Promise<void>;
  
  // Marketplace
  createListing(listing: InsertListing): Promise<Listing>;
  getListing(id: number): Promise<(Listing & { seller: User }) | undefined>;
  getPopularListings(limit: number): Promise<(Listing & { seller: User })[]>;
  updateListingViews(id: number): Promise<void>;
  
  // Events
  createEvent(event: InsertEvent): Promise<Event>;
  getEvent(id: number): Promise<(Event & { organizer: User }) | undefined>;
  getUpcomingEvents(limit: number): Promise<(Event & { organizer: User })[]>;
  participateInEvent(eventId: number, userId: number): Promise<void>;
  
  // Blog
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  getRecentBlogPosts(limit: number): Promise<(BlogPost & { author: User })[]>;
  
  // Videos
  createVideo(video: InsertVideo): Promise<Video>;
  getRecentVideos(limit: number): Promise<(Video & { author: User })[]>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getAllUsers(offset: number = 0, limit: number = 50): Promise<User[]> {
    return db.select()
      .from(users)
      .orderBy(desc(users.createdAt))
      .offset(offset)
      .limit(limit);
  }

  async getUserByTelegramId(telegramId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.telegramId, telegramId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserOnlineStatus(id: number, isOnline: boolean): Promise<void> {
    await db.update(users)
      .set({ 
        isOnline, 
        lastSeen: isOnline ? undefined : new Date() 
      })
      .where(eq(users.id, id));
  }

  async updateUserRole(id: number, role: string): Promise<void> {
    await db.update(users)
      .set({ role })
      .where(eq(users.id, id));
  }
  
  async updateUserProfile(id: number, updateData: Partial<User>): Promise<User> {
    // Исключаем критичные поля, которые нельзя менять здесь
    const { id: _, role, isBanned, banReason, isMuted, muteEndTime, muteReason, activityPoints, rating, transactionsCount, createdAt, ...safeUpdateData } = updateData as any;
    
    // Обновляем профиль пользователя
    await db.update(users)
      .set(safeUpdateData)
      .where(eq(users.id, id));
    
    // Получаем обновленные данные пользователя
    const user = await this.getUser(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return user;
  }

  async banUser(id: number, reason: string): Promise<void> {
    await db.update(users)
      .set({ 
        isBanned: true,
        banReason: reason
      })
      .where(eq(users.id, id));
  }

  async unbanUser(id: number): Promise<void> {
    await db.update(users)
      .set({ 
        isBanned: false,
        banReason: null
      })
      .where(eq(users.id, id));
  }

  async muteUser(id: number, muteEndTime: Date, reason: string): Promise<void> {
    await db.update(users)
      .set({ 
        isMuted: true,
        muteEndTime,
        muteReason: reason
      })
      .where(eq(users.id, id));
  }

  async unmuteUser(id: number): Promise<void> {
    await db.update(users)
      .set({ 
        isMuted: false,
        muteEndTime: null,
        muteReason: null
      })
      .where(eq(users.id, id));
  }

  async updateUserPrimaryRank(id: number, rank: string): Promise<void> {
    await db.update(users)
      .set({ rank })
      .where(eq(users.id, id));
  }

  async addActivityPoints(id: number, points: number): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (!user) return;
    
    const currentPoints = user.activityPoints || 0;
    const newActivityPoints = currentPoints + points;
    
    // Update activity points
    await db.update(users)
      .set({ 
        activityPoints: newActivityPoints 
      })
      .where(eq(users.id, id));
    
    // Get system ranks for automatic progression
    const systemRanks = await db.select()
      .from(ranks)
      .where(eq(ranks.isSystem, true))
      .orderBy(asc(ranks.level));
    
    // Find the appropriate rank based on activity points
    let newRank = user.rank;
    
    // Determine the highest rank level the user qualifies for
    const qualifiedRanks = systemRanks.filter(r => {
      // Extract the gender tag from rank metadata if it exists
      const rankGender = (r as any).gender;
      
      // Level 4 ranks depend on gender
      if (r.level === 4) {
        return rankGender === user.gender && newActivityPoints >= 100;
      }
      
      // Other ranks depend only on activity points
      switch (r.level) {
        case 1: return newActivityPoints >= 0;   // "Чебоксарец"
        case 2: return newActivityPoints >= 25;  // "Чебоксарец +"
        case 3: return newActivityPoints >= 50;  // "Начинающий 42"
        default: return false;
      }
    });
    
    // Get the highest qualified rank
    if (qualifiedRanks.length > 0) {
      const highestRank = qualifiedRanks.reduce((prev, current) => {
        const prevLevel = prev.level || 0;
        const currentLevel = current.level || 0;
        return (prevLevel > currentLevel) ? prev : current;
      });
      
      newRank = highestRank.name;
    }
    
    // Update the user's primary rank if it's different
    if (newRank && user.rank !== newRank) {
      await this.updateUserPrimaryRank(id, newRank);
    }
  }

  async getPopularUsers(limit: number): Promise<User[]> {
    return db.select()
      .from(users)
      .orderBy(desc(users.rating), desc(users.transactionsCount))
      .limit(limit);
  }

  // Ranks
  async getAllRanks(): Promise<Rank[]> {
    return db.select().from(ranks).orderBy(asc(ranks.name));
  }

  async getRank(id: number): Promise<Rank | undefined> {
    const [rank] = await db.select().from(ranks).where(eq(ranks.id, id));
    return rank;
  }

  async createRank(rank: InsertRank): Promise<Rank> {
    const [newRank] = await db.insert(ranks).values(rank).returning();
    return newRank;
  }

  async assignRankToUser(userRank: InsertUserRank): Promise<void> {
    // Check if user already has 10 ranks
    const existingRanks = await db.select()
      .from(userRanks)
      .where(eq(userRanks.userId, userRank.userId));
    
    if (existingRanks.length >= 10) {
      throw new Error("Пользователь уже имеет максимальное количество званий (10)");
    }
    
    // Check if user already has this rank
    const [existing] = await db.select()
      .from(userRanks)
      .where(
        and(
          eq(userRanks.userId, userRank.userId),
          eq(userRanks.rankId, userRank.rankId)
        )
      );
    
    if (existing) {
      // Just update isActive status if rank already assigned
      await db.update(userRanks)
        .set({ 
          isActive: userRank.isActive,
          assignedBy: userRank.assignedBy
        })
        .where(
          and(
            eq(userRanks.userId, userRank.userId),
            eq(userRanks.rankId, userRank.rankId)
          )
        );
    } else {
      // Otherwise insert new rank
      await db.insert(userRanks).values(userRank);
    }
    
    // If this rank is active, fetch it and update user's primary rank
    if (userRank.isActive) {
      const [rank] = await db.select().from(ranks).where(eq(ranks.id, userRank.rankId));
      if (rank) {
        await this.updateUserPrimaryRank(userRank.userId, rank.name);
      }
    }
  }

  async removeRankFromUser(userId: number, rankId: number): Promise<void> {
    // Delete the rank assignment
    await db.delete(userRanks)
      .where(
        and(
          eq(userRanks.userId, userId),
          eq(userRanks.rankId, rankId)
        )
      );
    
    // Check if this was the active rank
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    const [rank] = await db.select().from(ranks).where(eq(ranks.id, rankId));
    
    // If this was the user's primary rank, reset to default or another active rank
    if (user && rank && user.rank === rank.name) {
      // Find another active rank
      const [activeRankAssignment] = await db.select({
        userRank: userRanks,
        rank: ranks
      })
        .from(userRanks)
        .innerJoin(ranks, eq(userRanks.rankId, ranks.id))
        .where(
          and(
            eq(userRanks.userId, userId),
            eq(userRanks.isActive, true)
          )
        )
        .limit(1);
      
      if (activeRankAssignment) {
        await this.updateUserPrimaryRank(userId, activeRankAssignment.rank.name);
      } else {
        // Default to "Чебоксарец" if no other active rank
        await this.updateUserPrimaryRank(userId, "Чебоксарец");
      }
    }
  }

  async getUserRanks(userId: number): Promise<(UserRank & { rank: Rank })[]> {
    const userRankAssignments = await db.select({
      userRank: userRanks,
      rank: ranks
    })
      .from(userRanks)
      .innerJoin(ranks, eq(userRanks.rankId, ranks.id))
      .where(eq(userRanks.userId, userId));
    
    return userRankAssignments.map(item => ({
      ...item.userRank,
      rank: item.rank
    }));
  }

  // Chats & Messages
  async createChat(chat: InsertChat): Promise<Chat> {
    const [newChat] = await db.insert(chats).values(chat).returning();
    return newChat;
  }

  async getUserChats(userId: number): Promise<(Chat & { otherUser: User, lastMessage?: Message })[]> {
    const userChats = await db.select()
      .from(chats)
      .where(or(eq(chats.user1Id, userId), eq(chats.user2Id, userId)))
      .orderBy(desc(chats.lastMessageAt));
    
    const result: (Chat & { otherUser: User, lastMessage?: Message })[] = [];
    
    for (const chat of userChats) {
      const otherUserId = chat.user1Id === userId ? chat.user2Id : chat.user1Id;
      const [otherUser] = await db.select().from(users).where(eq(users.id, otherUserId));
      
      const [lastMessage] = await db.select()
        .from(messages)
        .where(eq(messages.chatId, chat.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      
      result.push({
        ...chat,
        otherUser,
        lastMessage
      });
    }
    
    return result;
  }

  async getChatMessages(chatId: number): Promise<(Message & { sender: User })[]> {
    const chatMessages = await db.select()
      .from(messages)
      .where(eq(messages.chatId, chatId))
      .orderBy(asc(messages.createdAt));
    
    const result: (Message & { sender: User })[] = [];
    
    for (const message of chatMessages) {
      const [sender] = await db.select().from(users).where(eq(users.id, message.senderId));
      result.push({
        ...message,
        sender
      });
    }
    
    return result;
  }

  async sendMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages).values(message).returning();
    
    await db.update(chats)
      .set({ lastMessageAt: new Date() })
      .where(eq(chats.id, message.chatId));
    
    return newMessage;
  }

  async markMessagesAsRead(chatId: number, userId: number): Promise<void> {
    await db.update(messages)
      .set({ read: true })
      .where(
        and(
          eq(messages.chatId, chatId),
          not(eq(messages.senderId, userId))
        )
      );
  }

  // Marketplace
  async createListing(listing: InsertListing): Promise<Listing> {
    const [newListing] = await db.insert(listings).values(listing).returning();
    return newListing;
  }

  async getListing(id: number): Promise<(Listing & { seller: User }) | undefined> {
    const [listing] = await db.select().from(listings).where(eq(listings.id, id));
    
    if (!listing) return undefined;
    
    const [seller] = await db.select().from(users).where(eq(users.id, listing.sellerId));
    
    return {
      ...listing,
      seller
    };
  }

  async getPopularListings(limit: number): Promise<(Listing & { seller: User })[]> {
    const popularListings = await db.select()
      .from(listings)
      .where(eq(listings.status, "active"))
      .orderBy(desc(listings.views))
      .limit(limit);
    
    const result: (Listing & { seller: User })[] = [];
    
    for (const listing of popularListings) {
      const [seller] = await db.select().from(users).where(eq(users.id, listing.sellerId));
      result.push({
        ...listing,
        seller
      });
    }
    
    return result;
  }

  async updateListingViews(id: number): Promise<void> {
    await db.update(listings)
      .set({
        views: sql`${listings.views} + 1`
      })
      .where(eq(listings.id, id));
  }

  async getCategories(): Promise<any[]> {
    return db.select()
      .from(categories)
      .where(eq(categories.approved, true))
      .orderBy(asc(categories.name));
  }

  async createCategory(category: any): Promise<any> {
    const [newCategory] = await db.insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async approveCategory(id: number): Promise<void> {
    await db.update(categories)
      .set({ approved: true })
      .where(eq(categories.id, id));
  }

  // Events
  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async getEvent(id: number): Promise<(Event & { organizer: User }) | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    
    if (!event) return undefined;
    
    const [organizer] = await db.select().from(users).where(eq(users.id, event.organizerId));
    
    return {
      ...event,
      organizer
    };
  }

  async getUpcomingEvents(limit: number): Promise<(Event & { organizer: User })[]> {
    const now = new Date();
    
    const upcomingEvents = await db.select()
      .from(events)
      .where(sql`${events.date} > ${now}`)
      .orderBy(asc(events.date))
      .limit(limit);
    
    const result: (Event & { organizer: User })[] = [];
    
    for (const event of upcomingEvents) {
      const [organizer] = await db.select().from(users).where(eq(users.id, event.organizerId));
      result.push({
        ...event,
        organizer
      });
    }
    
    return result;
  }

  async participateInEvent(eventId: number, userId: number): Promise<void> {
    // Check if already participating
    const [existing] = await db.select()
      .from(eventParticipants)
      .where(
        and(
          eq(eventParticipants.eventId, eventId),
          eq(eventParticipants.userId, userId)
        )
      );
    
    if (!existing) {
      await db.insert(eventParticipants)
        .values({
          eventId,
          userId
        });
      
      await db.update(events)
        .set({
          participantsCount: sql`${events.participantsCount} + 1`
        })
        .where(eq(events.id, eventId));
    }
  }

  // Blog
  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [newPost] = await db.insert(blogPosts).values(post).returning();
    return newPost;
  }

  async getRecentBlogPosts(limit: number): Promise<(BlogPost & { author: User })[]> {
    const recentPosts = await db.select()
      .from(blogPosts)
      .orderBy(desc(blogPosts.createdAt))
      .limit(limit);
    
    const result: (BlogPost & { author: User })[] = [];
    
    for (const post of recentPosts) {
      const [author] = await db.select().from(users).where(eq(users.id, post.authorId));
      result.push({
        ...post,
        author
      });
    }
    
    return result;
  }

  // Videos
  async createVideo(video: InsertVideo): Promise<Video> {
    const [newVideo] = await db.insert(videos).values(video).returning();
    return newVideo;
  }

  async getRecentVideos(limit: number): Promise<(Video & { author: User })[]> {
    const recentVideos = await db.select()
      .from(videos)
      .orderBy(desc(videos.createdAt))
      .limit(limit);
    
    const result: (Video & { author: User })[] = [];
    
    for (const video of recentVideos) {
      const [author] = await db.select().from(users).where(eq(users.id, video.authorId));
      result.push({
        ...video,
        author
      });
    }
    
    return result;
  }
}

export const storage = new DatabaseStorage();
