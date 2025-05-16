import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import BlogPost from "@/components/home/BlogPost";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatTimeSince } from "@/lib/utils";

export default function Blog() {
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [newTag, setNewTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [userAddedTags, setUserAddedTags] = useState<string[]>([]);

  // Set page title
  useEffect(() => {
    document.title = "42-коммьюнити - Блог | Место безопасного общения";
  }, []);

  // Fetch blog posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['/api/blog'],
  });

  // Use actual data from API
  const displayPosts = posts || [];

  // Add custom tag handler
  const handleAddTag = () => {
    if (newTag.trim() && !userAddedTags.includes(newTag.trim()) && !uniqueTags.includes(newTag.trim())) {
      setUserAddedTags([...userAddedTags, newTag.trim()]);
      setNewTag("");
    }
  };

  // Toggle tag selection
  const toggleTagSelection = (tag: string) => {
    setSelectedTags(prevTags => 
      prevTags.includes(tag) 
        ? prevTags.filter(t => t !== tag) 
        : [...prevTags, tag]
    );
  };

  // Get unique tags from posts and combine with user-added tags
  const uniqueTags = Array.from(
    new Set([
      ...displayPosts.flatMap(post => post.tags || []),
      ...userAddedTags
    ])
  );

  // Filter posts based on search and category
  const filteredPosts = displayPosts.filter(post => {
    // Search term filter
    const matchesSearch = searchTerm === "" || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory = category === "all" || post.tags.includes(category);

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold mb-4">Блог</h1>
        {!isAuthenticated ? (
          <div className="flex items-center gap-2">
            <i className="fas fa-info-circle text-secondary"></i>
            <span className="text-sm text-gray-500">Чтобы выложить статью, войдите через Telegram</span>
            <div id="blog-login-button"></div>
          </div>
        ) : (
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary/90 md:w-auto w-full">
                <i className="fas fa-plus mr-2"></i>
                Добавить пост
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card text-foreground">
              <DialogHeader>
                <DialogTitle>Создание статьи</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <form className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">Заголовок</label>
                      <Input id="title" placeholder="Введите заголовок статьи" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="content" className="text-sm font-medium">Содержание</label>
                      <textarea 
                        id="content" 
                        rows={5} 
                        className="w-full p-2 rounded-md border bg-muted resize-none"
                        placeholder="Введите текст статьи"
                      ></textarea>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="tags" className="text-sm font-medium">Категории</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {uniqueTags.map((tag, index) => (
                          <Button 
                            key={index} 
                            variant="outline" 
                            size="sm" 
                            type="button"
                            className={`cursor-pointer ${selectedTags.includes(tag) ? 'bg-secondary text-white' : ''}`}
                            onClick={() => toggleTagSelection(tag)}
                          >
                            {tag}
                            {selectedTags.includes(tag) && <i className="fas fa-check ml-2"></i>}
                          </Button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input 
                          id="newTag" 
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)} 
                          placeholder="Добавить новую категорию" 
                          className="flex-1" 
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        />
                        <Button type="button" variant="outline" onClick={handleAddTag}>
                          <i className="fas fa-plus mr-2"></i>
                          Добавить
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400">
                        Вы можете выбрать существующие категории или создать свои
                      </p>
                    </div>
                    <Button className="w-full bg-secondary hover:bg-secondary/90">
                      Опубликовать
                    </Button>
                  </form>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and filters */}
      <div className="bg-card rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Input
              placeholder="Поиск в блоге..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-500"></i>
          </div>

        </div>
        <div className="flex flex-wrap gap-2">
          <Tabs defaultValue="all" className="w-full" onValueChange={(val) => setCategory(val)}>
            <TabsList className="w-full h-auto flex flex-wrap bg-transparent overflow-x-auto">
              <TabsTrigger value="all" className="data-[state=active]:bg-secondary data-[state=active]:text-white">
                Все категории
              </TabsTrigger>
              {uniqueTags.map((tag, index) => (
                <TabsTrigger
                  key={index}
                  value={tag}
                  className="data-[state=active]:bg-secondary data-[state=active]:text-white"
                >
                  {tag}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Posts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 xl:col-span-1 space-y-6">
          <h2 className="text-xl font-semibold">Последние публикации</h2>

          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <BlogPost key={post.id} post={post} />
            ))
          ) : (
            <div className="text-center py-12 bg-card rounded-lg">
              <i className="fas fa-newspaper text-6xl text-gray-500 mb-4"></i>
              <h3 className="text-xl font-semibold mb-2">Публикации не найдены</h3>
              <p className="text-gray-400 mb-4">
                Попробуйте изменить параметры поиска или выбрать другую категорию
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setCategory("all");
                }}
              >
                Сбросить фильтры
              </Button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden xl:block space-y-6">
          {/* Popular authors */}
          <Card className="bg-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Популярные авторы</h3>
              <div className="space-y-4">
                {Array.from(new Set(displayPosts.map(post => post.author.id))).map((authorId) => {
                  const author = displayPosts.find(post => post.author.id === authorId)?.author;
                  if (!author) return null;

                  const authorPosts = displayPosts.filter(post => post.author.id === authorId);
                  const totalViews = authorPosts.reduce((sum, post) => sum + post.views, 0);

                  return (
                    <div key={authorId} className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={author.avatar || ""} alt={author.displayName} />
                        <AvatarFallback>{author.displayName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{author.displayName}</div>
                        <div className="text-sm text-gray-400">{authorPosts.length} статей • {totalViews} просмотров</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Popular tags */}
          <Card className="bg-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Популярные темы</h3>
              <div className="flex flex-wrap gap-2">
                {uniqueTags.map((tag, index) => {
                  const tagPosts = displayPosts.filter(post => post.tags.includes(tag));

                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className={category === tag ? "bg-secondary text-white" : ""}
                      onClick={() => setCategory(tag)}
                    >
                      {tag} ({tagPosts.length})
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Popular posts */}
          <Card className="bg-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Популярные статьи</h3>
              <div className="space-y-4">
                {[...displayPosts]
                  .sort((a, b) => b.views - a.views)
                  .slice(0, 3)
                  .map((post) => (
                    <div key={post.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                        <img 
                          src={post.image || ""} 
                          alt={post.title} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2">{post.title}</h4>
                        <div className="text-xs text-gray-400 mt-1">
                          {post.views} просмотров • {formatTimeSince(post.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}