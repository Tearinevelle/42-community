import { Star } from "lucide-react";

interface TestimonialCardProps {
  content: string;
  author: string;
  position: string;
  avatar: string;
}

export default function TestimonialCard({ content, author, position, avatar }: TestimonialCardProps) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 shadow-xl">
      <div className="flex mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="h-10 w-10 text-yellow-400" fill="currentColor" />
        ))}
      </div>
      <p className="italic text-white/90 mb-6">
        "{content}"
      </p>
      <div className="flex items-center">
        <div className="w-12 h-12 bg-blue-300 rounded-full overflow-hidden mr-4">
          <img 
            src={avatar} 
            alt={author} 
            className="w-full h-full object-cover" 
            loading="lazy"
          />
        </div>
        <div>
          <p className="font-medium text-white">{author}</p>
          <p className="text-blue-200 text-sm">{position}</p>
        </div>
      </div>
    </div>
  );
}
