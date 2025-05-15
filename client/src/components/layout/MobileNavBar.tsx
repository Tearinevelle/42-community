import { Link, useLocation } from "wouter";
import { Home, Store, Plus, Calendar, Video } from "lucide-react";

const MobileNavBar = () => {
  const [location] = useLocation();
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark border-t border-gray-200 dark:border-gray-800 md:hidden">
      <div className="grid grid-cols-5 py-2">
        <Link href="/">
          <a className={`flex flex-col items-center ${location === '/' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Лента</span>
          </a>
        </Link>
        <Link href="/marketplace">
          <a className={`flex flex-col items-center ${location === '/marketplace' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <Store className="h-6 w-6" />
            <span className="text-xs mt-1">Товары</span>
          </a>
        </Link>
        <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
          <div className="bg-primary-600 dark:bg-primary-500 w-10 h-10 rounded-full flex items-center justify-center text-white">
            <Plus className="h-6 w-6" />
          </div>
        </div>
        <Link href="/events">
          <a className={`flex flex-col items-center ${location === '/events' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <Calendar className="h-6 w-6" />
            <span className="text-xs mt-1">События</span>
          </a>
        </Link>
        <Link href="/videos">
          <a className={`flex flex-col items-center relative ${location === '/videos' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
            <Video className="h-6 w-6" />
            <span className="text-xs mt-1">Видео</span>
            <span className="absolute top-0 right-4 bg-accent-500 h-2 w-2 rounded-full"></span>
          </a>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavBar;
