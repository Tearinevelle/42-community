import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

export default function ServiceCard({ icon, title, description, color }: ServiceCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className={cn("mb-5", color)}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">
        {description}
      </p>
      <a 
        href="#contact" 
        className={cn("font-medium hover:opacity-80 transition duration-300 flex items-center", color)}
        onClick={(e) => {
          e.preventDefault();
          const contactSection = document.getElementById("contact");
          if (contactSection) {
            contactSection.scrollIntoView({ behavior: "smooth" });
          }
        }}
      >
        Узнать больше
        <ArrowRight className="h-5 w-5 ml-1" />
      </a>
    </div>
  );
}
