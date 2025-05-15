import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { TelegramAuthData, checkAuthStatus, loginWithTelegram, logout } from "@/lib/telegram";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  telegramId: string;
  displayName: string;
  avatar: string | null;
  gender?: string;
  bannerColor: string;
  bio: string | null;
  rank: string;
  role: string; // "owner", "admin", "moderator", "user"
  isBanned?: boolean;
  banReason?: string | null;
  isMuted?: boolean;
  muteEndTime?: string | null;
  muteReason?: string | null;
  isVisible?: boolean;
  isOnline: boolean;
  lastSeen: string | null;
  activityPoints?: number;
  rating: number;
  transactionsCount: number;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (authData: TelegramAuthData) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true);
        const authStatus = await checkAuthStatus();
        if (authStatus.isAuthenticated && authStatus.user) {
          setUser(authStatus.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to check auth status:", error);
        toast({
          title: "Ошибка аутентификации",
          description: "Не удалось проверить статус авторизации",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [toast]);

  const handleLogin = async (authData: TelegramAuthData) => {
    try {
      setIsLoading(true);
      const userData = await loginWithTelegram(authData);
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Ошибка входа",
        description: "Не удалось выполнить вход через Telegram",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Ошибка выхода",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login: handleLogin,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
