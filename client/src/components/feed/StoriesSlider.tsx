import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Story, User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface StoryWithUser extends Story {
  user: User;
}

const StoriesSlider = () => {
  const { user, isAuthenticated } = useAuth();
  const [storyImage, setStoryImage] = useState<File | null>(null);
  const [storyImagePreview, setStoryImagePreview] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch stories
  const { data: stories = [] } = useQuery<StoryWithUser[]>({
    queryKey: ['/api/stories'],
    queryFn: async () => {
      const response = await fetch('/api/stories');
      if (!response.ok) throw new Error('Failed to fetch stories');
      return response.json();
    }
  });

  // Create story mutation
  const storyMutation = useMutation({
    mutationFn: async () => {
      if (!storyImage) throw new Error('No image selected');
      
      const formData = new FormData();
      formData.append('image', storyImage);
      
      const response = await fetch('/api/stories', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to create story');
      return response.json();
    },
    onSuccess: () => {
      setStoryImage(null);
      setStoryImagePreview(null);
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      toast({
        title: 'История создана',
        description: 'Ваша история успешно опубликована',
      });
    },
    onError: (error) => {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать историю. Пожалуйста, попробуйте снова.',
        variant: 'destructive'
      });
      console.error(error);
    }
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStoryImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setStoryImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyImage) {
      toast({
        title: 'Ошибка',
        description: 'Выберите изображение для истории',
        variant: 'destructive'
      });
      return;
    }
    
    storyMutation.mutate();
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setStoryImage(null);
      setStoryImagePreview(null);
    }
  };

  // Group stories by user
  const userStories: Record<string, StoryWithUser[]> = {};
  stories.forEach(story => {
    if (!userStories[story.userId]) {
      userStories[story.userId] = [];
    }
    userStories[story.userId].push(story);
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading font-semibold">Истории</h3>
        <button className="text-primary-600 dark:text-primary-400 text-sm">
          Все <i className="ri-arrow-right-s-line"></i>
        </button>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
        {/* Create story */}
        {isAuthenticated && (
          <div className="flex flex-col items-center w-20 shrink-0">
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <button className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-1 flex items-center justify-center relative group cursor-pointer">
                  <PlusCircle className="text-xl text-primary-600 dark:text-primary-400 h-6 w-6 z-10" />
                  <Avatar className="w-16 h-16 absolute inset-0 opacity-70 group-hover:opacity-40 transition-opacity">
                    <AvatarImage src={user?.profileImageUrl || ""} alt={user?.username || ""} />
                    <AvatarFallback>{user ? (user.username || user.firstName || "?").slice(0, 1) : "?"}</AvatarFallback>
                  </Avatar>
                </button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-xl font-semibold">Создать историю</h2>
                  
                  {storyImagePreview ? (
                    <div className="relative">
                      <img
                        src={storyImagePreview}
                        alt="Preview"
                        className="w-full h-[350px] object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setStoryImage(null);
                          setStoryImagePreview(null);
                        }}
                      >
                        Удалить
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-[350px]">
                      <label className="cursor-pointer text-center p-4">
                        <PlusCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Нажмите, чтобы загрузить изображение
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  )}
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={!storyImage || storyMutation.isPending}
                    >
                      {storyMutation.isPending ? "Создание..." : "Создать историю"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            <span className="text-xs">Создать</span>
          </div>
        )}
        
        {/* User stories */}
        {Object.entries(userStories).map(([userId, stories]) => {
          const story = stories[0]; // Get first story to display user
          return (
            <div key={userId} className="flex flex-col items-center w-20 shrink-0">
              <div className="w-16 h-16 rounded-full mb-1 relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 p-0.5">
                  <Avatar className="w-full h-full rounded-full border-2 border-white dark:border-gray-800">
                    <AvatarImage src={story.user.profileImageUrl || ""} alt={story.user.username || ""} />
                    <AvatarFallback>{(story.user.username || story.user.firstName || "?").slice(0, 1)}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <span className="text-xs truncate w-full text-center">
                {story.user.username || story.user.firstName || "Пользователь"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoriesSlider;
