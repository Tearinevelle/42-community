import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Event, User } from "@shared/schema";
import EventCard from "@/components/events/EventCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Filter } from "lucide-react";

const EventsPage = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("upcoming");
  const pageSize = 10;

  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [eventType, setEventType] = useState("offline");
  const [game, setGame] = useState("");
  const [customGame, setCustomGame] = useState("");
  const [squads, setSquads] = useState("");
  const [participants, setParticipants] = useState("");

  // Fetch events
  const { data: events = [], isLoading, isFetching } = useQuery<(Event & { user: User })[]>({
    queryKey: ['/api/events', { limit: pageSize, offset: page * pageSize, timeFilter, search: searchQuery }],
    queryFn: async () => {
      let url = `/api/events?limit=${pageSize}&offset=${page * pageSize}`;
      if (timeFilter) {
        url += `&timeFilter=${timeFilter}`;
      }
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    },
    keepPreviousData: true,
  });

  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/events", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      return response.json();
    },
    onSuccess: () => {
      resetForm();
      setIsDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Успех!",
        description: "Ваше мероприятие отправлено на рассмотрение",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать мероприятие",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setDate("");
    setTime("");
    setEventType("offline");
    setGame("");
    setCustomGame("");
    setSquads("");
    setParticipants("");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !location || !date || !time) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("date", date);
    formData.append("time", time);
    formData.append("eventType", eventType);
    formData.append("game", eventType === "online" ? (game === "other" ? customGame : game) : "");
    formData.append("squads", squads);
    formData.append("participants", participants);
    formData.append("status", "pending");

    createEventMutation.mutate(formData);
  };

  const loadMoreEvents = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0); // Reset to first page when searching
  };

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(value);
    setPage(0); // Reset to first page when changing filter
  };


  const queryClient = useQueryClient();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold font-heading">Мероприятия</h1>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Создать мероприятие
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              {!isAuthenticated ? (
                <div className="flex flex-col items-center gap-4 p-6">
                  <i className="fas fa-info-circle text-secondary text-2xl"></i>
                  <p className="text-center">Чтобы создать мероприятие, пожалуйста, войдите через Telegram</p>
                  <div id="events-login-button"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <DialogHeader>
                    <DialogTitle>Создание мероприятия</DialogTitle>
                    <DialogDescription>
                      Заполните информацию о мероприятии
                    </DialogDescription>
                  </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="title">Название мероприятия *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Введите название мероприятия"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Описание *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Опишите ваше мероприятие"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Тип мероприятия *</Label>
                  <RadioGroup value={eventType} onValueChange={setEventType}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="offline" id="offline" />
                      <Label htmlFor="offline">Офлайн</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="online" id="online" />
                      <Label htmlFor="online">Онлайн</Label>
                    </div>
                  </RadioGroup>
                </div>

                {eventType === "online" && (
                  <div className="space-y-2">
                    <Label htmlFor="game">Игра *</Label>
                    <Select value={game} onValueChange={setGame}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите игру" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minecraft">Minecraft</SelectItem>
                        <SelectItem value="roblox">Roblox</SelectItem>
                        <SelectItem value="other">Другая</SelectItem>
                      </SelectContent>
                    </Select>
                    {game === "other" && (
                      <Input
                        placeholder="Укажите игру"
                        value={customGame}
                        onChange={(e) => setCustomGame(e.target.value)}
                        className="mt-2"
                      />
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="location">Место проведения *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={eventType === "online" ? "Ссылка или сервер" : "Адрес места проведения"}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Дата *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Время *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="squads">Участвующие сквады</Label>
                  <Input
                    id="squads"
                    value={squads}
                    onChange={(e) => setSquads(e.target.value)}
                    placeholder="Укажите сквады через запятую"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participants">Уже записавшиеся участники</Label>
                  <Input
                    id="participants"
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    placeholder="Укажите участников через запятую"
                  />
                </div>

                <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createEventMutation.isPending}
                    >
                      {createEventMutation.isPending ? "Отправка..." : "Отправить на рассмотрение"}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Input
                type="text"
                placeholder="Поиск мероприятий..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <Select value={timeFilter} onValueChange={handleTimeFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Время" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Предстоящие</SelectItem>
                <SelectItem value="past">Прошедшие</SelectItem>
                <SelectItem value="all">Все мероприятия</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex gap-3">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : events.length > 0 ? (
        <>
          <div className="space-y-4">
            {events.map(event => (
              <EventCard key={event.id} event={event} compact={false} />
            ))}
          </div>

          {/* Load More Button */}
          {events.length >= pageSize && (
            <div className="mt-8 text-center">
              <Button 
                onClick={loadMoreEvents}
                disabled={isFetching}
                variant="outline"
                className="px-6"
              >
                {isFetching ? "Загрузка..." : "Показать больше мероприятий"}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow">
          <h3 className="text-lg font-medium mb-2">Мероприятия не найдены</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery 
              ? "Попробуйте изменить параметры поиска" 
              : timeFilter === "upcoming" 
                ? "Нет предстоящих мероприятий" 
                : timeFilter === "past" 
                  ? "Нет прошедших мероприятий" 
                  : "В данный момент мероприятия отсутствуют"}
          </p>
          {(searchQuery || timeFilter !== "upcoming") && (
            <Button 
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setTimeFilter("upcoming");
              }}
            >
              Сбросить фильтры
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EventsPage;