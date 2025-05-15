import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Post, User } from "@shared/schema";
import PostCreator from "@/components/feed/PostCreator";
import StoriesSlider from "@/components/feed/StoriesSlider";
import PostCard from "@/components/feed/PostCard";
import MarketplacePreview from "@/components/marketplace/MarketplacePreview";
import EventsPreview from "@/components/events/EventsPreview";
import VideosPreview from "@/components/videos/VideosPreview";
import { Skeleton } from "@/components/ui/skeleton";

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(0);
  const pageSize = 5;
  
  // Fetch posts with pagination
  const { data: posts = [], isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useQuery<(Post & { user: User })[]>({
    queryKey: ['/api/posts', { limit: pageSize, offset: page * pageSize }],
    queryFn: async () => {
      const res = await fetch(`/api/posts?limit=${pageSize}&offset=${page * pageSize}`);
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
    keepPreviousData: true,
  });

  const loadMorePosts = () => {
    setPage(prevPage => prevPage + 1);
  };

  // Mobile-only tab navigation
  const tabs = [
    { id: "feed", label: "Лента", active: true },
    { id: "marketplace", label: "Маркетплейс", active: false },
    { id: "events", label: "Мероприятия", active: false },
    { id: "videos", label: "Видео", active: false, badge: "Новое" },
  ];

  return (
    <>
      {/* Mobile-only tab navigation */}
      <div className="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-dark">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`flex-1 px-4 py-3 font-medium ${
                tab.active 
                  ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              } text-center relative`}
            >
              {tab.label}
              {tab.badge && (
                <span className="ml-1 text-xs font-semibold bg-accent-100 dark:bg-accent-900 text-accent-600 dark:text-accent-300 py-0.5 px-1.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Creation (only for authenticated users) */}
            {isAuthenticated && <PostCreator />}
            
            {/* Stories */}
            <StoriesSlider />
            
            {/* Feed Posts */}
            {isLoading ? (
              // Skeleton loading for posts
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-64 w-full rounded-xl" />
                </div>
              ))
            ) : posts.length > 0 ? (
              <>
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
                
                {hasNextPage && (
                  <div className="text-center">
                    <button 
                      onClick={loadMorePosts}
                      disabled={isFetchingNextPage}
                      className="px-4 py-2 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      {isFetchingNextPage ? "Загрузка..." : "Показать больше"}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 text-center">
                <h3 className="text-lg font-medium mb-2">Нет доступных постов</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Будьте первым, кто создаст пост!
                </p>
              </div>
            )}
          </div>
          
          {/* Right Column */}
          <div className="space-y-6 hidden lg:block">
            {/* Marketplace Preview */}
            <MarketplacePreview />
            
            {/* Events Preview */}
            <EventsPreview />
            
            {/* Featured Videos */}
            <VideosPreview />
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
