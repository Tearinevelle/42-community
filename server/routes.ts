import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { z } from "zod";
import { insertUserSchema, insertChatSchema, insertMessageSchema, insertListingSchema, insertEventSchema, insertBlogPostSchema, insertVideoSchema, insertRankSchema, insertUserRankSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { randomBytes } from "crypto";

const SessionStore = MemoryStore(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(
    session({
      secret: process.env.SESSION_SECRET || randomBytes(32).toString("hex"),
      resave: false,
      saveUninitialized: false,
      cookie: { secure: process.env.NODE_ENV === "production", maxAge: 86400000 }, // 1 day
      store: new SessionStore({
        checkPeriod: 86400000, // 24 hours
      }),
    })
  );

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize/deserialize user
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Admin middleware
  const isAdmin = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && ((req.user as any).role === "admin" || (req.user as any).role === "owner")) {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };
  
  // Owner middleware (only the owner can perform certain actions)
  const isOwner = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && (req.user as any).role === "owner") {
      return next();
    }
    res.status(403).json({ message: "Forbidden" });
  };

  // API Routes
  // Auth
  app.post("/api/auth/telegram", async (req, res) => {
    try {
      const { telegramId, username, displayName, avatar } = req.body;

      if (!telegramId || !username || !displayName) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // В продакшене здесь должна быть проверка данных Telegram, но для тестирования оставим так
      // В реальном приложении нужно проверить хеш с использованием секретного токена

      let user = await storage.getUserByTelegramId(telegramId);

      if (!user) {
        // Create new user
        user = await storage.createUser({
          telegramId,
          username,
          displayName,
          avatar: avatar || null,
          isOnline: true,
          role: telegramId === "1182231717" ? "owner" : "user",
        });
      } else {
        // Update online status
        await storage.updateUserOnlineStatus(user.id, true);
      }

      // Log user in
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Login failed", error: err });
        }
        return res.json(user);
      });
    } catch (error) {
      res.status(500).json({ message: "Authentication failed", error });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    if (req.user) {
      const userId = (req.user as any).id;
      storage.updateUserOnlineStatus(userId, false);
    }
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed", error: err });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ isAuthenticated: true, user: req.user });
    } else {
      res.json({ isAuthenticated: false });
    }
  });

  // Users
  app.get("/api/users/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const popularUsers = await storage.getPopularUsers(limit);
      res.json(popularUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular users", error });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error });
    }
  });

  // Chats
  app.get("/api/chats", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const userChats = await storage.getUserChats(userId);
      res.json(userChats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chats", error });
    }
  });

  app.post("/api/chats", isAuthenticated, async (req, res) => {
    try {
      const result = insertChatSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request", errors: result.error.errors });
      }

      const chat = await storage.createChat(result.data);
      res.status(201).json(chat);
    } catch (error) {
      res.status(500).json({ message: "Failed to create chat", error });
    }
  });

  app.get("/api/chats/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const userId = (req.user as any).id;

      const messages = await storage.getChatMessages(chatId);

      // Mark messages as read
      await storage.markMessagesAsRead(chatId, userId);

      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages", error });
    }
  });

  // Marketplace
  app.get("/api/listings/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 4;
      const listings = await storage.getPopularListings(limit);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listings", error });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await storage.getListing(parseInt(req.params.id));
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      // Increment view count
      await storage.updateListingViews(listing.id);

      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listing", error });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories", error });
    }
  });

  app.post("/api/categories", isAuthenticated, async (req, res) => {
    try {
      const { name, slug } = req.body;
      const userId = (req.user as any).id;
      
      // Auto-approve if owner
      const isOwner = (req.user as any).telegramId === "1182231717";
      
      const category = await storage.createCategory({
        name,
        slug,
        creatorId: userId,
        approved: isOwner
      });
      
      res.status(201).json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category", error });
    }
  });

  app.post("/api/categories/:id/approve", isAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      await storage.approveCategory(categoryId);
      res.json({ message: "Category approved" });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve category", error });
    }
  });

  // Listings
  app.post("/api/listings", isAuthenticated, async (req, res) => {
    try {
      const result = insertListingSchema.safeParse({
        ...req.body,
        sellerId: (req.user as any).id
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid request", errors: result.error.errors });
      }

      const listing = await storage.createListing(result.data);
      res.status(201).json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to create listing", error });
    }
  });

  // Events
  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const events = await storage.getUpcomingEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events", error });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(parseInt(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event", error });
    }
  });

  app.post("/api/events", isAuthenticated, async (req, res) => {
    try {
      const result = insertEventSchema.safeParse({
        ...req.body,
        organizerId: (req.user as any).id
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid request", errors: result.error.errors });
      }

      const event = await storage.createEvent(result.data);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to create event", error });
    }
  });

  app.post("/api/events/:id/participate", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = (req.user as any).id;

      await storage.participateInEvent(eventId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to join event", error });
    }
  });

  // Blog
  app.get("/api/blog/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 2;
      const posts = await storage.getRecentBlogPosts(limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch blog posts", error });
    }
  });

  app.post("/api/blog", isAuthenticated, async (req, res) => {
    try {
      const result = insertBlogPostSchema.safeParse({
        ...req.body,
        authorId: (req.user as any).id
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid request", errors: result.error.errors });
      }

      const post = await storage.createBlogPost(result.data);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create blog post", error });
    }
  });

  // Videos
  app.get("/api/videos/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 4;
      const videos = await storage.getRecentVideos(limit);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch videos", error });
    }
  });

  app.post("/api/videos", isAuthenticated, async (req, res) => {
    try {
      const result = insertVideoSchema.safeParse({
        ...req.body,
        authorId: (req.user as any).id
      });

      if (!result.success) {
        return res.status(400).json({ message: "Invalid request", errors: result.error.errors });
      }

      const video = await storage.createVideo(result.data);
      res.status(201).json(video);
    } catch (error) {
      res.status(500).json({ message: "Failed to create video", error });
    }
  });

  // Admin - get all users
  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const offset = parseInt(req.query.offset as string) || 0;
      const limit = parseInt(req.query.limit as string) || 50;
      const users = await storage.getAllUsers(offset, limit);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error });
    }
  });
  
  // Admin - get all ranks
  app.get("/api/admin/ranks", isAdmin, async (req, res) => {
    try {
      const ranks = await storage.getAllRanks();
      res.json(ranks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ranks", error });
    }
  });
  
  // Admin - create new rank
  app.post("/api/admin/ranks", isAdmin, async (req, res) => {
    try {
      const adminId = (req.user as any).id;
      const result = insertRankSchema.safeParse({
        ...req.body,
        createdBy: adminId
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request", errors: result.error.errors });
      }
      
      const rank = await storage.createRank(result.data);
      res.status(201).json(rank);
    } catch (error) {
      res.status(500).json({ message: "Failed to create rank", error });
    }
  });
  
  // Admin - get user ranks
  app.get("/api/admin/users/:id/ranks", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userRanks = await storage.getUserRanks(userId);
      res.json(userRanks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user ranks", error });
    }
  });
  
  // Admin - assign rank to user
  app.post("/api/admin/users/:id/ranks", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { rankId, isActive } = req.body;
      const adminId = (req.user as any).id;
      
      const result = insertUserRankSchema.safeParse({
        userId,
        rankId,
        isActive: isActive !== undefined ? isActive : true,
        assignedBy: adminId
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "Invalid request", errors: result.error.errors });
      }
      
      await storage.assignRankToUser(result.data);
      res.json({ message: "Rank assigned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to assign rank", error });
    }
  });
  
  // Admin - remove rank from user
  app.delete("/api/admin/users/:userId/ranks/:rankId", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const rankId = parseInt(req.params.rankId);
      
      await storage.removeRankFromUser(userId, rankId);
      res.json({ message: "Rank removed successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove rank", error });
    }
  });
  
  // Admin - update user's primary rank
  app.post("/api/admin/users/:id/primary-rank", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { rank } = req.body;
      
      if (!rank) {
        return res.status(400).json({ message: "Rank is required" });
      }
      
      await storage.updateUserPrimaryRank(userId, rank);
      res.json({ message: "Primary rank updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update primary rank", error });
    }
  });
  
  // Add activity points to user (for testing rank progression)
  app.post("/api/admin/users/:id/add-activity", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { points } = req.body;
      
      if (!points || isNaN(points)) {
        return res.status(400).json({ message: "Valid points value is required" });
      }
      
      await storage.addActivityPoints(userId, points);
      res.json({ message: "Activity points added successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add activity points", error });
    }
  });

  // Admin - user role management
  app.post("/api/admin/users/:id/promote", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { role } = req.body;
      
      if (!role || !['user', 'moderator', 'admin'].includes(role)) {
        return res.status(400).json({ message: "Valid role is required (user, moderator, admin)" });
      }
      
      const targetUser = await storage.getUser(userId);
      
      // Владелец не может быть изменен
      if (targetUser?.role === "owner") {
        return res.status(403).json({ message: "Cannot modify owner's role" });
      }
      
      // Только владелец может назначать админов
      if (role === "admin" && (req.user as any).role !== "owner") {
        return res.status(403).json({ message: "Only owner can promote to admin" });
      }

      await storage.updateUserRole(userId, role);
      res.json({ message: `User role updated to ${role}` });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user role", error });
    }
  });

  // Admin - ban user
  app.post("/api/admin/users/:id/ban", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { reason } = req.body;
      
      if (!reason) {
        return res.status(400).json({ message: "Ban reason is required" });
      }
      
      const targetUser = await storage.getUser(userId);
      
      // Нельзя банить владельца или администраторов
      if (targetUser?.role === "owner" || targetUser?.role === "admin") {
        return res.status(403).json({ message: "Cannot ban owner or admin" });
      }

      await storage.banUser(userId, reason);
      res.json({ message: "User banned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to ban user", error });
    }
  });
  
  // Admin - unban user
  app.post("/api/admin/users/:id/unban", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.unbanUser(userId);
      res.json({ message: "User unbanned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unban user", error });
    }
  });

  // Admin - mute user
  app.post("/api/admin/users/:id/mute", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { duration, reason } = req.body;
      
      if (!duration || isNaN(duration) || !reason) {
        return res.status(400).json({ message: "Duration (in seconds) and reason are required" });
      }
      
      const targetUser = await storage.getUser(userId);
      
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Нельзя мутить владельца или администраторов
      if (targetUser.role === "owner" || targetUser.role === "admin") {
        return res.status(403).json({ message: "Cannot mute owner or admin" });
      }

      const muteEndTime = new Date(Date.now() + duration * 1000);
      await storage.muteUser(userId, muteEndTime, reason);
      
      res.json({ message: "User muted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mute user", error });
    }
  });
  
  // Admin - unmute user
  app.post("/api/admin/users/:id/unmute", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.unmuteUser(userId);
      res.json({ message: "User unmuted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to unmute user", error });
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Map to store WebSocket connections by user ID
  const clients = new Map<number, WebSocket>();

  wss.on('connection', (ws: WebSocket) => {
    let userId: number | null = null;

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);

        if (data.type === 'auth') {
          userId = typeof data.userId === 'number' ? data.userId : null;
          if (userId !== null) {
            clients.set(userId, ws);
          }
        } else if (data.type === 'message' && userId) {
          const messageSchema = z.object({
            chatId: z.number(),
            content: z.string().min(1)
          });

          const validatedData = messageSchema.parse(data);

          const newMessage = await storage.sendMessage({
            chatId: validatedData.chatId,
            senderId: userId,
            content: validatedData.content
          });

          // Get the full message with sender info
          const [messageFull] = await storage.getChatMessages(newMessage.chatId);

          // Get chat to determine recipient
          const chats = await storage.getUserChats(userId);
          const chat = chats.find(c => c.id === newMessage.chatId);

          if (chat) {
            const recipientId = chat.otherUser.id;

            // Send to recipient if online
            const recipientWs = clients.get(recipientId);
            if (recipientWs && recipientWs.readyState === WebSocket.OPEN) {
              recipientWs.send(JSON.stringify({
                type: 'new_message',
                message: messageFull
              }));
            }

            // Send confirmation to sender
            ws.send(JSON.stringify({
              type: 'message_sent',
              message: messageFull
            }));
          }
        }
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
        storage.updateUserOnlineStatus(userId, false);
      }
    });
  });

  return httpServer;
}