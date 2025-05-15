import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Event, User } from "@shared/schema";
import EventCard from "./EventCard";

const EventsPreview = () => {
  const { data: events = [], isLoading } = useQuery<(Event & { user: User })[]>({
    queryKey: ['/api/events', { limit: 3 }],
    queryFn: async () => {
      const res = await fetch('/api/events?limit=3');
      if (!res.ok) throw new Error('Failed to fetch events');
      return res.json();
    }
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-heading font-semibold">Мероприятия</h3>
        <Link href="/events">
          <a className="text-primary-600 dark:text-primary-400 text-sm">
            Все мероприятия <i className="ri-arrow-right-s-line"></i>
          </a>
        </Link>
      </div>
      
      <div className="space-y-3">
        {isLoading ? (
          // Skeleton loaders
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="flex gap-3">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))
        ) : events.length > 0 ? (
          events.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            Нет предстоящих мероприятий
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPreview;
