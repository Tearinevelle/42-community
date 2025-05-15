import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { cn, getUserStatusText } from "@/lib/utils";
import { userRankColors } from "@/lib/constants";

interface UserProfileCardProps {
  user: {
    id: number;
    displayName: string;
    username: string;
    avatar: string | null;
    bannerColor: string;
    isOnline: boolean;
    lastSeen: string | null;
    rank: string;
    transactionsCount: number;
    rating: number;
  };
}

export default function UserProfileCard({ user }: UserProfileCardProps) {
  const statusText = getUserStatusText(user.isOnline, user.lastSeen || undefined);
  const rankColorClass = userRankColors[user.rank as keyof typeof userRankColors] || "text-gray-500";
  
  return (
    <div className="gradient-border">
      <div className="bg-muted rounded-lg overflow-hidden">
        <div className={`h-20 bg-gradient-to-r ${user.bannerColor}`}></div>
        <div className="p-5 relative">
          <div className="absolute -top-10 left-5">
            <img 
              src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"} 
              alt={user.displayName} 
              className="w-16 h-16 rounded-full border-4 border-muted object-cover"
            />
          </div>
          <div className="mt-8">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-bold">{user.displayName}</h3>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <span className={cn(
                    "w-2 h-2 rounded-full mr-2",
                    user.isOnline ? "bg-green-500" : "bg-gray-500"
                  )}></span>
                  <span>{statusText}</span>
                  <span className="mx-2">•</span>
                  <span className={rankColorClass}>{user.rank}</span>
                </div>
              </div>
              <button className="text-secondary hover:bg-secondary/10 rounded-full p-2 transition-colors">
                <i className="fas fa-user-plus"></i>
              </button>
            </div>
            <div className="flex items-center mt-3 space-x-4 text-sm">
              <div>
                <span className="text-gray-400">Сделки:</span>
                <span className="ml-1 font-medium">{user.transactionsCount}</span>
              </div>
              <div>
                <span className="text-gray-400">Рейтинг:</span>
                <span className="ml-1 font-medium">{user.rating.toFixed(1)}/5</span>
              </div>
            </div>
            <Link href={`/chat/new?user=${user.id}`}>
              <Button variant="outline" className="w-full mt-4 py-2 border border-secondary text-secondary rounded-lg hover:bg-secondary hover:text-white transition-colors">
                Написать
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
