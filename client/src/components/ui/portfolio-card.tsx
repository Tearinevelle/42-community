import { ArrowRight } from "lucide-react";

interface PortfolioCardProps {
  image: string;
  title: string;
  description: string;
  alt: string;
}

export default function PortfolioCard({ image, title, description, alt }: PortfolioCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-lg shadow-lg">
      <img 
        src={image} 
        alt={alt} 
        className="w-full h-64 object-cover transition duration-500 group-hover:scale-110" 
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-6">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        <a 
          href="#" 
          className="text-white font-medium hover:text-blue-300 transition duration-300 flex items-center w-fit"
          onClick={(e) => e.preventDefault()}
        >
          Подробнее
          <ArrowRight className="h-5 w-5 ml-1" />
        </a>
      </div>
    </div>
  );
}
