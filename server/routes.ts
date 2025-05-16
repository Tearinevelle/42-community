import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { WebSocketServer } from "ws";
import { WebSocket } from "ws";
import { z } from "zod";
import { insertUserSchema, insertChatSchema, insertMessageSchema, insertListingSchema, insertEventSchema, insertBlogPostSchema, insertVideoSchema, insertRankSchema, insertUserRankSchema } from "@shared/schema";
import session from "express-session";
import MemoryStore from "memorystore";
import passport from "passport";
import { randomBytes } from "crypto";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";

const SessionStore = MemoryStore(session);

// Настройка хранилища для загрузки файлов
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Определяем папку назначения в зависимости от типа файла
    const destFolder = file.fieldname === 'profileImage' ? 'uploads/avatars' : 'uploads/banners';
    cb(null, destFolder);
  },
  filename: function (req, file, cb) {
    // Уникальное имя файла с сохранением расширения
    const uniqueName = nanoid(10) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// Фильтр файлов - разрешаем только изображения
const fileFilter = (req: any, file: any, cb: any) => {
  if (
    file.mimetype === 'image/jpeg' || 
    file.mimetype === 'image/png' || 
    file.mimetype === 'image/gif' ||
    file.mimetype === 'image/webp'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Неподдерживаемый формат файла. Разрешены только JPEG, PNG, GIF и WebP.'), false);
  }
};

const upload = multer({ 
  storage: multerStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB максимальный размер
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Настройка статических файлов для загрузок
  app.use('/uploads', express.static('uploads'));
  
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
      const user = await dbStorage.getUser(id);
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

  // Wallet routes
  app.get("/api/wallet", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const wallet = await dbStorage.getUserWallet(userId);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallet", error });
    }
  });

  app.get("/api/wallet/transactions", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const status = req.query.status as string;
      const type = req.query.type as string;
      
      const transactions = await dbStorage.getWalletTransactions(userId, status, type);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions", error });
    }
  });

  app.post("/api/wallet/withdraw", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const { amount, method } = req.body;
      
      const transaction = await dbStorage.createWithdrawal(userId, amount, method);
      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to create withdrawal", error });
    }
  });

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

      let user = await dbStorage.getUserByTelegramId(telegramId);

      if (!user) {
        // Create new user
        user = await dbStorage.createUser({
          telegramId,
          username,
          displayName,
          avatar: avatar || null,
          isOnline: true,
          role: telegramId === "1182231717" ? "owner" : "user",
        });
      } else {
        // Update online status
        await dbStorage.updateUserOnlineStatus(user.id, true);
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
      dbStorage.updateUserOnlineStatus(userId, false);
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
      const popularUsers = await dbStorage.getPopularUsers(limit);
      res.json(popularUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular users", error });
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await dbStorage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user", error });
    }
  });
  
  // Обновление профиля пользователя с загрузкой файлов
  app.put(
    "/api/user/profile",
    isAuthenticated,
    upload.fields([
      { name: "profileImage", maxCount: 1 },
      { name: "bannerImage", maxCount: 1 }
    ]),
    async (req, res) => {
      try {
        const userId = (req.user as any).id;
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        // Получаем данные для обновления профиля
        const updateData: any = {
          displayName: req.body.displayName,
          bio: req.body.bio,
          gender: req.body.gender,
          bannerColor: req.body.bannerColor,
        };
        
        // Если был загружен аватар, сохраняем путь к нему
        if (files.profileImage && files.profileImage[0]) {
          const avatarPath = files.profileImage[0].path;
          updateData.avatar = `/${avatarPath}`;
        }
        
        // Если был загружен баннер, создаем CSS-градиент или сохраняем путь к изображению
        if (files.bannerImage && files.bannerImage[0]) {
          const bannerPath = files.bannerImage[0].path;
          // Сохраняем путь к баннеру в отдельном поле
          updateData.bannerImage = `/${bannerPath}`;
        }
        
        // Обновляем профиль
        const updatedUser = await dbStorage.updateUserProfile(userId, updateData);
        
        res.json(updatedUser);
      } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Failed to update profile", error });
      }
    }
  );

  // Chats
  app.get("/api/chats", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).id;
      const userChats = await dbStorage.getUserChats(userId);
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

      const chat = await dbStorage.createChat(result.data);
      res.status(201).json(chat);
    } catch (error) {
      res.status(500).json({ message: "Failed to create chat", error });
    }
  });

  app.get("/api/chats/:id/messages", isAuthenticated, async (req, res) => {
    try {
      const chatId = parseInt(req.params.id);
      const userId = (req.user as any).id;

      const messages = await dbStorage.getChatMessages(chatId);

      // Mark messages as read
      await dbStorage.markMessagesAsRead(chatId, userId);

      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages", error });
    }
  });

  // Marketplace
  app.get("/api/listings/popular", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 4;
      const listings = await dbStorage.getPopularListings(limit);
      res.json(listings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listings", error });
    }
  });

  app.get("/api/listings/:id", async (req, res) => {
    try {
      const listing = await dbStorage.getListing(parseInt(req.params.id));
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }

      // Increment view count
      await dbStorage.updateListingViews(listing.id);

      res.json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch listing", error });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await dbStorage.getCategories();
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
      
      const category = await dbStorage.createCategory({
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
      await dbStorage.approveCategory(categoryId);
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

      const listing = await dbStorage.createListing(result.data);
      res.status(201).json(listing);
    } catch (error) {
      res.status(500).json({ message: "Failed to create listing", error });
    }
  });

  // Events
  app.get("/api/events/upcoming", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const events = await dbStorage.getUpcomingEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events", error });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await dbStorage.getEvent(parseInt(req.params.id));
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

      const event = await dbStorage.createEvent(result.data);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to create event", error });
    }
  });

  app.post("/api/events/:id/participate", isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const userId = (req.user as any).id;

      await dbStorage.participateInEvent(eventId, userId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to join event", error });
    }
  });

  // Blog
  app.get("/api/blog/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 2;
      const posts = await dbStorage.getRecentBlogPosts(limit);
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

      const post = await dbStorage.createBlogPost(result.data);
      res.status(201).json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to create blog post", error });
    }
  });

  // Videos
  app.get("/api/videos/recent", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 4;
      const videos = await dbStorage.getRecentVideos(limit);
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

      const video = await dbStorage.createVideo(result.data);
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
      const users = await dbStorage.getAllUsers(offset, limit);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error });
    }
  });
  
  // Admin - get all ranks
  app.get("/api/admin/ranks", isAdmin, async (req, res) => {
    try {
      const ranks = await dbStorage.getAllRanks();
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
      
      const rank = await dbStorage.createRank(result.data);
      res.status(201).json(rank);
    } catch (error) {
      res.status(500).json({ message: "Failed to create rank", error });
    }
  });
  
  // Admin - get user ranks
  app.get("/api/admin/users/:id/ranks", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userRanks = await dbStorage.getUserRanks(userId);
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
      
      await dbStorage.assignRankToUser(result.data);
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
      
      await dbStorage.removeRankFromUser(userId, rankId);
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
      
      await dbStorage.updateUserPrimaryRank(userId, rank);
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
      
      await dbStorage.addActivityPoints(userId, points);
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
      
      const targetUser = await dbStorage.getUser(userId);
      
      // Владелец не может быть изменен
      if (targetUser?.role === "owner") {
        return res.status(403).json({ message: "Cannot modify owner's role" });
      }
      
      // Только владелец может назначать админов
      if (role === "admin" && (req.user as any).role !== "owner") {
        return res.status(403).json({ message: "Only owner can promote to admin" });
      }

      await dbStorage.updateUserRole(userId, role);
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
      
      const targetUser = await dbStorage.getUser(userId);
      
      // Нельзя банить владельца или администраторов
      if (targetUser?.role === "owner" || targetUser?.role === "admin") {
        return res.status(403).json({ message: "Cannot ban owner or admin" });
      }

      await dbStorage.banUser(userId, reason);
      res.json({ message: "User banned successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to ban user", error });
    }
  });
  
  // Admin - unban user
  app.post("/api/admin/users/:id/unban", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await dbStorage.unbanUser(userId);
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
      
      const targetUser = await dbStorage.getUser(userId);
      
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Нельзя мутить владельца или администраторов
      if (targetUser.role === "owner" || targetUser.role === "admin") {
        return res.status(403).json({ message: "Cannot mute owner or admin" });
      }

      const muteEndTime = new Date(Date.now() + duration * 1000);
      await dbStorage.muteUser(userId, muteEndTime, reason);
      
      res.json({ message: "User muted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mute user", error });
    }
  });
  
  // Admin - unmute user
  app.post("/api/admin/users/:id/unmute", isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await dbStorage.unmuteUser(userId);
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

          const newMessage = await dbStorage.sendMessage({
            chatId: validatedData.chatId,
            senderId: userId,
            content: validatedData.content
          });

          // Get the full message with sender info
          const [messageFull] = await dbStorage.getChatMessages(newMessage.chatId);

          // Get chat to determine recipient
          const chats = await dbStorage.getUserChats(userId);
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
        dbStorage.updateUserOnlineStatus(userId, false);
      }
    });
  });

  return httpServer;
}