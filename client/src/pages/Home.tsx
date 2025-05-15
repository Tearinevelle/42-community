import Hero from "@/components/home/Hero";
import FeatureSection from "@/components/home/FeatureSection";
import PopularUsersSection from "@/components/home/PopularUsersSection";
import MarketplaceSection from "@/components/home/MarketplaceSection";
import ChatSection from "@/components/home/ChatSection";
import EventsSection from "@/components/home/EventsSection";
import BlogSection from "@/components/home/BlogSection";
import { useEffect } from "react";

export default function Home() {
  // Set page title
  useEffect(() => {
    document.title = "Сеть - Главная | Универсальная социальная платформа";
  }, []);

  return (
    <>
      {/* Hero section with platform intro */}
      <Hero />

      {/* Features section */}
      <FeatureSection />

      {/* Profiles showcase */}
      <PopularUsersSection />

      {/* Marketplace section */}
      <MarketplaceSection />

      {/* Chat preview section */}
      <ChatSection />

      {/* Events section */}
      <EventsSection />

      {/* Blog preview section */}
      <BlogSection />
    </>
  );
}
