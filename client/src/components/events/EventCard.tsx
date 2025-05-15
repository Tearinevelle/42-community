import { Link } from "wouter";
import { MapPin, Clock } from "lucide-react";
import { Event, User } from "@shared/schema";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Event & { user: User };
  compact?: boolean;
}

const EventCard = ({ event, compact = true }: EventCardProps) => {
  // Parse date and get month and day
  const startDate = new Date(event.startDate);
  const monthNames = ["ЯНВ", "ФЕВ", "МАР", "АПР", "МАЙ", "ИЮН", "ИЮЛ", "АВГ", "СЕН", "ОКТ", "НОЯ", "ДЕК"];
  const month = monthNames[startDate.getMonth()];
  const day = startDate.getDate();
  
  // Color classes for different events
  const colorClasses = {
    1: "primary", // Primary class
    2: "secondary", // Secondary class
    3: "accent", // Accent class
  };
  
  // Get a deterministic color class based on event ID
  const colorIndex = (event.id % 3) + 1;
  const colorClass = colorClasses[colorIndex as keyof typeof colorClasses];
  
  return (
    <Link href={`/event/${event.id}`}>
      <a className={cn(
        "flex gap-3 group cursor-pointer",
        compact ? "" : "p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow"
      )}>
        <div className={`w-16 flex flex-col items-center justify-center rounded-lg ${
          colorClass === "primary" 
            ? "bg-primary-50 dark:bg-primary-900/30" 
            : colorClass === "secondary" 
              ? "bg-secondary-50 dark:bg-secondary-900/30" 
              : "bg-accent-50 dark:bg-accent-900/30"
        }`}>
          <span className={`text-xs font-medium ${
            colorClass === "primary" 
              ? "text-primary-600 dark:text-primary-400" 
              : colorClass === "secondary" 
                ? "text-secondary-600 dark:text-secondary-400" 
                : "text-accent-600 dark:text-accent-400"
          }`}>
            {month}
          </span>
          <span className={`text-xl font-semibold ${
            colorClass === "primary" 
              ? "text-primary-600 dark:text-primary-400" 
              : colorClass === "secondary" 
                ? "text-secondary-600 dark:text-secondary-400" 
                : "text-accent-600 dark:text-accent-400"
          }`}>
            {day}
          </span>
        </div>
        <div className="flex-1">
          <h4 className={`font-medium group-hover:${
            colorClass === "primary" 
              ? "text-primary-600 dark:text-primary-400" 
              : colorClass === "secondary" 
                ? "text-secondary-600 dark:text-secondary-400" 
                : "text-accent-600 dark:text-accent-400"
          } transition-colors`}>
            {event.title}
          </h4>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <MapPin className="h-3 w-3" /> {event.location}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {event.startTime} - {event.endTime}
          </div>
          
          {!compact && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                {event.description}
              </p>
              
              <div className="mt-3 flex items-center gap-2">
                <img 
                  src={event.user.profileImageUrl || "https://via.placeholder.com/40"}
                  alt={`${event.user.username || "User"}`}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Организатор: {event.user.username || `${event.user.firstName || ''} ${event.user.lastName || ''}`}
                </span>
              </div>
            </div>
          )}
        </div>
      </a>
    </Link>
  );
};

export default EventCard;
