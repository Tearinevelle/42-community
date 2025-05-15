// Telegram Bot Name
export const TELEGRAM_BOT_NAME = "Community_42_shop_Bot";

// Navigation items for sidebar
export const navItems = [
  { name: "Главная", path: "/", icon: "home" },
  { name: "Профиль", path: "/profile", icon: "user" },
  { name: "Чаты", path: "/chat", icon: "comments" },
  { name: "Маркетплейс", path: "/marketplace", icon: "store" },
  { name: "Сходки", path: "/events", icon: "calendar" },
  { name: "Блог", path: "/blog", icon: "newspaper" },
  { name: "Каналы", path: "/channels", icon: "bullhorn" },
  { name: "42-tok", path: "/videos", icon: "hashtag" },
];

// Utility navigation items for sidebar
export const utilNavItems = [
  { name: "Настройки", path: "/settings", icon: "cog" },
  { name: "Помощь", path: "/help", icon: "question-circle" },
  {
    name: "Разработчик",
    path: "/developer",
    icon: "code",
    adminOnly: true
  }
];

// User rank colors
export const userRankColors = {
  "Чебоксарец": "text-gray-500",
  "Тетрамолибдат Аммония": "text-purple-500",
  "Специалист": "text-yellow-500",
  "Профессионал": "text-blue-500",
  "Мастер": "text-secondary",
};

// Данные для главной страницы
export const features = [
  {
    icon: "user-friends",
    title: "Профили",
    description: "Создавайте уникальные профили с персонализированным дизайном и зарабатывайте опыт для получения званий"
  },
  {
    icon: "comments",
    title: "Чаты",
    description: "Общайтесь с друзьями, заводите новые знакомства и создавайте групповые чаты в безопасной среде"
  },
  {
    icon: "store",
    title: "Маркетплейс",
    description: "Все платежи проходят через систему эскроу, гарантируя безопасность как для покупателей, так и для продавцов"
  },
  {
    icon: "calendar-alt",
    title: "Сходки",
    description: "Организуйте и участвуйте в онлайн и оффлайн мероприятиях"
  },
  {
    icon: "bullhorn",
    title: "Каналы",
    description: "Следите за обновлениями, важными новостями и сообщениями сообщества"
  },
  {
    icon: "hashtag",
    title: "42-tok",
    description: "Смотрите короткие видео и делитесь контентом с сообществом"
  }
];