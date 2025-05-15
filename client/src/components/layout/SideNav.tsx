import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { navItems, utilNavItems } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface SideNavProps {
  mobileMenuOpen: boolean;
  onCloseMobileMenu: () => void;
}

export default function SideNav({ mobileMenuOpen, onCloseMobileMenu }: SideNavProps) {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isMobile = useMobile();

  // Close mobile menu when location changes
  useEffect(() => {
    if (isMobile && mobileMenuOpen) {
      onCloseMobileMenu();
    }
  }, [location]);

  // Calculate classes for mobile vs desktop
  const sideNavClasses = cn(
    "bg-primary flex-shrink-0 z-50 flex flex-col h-full transition-all duration-300",
    isMobile 
      ? mobileMenuOpen 
        ? "fixed inset-0 transform translate-x-0" 
        : "fixed inset-0 transform -translate-x-full"
      : "block w-64"
  );

  return (
    <div className={sideNavClasses}>
      <div className="p-5 border-b border-gray-800">
        <div className="text-2xl font-bold font-montserrat text-white">
          <span className="text-secondary">42</span>-коммьюнити
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-6">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Поиск..." 
              className="w-full bg-muted text-white rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-500"></i>
          </div>
        </div>

        <ul className="space-y-2 px-3">
          {navItems.map((item) => {
            const isActive = location === item.path;
            return (
              <li key={item.path}>
                <Link href={item.path} className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-colors",
                    isActive 
                      ? "text-white bg-gradient-to-r from-secondary to-secondary/70" 
                      : "text-gray-300 hover:bg-muted"
                  )}>
                    <i className={`fas fa-${item.icon} w-5 text-center`}></i>
                    <span>{item.name}</span>
                    {item.name === "Чаты" && (
                      <span className="bg-secondary text-white text-xs rounded-full px-2 ml-auto">5</span>
                    )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 pt-6 border-t border-gray-800 px-3">
          <ul className="space-y-2">
            {utilNavItems.filter(item => !item.adminOnly || user?.role === "owner" || user?.role === "admin").map((item) => (
              <li key={item.path}>
                <Link href={item.path} className="flex items-center gap-3 p-2 rounded-lg text-gray-300 hover:bg-muted transition-colors">
                  <i className={`fas fa-${item.icon} w-5 text-center`}></i>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {isAuthenticated && user ? (
        <div className="p-4 border-t border-gray-800">
          <Link href="/profile" className="flex items-center gap-3 p-2 rounded-lg text-gray-300 hover:bg-muted transition-colors">
            <img 
              src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150"} 
              alt={user.displayName} 
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <div className="text-sm font-medium">{user.role === "owner" ? "ВЛАДЕЛЕЦ" : user.displayName}</div>
              <div className="text-xs text-gray-500">{user.rank}</div>
            </div>
          </Link>
        </div>
      ) : (
        <div className="p-4 border-t border-gray-800">
          <div className="text-sm text-gray-400 text-center">
            Войдите через Telegram, чтобы получить доступ ко всем функциям
          </div>
        </div>
      )}
    </div>
  );
}