// Telegram authentication utility functions

// Type definition for Telegram auth data
export interface TelegramAuthData {
  id: string; // Telegram user ID
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface UserRegistrationData {
  displayName: string;
  username: string;
  gender: 'male' | 'female' | 'other';
  telegramData: TelegramAuthData;
}

export const registerUser = async (data: UserRegistrationData) => {
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Registration failed");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Function to initiate Telegram login by redirecting to the bot
export const initTelegramLogin = (
  botName: string,
  elementId: string,
  callback: (user: TelegramAuthData) => void
) => {
  // Ссылка на бота
  const botUrl = `https://t.me/${botName}`;
  
  // Создаем и добавляем скрипт для Telegram Login Widget
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.setAttribute('data-telegram-login', botName);
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-radius', '8');
  script.setAttribute('data-onauth', 'onTelegramAuth(user)');
  script.setAttribute('data-request-access', 'write');
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.setAttribute('data-telegram-login', botName);
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-radius', '8');
  script.setAttribute('data-request-access', 'write');
  script.setAttribute('data-userpic', 'false');
  script.setAttribute('data-lang', 'ru');
  script.async = true;

  // Добавляем обработчик для callback
  (window as any).onTelegramAuth = (user: TelegramAuthData) => {
    callback(user);
  };

  // Добавляем скрипт в контейнер
  const container = document.getElementById(elementId);
  if (container) {
    container.innerHTML = ''; // Очищаем контейнер
    container.appendChild(script);
  }
};

// Function to login with Telegram data
export const loginWithTelegram = async (authData: TelegramAuthData) => {
  try {
    const response = await fetch("/api/auth/telegram", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        telegramId: authData.id,
        username: authData.username || `telegram${authData.id}`,
        displayName: [authData.first_name, authData.last_name].filter(Boolean).join(" "),
        avatar: authData.photo_url,
      }),
      credentials: "include",
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Authentication failed");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Telegram login error:", error);
    throw error;
  }
};

// Function to logout
export const logout = async () => {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Logout failed");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

// Check authentication status
export const checkAuthStatus = async () => {
  try {
    const response = await fetch("/api/auth/status", {
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Failed to check authentication status");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Auth status check error:", error);
    throw error;
  }
};
