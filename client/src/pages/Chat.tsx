import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn, getUserStatusText, formatMessageTime } from "@/lib/utils";
import { useLocation, useParams } from "wouter";

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const params = useParams();
  const [activeChat, setActiveChat] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Set page title
  useEffect(() => {
    document.title = "42-коммьюнити - Общение и знакомства | Место безопасного общения";
  }, []);

  // Check if we need to open a specific chat from URL
  useEffect(() => {
    const chatId = location.startsWith("/chat/") ? parseInt(location.replace("/chat/", "")) : null;
    if (chatId && !isNaN(chatId)) {
      setActiveChat(chatId);
    }
  }, [location]);

  // Fetch user's chats
  const { data: chats, isLoading: chatsLoading } = useQuery({
    queryKey: ['/api/chats'],
    enabled: isAuthenticated,
  });
  
  // Fetch messages for active chat
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chats', activeChat, 'messages'],
    enabled: !!activeChat && isAuthenticated,
  });

  // Scroll to bottom of messages
  useEffect(() => {
    if (messages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // WebSocket setup for real-time messaging
  useEffect(() => {
    if (isAuthenticated && user) {
      // Clear any existing connections
      if (socket) {
        socket.close();
      }

      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      console.log("Connecting to WebSocket at:", wsUrl);
      
      let ws: WebSocket;
      try {
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log("WebSocket connection established");
          // Authenticate the WebSocket connection
          ws.send(JSON.stringify({
            type: 'auth',
            userId: user.id
          }));
        };
        
        ws.onmessage = (event) => {
          console.log("WebSocket message received:", event.data);
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'new_message') {
              // Add new message to the chat
              queryClient.invalidateQueries({ queryKey: ['/api/chats', data.message.chatId, 'messages'] });
              queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
              
              // Show notification if not in the active chat
              if (activeChat !== data.message.chatId) {
                toast({
                  title: `Новое сообщение от ${data.message.sender.displayName}`,
                  description: data.message.content,
                });
              }
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        ws.onclose = (event) => {
          console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
          // Attempt to reconnect after a delay if the connection was closed unexpectedly
          if (event.code !== 1000) { // 1000 is normal closure
            setTimeout(() => {
              if (isAuthenticated && user) {
                console.log("Attempting to reconnect to WebSocket...");
                // The useEffect will handle reconnection
              }
            }, 3000);
          }
        };
        
        setSocket(ws);
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
      }
      
      // Cleanup on unmount
      return () => {
        if (ws) {
          ws.close(1000, "Component unmounted");
        }
      };
    }
  }, [isAuthenticated, user, toast]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!activeChat || !message.trim()) return;
      
      // Send via WebSocket for real-time delivery
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'message',
          chatId: activeChat,
          content: message.trim()
        }));
      } else {
        // Fallback to REST API if WebSocket is not available
        await apiRequest('POST', `/api/chats/${activeChat}/messages`, {
          content: message.trim()
        });
      }
    },
    onSuccess: () => {
      setMessage("");
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/chats', activeChat, 'messages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chats'] });
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    }
  });

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessageMutation.mutate();
    }
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <i className="fas fa-comments text-6xl text-secondary mb-4"></i>
        <h1 className="text-2xl font-bold mb-2">Чаты недоступны</h1>
        <p className="text-gray-400 mb-6">Войдите через Telegram, чтобы получить доступ к чатам</p>
        <div id="chat-login-button">
          <Button className="bg-secondary hover:bg-secondary/90">
            <i className="fab fa-telegram-plane mr-2"></i>
            Войти через Telegram
          </Button>
        </div>
      </div>
    );
  }

  // Define types for chats and messages
  interface ChatWithUser {
    id: number;
    otherUser: {
      id: number;
      displayName: string;
      avatar: string | null;
      isOnline: boolean;
      lastSeen: string | null;
    };
    lastMessage?: {
      content: string;
      createdAt: string;
      read: boolean;
      senderId: number;
    };
  }
  
  interface MessageWithSender {
    id: number;
    chatId: number;
    content: string;
    createdAt: string;
    read: boolean;
    senderId: number;
    sender: {
      id: number;
      displayName: string;
      avatar: string | null;
    };
  }
  
  // Empty arrays for when the API doesn't have data yet
  const sampleChats: ChatWithUser[] = [];

  // Empty messages array when no messages are available
  const sampleMessages: MessageWithSender[] = [];

  // Use actual data or sample data if none available
  const displayChats: ChatWithUser[] = (chats?.length > 0 ? chats : sampleChats) as ChatWithUser[];
  const displayMessages: MessageWithSender[] = (messages?.length > 0 ? messages : sampleMessages) as MessageWithSender[];

  return (
    <div className="flex h-[calc(100vh-9rem)] md:h-[calc(100vh-11rem)] overflow-hidden">
      {/* Chats sidebar */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 border-r border-gray-800 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Сообщения</h2>
            <Button variant="outline" size="icon">
              <i className="fas fa-plus"></i>
            </Button>
          </div>
          <div className="relative mb-4">
            <Input
              placeholder="Поиск чатов..."
              className="pl-10 bg-muted"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-500"></i>
          </div>
          <div className="space-y-2">
            {displayChats.map((chat: ChatWithUser) => {
              const isActive = activeChat === chat.id;
              const isUnread = chat.lastMessage && !chat.lastMessage.read;
              
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                    isActive ? "bg-secondary/20" : isUnread ? "bg-muted" : "hover:bg-muted"
                  )}
                  onClick={() => {
                    setActiveChat(chat.id);
                    setLocation(`/chat/${chat.id}`);
                  }}
                >
                  <div className="relative">
                    <img 
                      src={chat.otherUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50"} 
                      alt={chat.otherUser.displayName} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <span className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 border-2 border-background rounded-full",
                      chat.otherUser.isOnline ? "bg-green-500" : "bg-gray-500"
                    )}></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-white truncate">{chat.otherUser.displayName}</h4>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {formatMessageTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <p className="text-sm text-gray-400 truncate">
                        {chat.lastMessage?.content || "Нет сообщений"}
                      </p>
                      {isUnread && (
                        <span className="w-2 h-2 bg-secondary rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="hidden md:flex flex-col flex-1 overflow-hidden">
        {activeChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-800 flex items-center">
              {displayChats.map((chat: ChatWithUser) => {
                if (chat.id === activeChat) {
                  return (
                    <div key={chat.id} className="flex items-center">
                      <img 
                        src={chat.otherUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50"} 
                        alt={chat.otherUser.displayName} 
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <h3 className="font-medium">{chat.otherUser.displayName}</h3>
                        <div className="text-xs text-gray-400 flex items-center">
                          <span className={cn(
                            "w-2 h-2 rounded-full mr-2",
                            chat.otherUser.isOnline ? "bg-green-500" : "bg-gray-500"
                          )}></span>
                          <span>{getUserStatusText(chat.otherUser.isOnline, chat.otherUser.lastSeen)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
              <div className="ml-auto flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <i className="fas fa-phone"></i>
                </Button>
                <Button variant="ghost" size="icon">
                  <i className="fas fa-video"></i>
                </Button>
                <Button variant="ghost" size="icon">
                  <i className="fas fa-ellipsis-v"></i>
                </Button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {displayMessages.map((msg) => {
                const isOwnMessage = msg.senderId === user?.id;
                
                return (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex",
                      isOwnMessage ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className="flex max-w-[80%]">
                      {!isOwnMessage && (
                        <img 
                          src={msg.sender.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50"} 
                          alt={msg.sender.displayName} 
                          className="w-8 h-8 rounded-full object-cover mr-2 mt-1"
                        />
                      )}
                      <div>
                        <div 
                          className={cn(
                            "p-3 rounded-lg",
                            isOwnMessage 
                              ? "bg-secondary text-white rounded-tr-none" 
                              : "bg-muted text-white rounded-tl-none"
                          )}
                        >
                          {msg.content}
                        </div>
                        <div 
                          className={cn(
                            "text-xs text-gray-400 mt-1",
                            isOwnMessage ? "text-right" : "text-left"
                          )}
                        >
                          {formatMessageTime(msg.createdAt)}
                          {isOwnMessage && (
                            <span className="ml-2">
                              {msg.read ? (
                                <i className="fas fa-check-double text-blue-400"></i>
                              ) : (
                                <i className="fas fa-check"></i>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input area */}
            <div className="p-4 border-t border-gray-800">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon">
                  <i className="fas fa-paperclip"></i>
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="bg-muted"
                />
                <Button 
                  type="submit" 
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </form>
              <div className="mt-2 text-xs text-gray-500">
                <i className="fas fa-shield-alt mr-1"></i>
                Все сообщения защищены. Не переходите на общение в других мессенджерах.
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 text-center">
            <div>
              <i className="fas fa-comments text-6xl text-gray-600 mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Выберите чат</h3>
              <p className="text-gray-400 max-w-md">
                Выберите существующий чат или начните новую беседу, нажав на кнопку "+" в списке чатов
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile selected chat view */}
      <div className="md:hidden flex flex-col flex-1 overflow-hidden">
        {activeChat ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-800 flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="mr-2"
                onClick={() => {
                  setActiveChat(null);
                  setLocation('/chat');
                }}
              >
                <i className="fas fa-arrow-left"></i>
              </Button>
              {displayChats.map((chat) => {
                if (chat.id === activeChat) {
                  return (
                    <div key={chat.id} className="flex items-center">
                      <img 
                        src={chat.otherUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50"} 
                        alt={chat.otherUser.displayName} 
                        className="w-8 h-8 rounded-full object-cover mr-2"
                      />
                      <div>
                        <h3 className="font-medium">{chat.otherUser.displayName}</h3>
                        <div className="text-xs text-gray-400">
                          {getUserStatusText(chat.otherUser.isOnline, chat.otherUser.lastSeen)}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })}
              <div className="ml-auto">
                <Button variant="ghost" size="icon">
                  <i className="fas fa-ellipsis-v"></i>
                </Button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {displayMessages.map((msg) => {
                const isOwnMessage = msg.senderId === user?.id;
                
                return (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex",
                      isOwnMessage ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className="flex max-w-[80%]">
                      {!isOwnMessage && (
                        <img 
                          src={msg.sender.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50"} 
                          alt={msg.sender.displayName} 
                          className="w-8 h-8 rounded-full object-cover mr-2 mt-1"
                        />
                      )}
                      <div>
                        <div 
                          className={cn(
                            "p-3 rounded-lg",
                            isOwnMessage 
                              ? "bg-secondary text-white rounded-tr-none" 
                              : "bg-muted text-white rounded-tl-none"
                          )}
                        >
                          {msg.content}
                        </div>
                        <div 
                          className={cn(
                            "text-xs text-gray-400 mt-1",
                            isOwnMessage ? "text-right" : "text-left"
                          )}
                        >
                          {formatMessageTime(msg.createdAt)}
                          {isOwnMessage && (
                            <span className="ml-2">
                              {msg.read ? (
                                <i className="fas fa-check-double text-blue-400"></i>
                              ) : (
                                <i className="fas fa-check"></i>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input area */}
            <div className="p-4 border-t border-gray-800">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon">
                  <i className="fas fa-paperclip"></i>
                </Button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Введите сообщение..."
                  className="bg-muted"
                />
                <Button 
                  type="submit" 
                  disabled={!message.trim() || sendMessageMutation.isPending}
                  className="bg-secondary hover:bg-secondary/90"
                >
                  <i className="fas fa-paper-plane"></i>
                </Button>
              </form>
            </div>
          </>
        ) : (
          // Return to chat list in mobile view
          <div></div>
        )}
      </div>
    </div>
  );
}
