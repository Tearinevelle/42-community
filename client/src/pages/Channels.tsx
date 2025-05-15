import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function Channels() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");

  // Set page title
  useEffect(() => {
    document.title = "42-коммьюнити - Каналы | Место безопасного общения";
  }, []);

  // Определяем категории
  const categories = ["Все", "Важное", "42-СЕСТРУХИ", "42-БРАТУХИ", "Сквады", "Новости"];

  // Примеры каналов для демонстрации
  const channels = [];

  // Фильтрация каналов по категории и поисковому запросу
  const filteredChannels = channels.filter(channel => 
    (category === "all" || channel.category === category) &&
    (searchTerm === "" || 
      channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Каналы</h1>
        <p className="text-gray-400">
          Следите за обновлениями, важными новостями и сообщениями сообщества
        </p>
      </div>

      {/* Search and filters */}
      <div className="bg-card rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Input
              placeholder="Поиск каналов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-500"></i>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-secondary hover:bg-secondary/90 md:w-auto w-full">
                <i className="fas fa-plus mr-2"></i>
                Добавить канал
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card text-foreground">
              <DialogHeader>
                <DialogTitle>Добавление канала</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    // Здесь будет логика отправки запроса администраторам
                    toast({
                      description: "Ваша заявка отправлена на рассмотрение администраторам",
                    });
                  }}>
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">Название канала</label>
                      <Input id="name" placeholder="Введите название канала" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium">Юзернейм канала</label>
                      <Input id="username" placeholder="Например: @mychannel" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="link" className="text-sm font-medium">Ссылка на канал</label>
                      <Input id="link" placeholder="https://t.me/..." required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="avatar" className="text-sm font-medium">Аватарка канала</label>
                      <Input id="avatar" type="file" accept="image/*" className="bg-muted" />
                    </div>
                    <Button className="w-full bg-secondary hover:bg-secondary/90">
                      Отправить на рассмотрение
                    </Button>
                  </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-wrap gap-2">
          <Tabs defaultValue="all" className="w-full" onValueChange={(val) => setCategory(val)}>
            <TabsList className="w-full h-auto flex flex-wrap bg-transparent overflow-x-auto">
              {categories.map((cat, index) => (
                <TabsTrigger
                  key={index}
                  value={index === 0 ? "all" : cat}
                  className="data-[state=active]:bg-secondary data-[state=active]:text-white"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Channels list */}
      <div className="space-y-4">
        {filteredChannels.length > 0 ? (
          <div className="grid gap-4">
            {filteredChannels.map((channel) => (
              <Card key={channel.id} className="overflow-hidden border-0 bg-card hover:bg-accent/5 transition-colors">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-4 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold hover:text-secondary transition-colors">
                          {channel.name}
                        </h3>
                        {channel.isOfficial && (
                          <span className="bg-secondary/20 text-secondary text-xs rounded-full px-2 py-0.5">
                            Официальный
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{channel.description}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <i className="fas fa-users"></i> {channel.subscribersCount.toLocaleString()} подписчиков
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-file-alt"></i> {channel.postsCount} публикаций
                        </span>
                        <span className="flex items-center gap-1">
                          <i className="fas fa-history"></i> Активность: {channel.lastActive}
                        </span>
                        <span className="flex items-center gap-1 bg-card/50 rounded-full px-2 py-0.5">
                          <i className="fas fa-tag"></i> {channel.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 md:w-48 flex flex-col gap-2 bg-muted rounded-tr-lg rounded-br-lg">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => window.open(channel.externalLink, '_blank')}
                      >
                        <i className="fas fa-eye mr-2"></i> Просмотр
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <i className="fas fa-bullhorn text-6xl text-gray-500 mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">Каналы не найдены</h3>
            <p className="text-gray-400 mb-4">
              {category !== "all" 
                ? `В категории "${category}" пока нет каналов` 
                : searchTerm 
                  ? "По вашему запросу ничего не найдено" 
                  : "На данный момент нет доступных каналов"}
            </p>
            <Button 
              variant="outline"
              onClick={() => {
                setCategory("all");
                setSearchTerm("");
              }}
            >
              {category !== "all" || searchTerm ? "Сбросить фильтры" : "Создать первый канал"}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}