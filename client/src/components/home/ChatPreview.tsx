import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { formatMessageTime, cn } from "@/lib/utils";

interface ChatMessage {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  read: boolean;
  createdAt: string;
  sender: {
    id: number;
    displayName: string;
    avatar: string | null;
    isOnline: boolean;
  };
}

interface ChatPreviewProps {
  chats: {
    id: number;
    otherUser: {
      id: number;
      displayName: string;
      avatar: string | null;
      isOnline: boolean;
    };
    lastMessage?: {
      content: string;
      createdAt: string;
      read: boolean;
      senderId: number;
    };
  }[];
  unreadCount: number;
}

export default function ChatPreview({ chats, unreadCount }: ChatPreviewProps) {
  const sampleChats: any[] = [];

  // Use actual data or sample data if none available
  const displayChats = chats?.length > 0 ? chats : sampleChats;
  const displayUnreadCount = unreadCount > 0 ? unreadCount : 5;

  return (
    <div className="gradient-border">
      <div className="bg-muted p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Последние сообщения</h3>
          {displayUnreadCount > 0 && (
            <span className="bg-secondary text-white text-xs rounded-full px-2 py-1">
              {displayUnreadCount} новых
            </span>
          )}
        </div>
        
        <div className="space-y-4">
          {/* Chat message items */}
          {displayChats.map((chat) => {
            const isUnread = chat.lastMessage && !chat.lastMessage.read;
            
            return (
              <Link key={chat.id} href={`/chat/${chat.id}`}>
                <a className={cn(
                  "flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer",
                  isUnread ? "bg-secondary/10" : ""
                )}>
                  <div className="relative">
                    <img 
                      src={chat.otherUser.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=50&h=50"} 
                      alt={chat.otherUser.displayName} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span className={cn(
                      "absolute bottom-0 right-0 w-3 h-3 border-2 border-muted rounded-full",
                      chat.otherUser.isOnline ? "bg-green-500" : "bg-gray-500"
                    )}></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-white truncate">{chat.otherUser.displayName}</h4>
                      {chat.lastMessage && (
                        <span className="text-xs text-gray-400">
                          {formatMessageTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="text-sm text-gray-400 truncate">{chat.lastMessage.content}</p>
                    )}
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
        
        <Link href="/chat">
          <Button variant="outline" className="w-full mt-4 py-3 border border-secondary text-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors">
            Все сообщения
          </Button>
        </Link>
      </div>
    </div>
  );
}
