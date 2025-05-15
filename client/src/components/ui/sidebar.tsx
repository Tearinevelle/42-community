import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/utils";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  const menuItems: NavItem[] = [
    {
      title: "Главная",
      href: "/",
      icon: "fa fa-home",
      active: location === "/"
    },
    {
      title: "Сервер",
      href: "/server",
      icon: "fa fa-server"
    },
    {
      title: "Клиент",
      href: "/client",
      icon: "fa fa-desktop"
    },
    {
      title: "Общие компоненты",
      href: "/shared",
      icon: "fa fa-share-alt"
    },
    {
      title: "База данных",
      href: "/database",
      icon: "fa fa-database"
    }
  ];

  return (
    <div className={cn("hidden md:flex md:flex-shrink-0", className)}>
      <div className="flex flex-col w-64 bg-dark">
        <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
          <span className="text-xl font-semibold text-white">Приложение</span>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                  item.active
                    ? "text-white bg-gray-800"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                )}
              >
                <i className={cn(`${item.icon} mr-3`, item.active ? "text-gray-300" : "text-gray-400")}></i>
                {item.title}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
