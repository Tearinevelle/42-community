import { useEffect, createContext, useState } from "react";
import Header from "./Header";
import SideNav from "./SideNav";
import MobileNavBar from "./MobileNavBar";
import { useMobile } from "@/hooks/use-mobile";

export const ThemeContext = createContext({
  themeColor: "#FF0000",
  setThemeColor: (color: string) => {},
});

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useMobile();
  const [themeColor, setThemeColor] = useState("#FF0000");

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          {!isMobile && <SideNav />}
          <main className="flex-1 px-4 pb-20">{children}</main>
        </div>
        {isMobile && <MobileNavBar />}
      </div>
    </ThemeContext.Provider>
  );
}