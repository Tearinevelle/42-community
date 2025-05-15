import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import EventCard from "@/components/home/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

export default function Events() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [eventType, setEventType] = useState("all");
  const [category, setCategory] = useState("all");
  const [viewMode, setViewMode] = useState("upcoming");

  // Set page title
  useEffect(() => {
    document.title = "Сеть - Сходки | Универсальная социальная платформа";
  }, []);

  // Fetch upcoming events
  const { data: upcomingEvents, isLoading: upcomingLoading } = useQuery({
    queryKey: ['/api/events/upcoming'],
  });

  // Fetch past events
  const { data: pastEvents, isLoading: pastLoading } = useQuery({
    queryKey: ['/api/events/past'],
  });

  // Fetch my events
  const { data: myEvents, isLoading: myEventsLoading } = useQuery({
    queryKey: ['/api/events/user'],
    enabled: isAuthenticated,
  });

  // Mutation for joining events
  const participateMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest('POST', `/api/events/${eventId}/participate`);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate events queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/events/upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/past'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events/user'] });
      
      toast({
        title: "Успешно!",
        description: "Вы присоединились к мероприятию",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось присоединиться к мероприятию",
        variant: "destructive",
      });
    }
  });

  const handleParticipate = (eventId: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Требуется авторизация",
        description: "Войдите через Telegram, чтобы присоединиться к мероприятию",
        variant: "destructive",
      });
      return;
    }
    
    participateMutation.mutate(eventId);
  };

  // Empty arrays for when the API doesn't have data yet
  const sampleUpcomingEvents: any[] = [];
  const samplePastEvents: any[] = [];

  // Use actual data or sample data if none available
  const displayUpcomingEvents = upcomingEvents?.length > 0 ? upcomingEvents : sampleUpcomingEvents;
  const displayPastEvents = pastEvents?.length > 0 ? pastEvents : samplePastEvents;
  const displayMyEvents = myEvents?.length > 0 ? myEvents : [];

  // Get events based on view mode
  const getEventsForCurrentView = () => {
    switch (viewMode) {
      case "past":
        return displayPastEvents;
      case "my":
        return displayMyEvents;
      case "upcoming":
      default:
        return displayUpcomingEvents;
    }
  };

  // Filter events based on search and filters
  const filteredEvents = getEventsForCurrentView().filter(event => {
    // Search term filter
    const matchesSearch = searchTerm === "" || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Event type filter
    const matchesType = eventType === "all" || event.eventType === eventType;
    
    // Category filter
    const matchesCategory = category === "all" || event.category === category;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // Get unique categories from events
  const uniqueCategories = Array.from(
    new Set([...displayUpcomingEvents, ...displayPastEvents].map(event => event.category))
  );

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Сходки</h1>
        <p className="text-gray-400">
          Участвуйте в интересных мероприятиях или создавайте свои собственные
        </p>
      </div>

      {/* Tabs for view modes */}
      <Tabs defaultValue="upcoming" className="mb-6" onValueChange={setViewMode}>
        <TabsList className="bg-card w-full justify-start">
          <TabsTrigger value="upcoming" className="flex-1 sm:flex-none">Предстоящие</TabsTrigger>
          <TabsTrigger value="past" className="flex-1 sm:flex-none">Прошедшие</TabsTrigger>
          <TabsTrigger value="my" className="flex-1 sm:flex-none">Мои сходки</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search and filters */}
      <div className="bg-card rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Input
              placeholder="Поиск мероприятий..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-500"></i>
          </div>
          <Select value={eventType} onValueChange={setEventType}>
            <SelectTrigger className="md:w-[150px] w-full">
              <SelectValue placeholder="Тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все типы</SelectItem>
              <SelectItem value="online">Онлайн</SelectItem>
              <SelectItem value="offline">Офлайн</SelectItem>
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="md:w-[150px] w-full">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все категории</SelectItem>
              {uniqueCategories.map((cat, index) => (
                <SelectItem key={index} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Create event button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          {filteredEvents.length} {filteredEvents.length === 1 ? 'мероприятие' : 
           filteredEvents.length > 1 && filteredEvents.length < 5 ? 'мероприятия' : 'мероприятий'}
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-secondary hover:bg-secondary/90">
              <i className="fas fa-plus mr-2"></i>
              Создать мероприятие
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card text-foreground">
            <DialogHeader>
              <DialogTitle>Создание мероприятия</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <p className="text-gray-400">
                Чтобы создать мероприятие, пожалуйста, войдите через Telegram
              </p>
              {/* Telegram login button would go here for non-authenticated users */}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Events grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onParticipate={handleParticipate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <i className="fas fa-calendar-xmark text-6xl text-gray-500 mb-4"></i>
          <h3 className="text-xl font-semibold mb-2">Мероприятия не найдены</h3>
          <p className="text-gray-400 mb-4">
            {viewMode === "my" ? 
              "Вы пока не участвуете ни в одном мероприятии" : 
              "Попробуйте изменить параметры поиска или фильтры"}
          </p>
          {viewMode === "my" ? (
            <Button className="bg-secondary hover:bg-secondary/90">
              Найти мероприятия
            </Button>
          ) : (
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setEventType("all");
                setCategory("all");
              }}
            >
              Сбросить фильтры
            </Button>
          )}
        </div>
      )}
    </>
  );
}
