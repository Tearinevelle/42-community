interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="gradient-border">
      <div className="bg-muted p-6 rounded-lg h-full">
        <div className="text-secondary text-3xl mb-4">
          <i className={`fas fa-${icon}`}></i>
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-300">{description}</p>
      </div>
    </div>
  );
}
