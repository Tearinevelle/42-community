import FeatureCard from "./FeatureCard";
import { features } from "@/lib/constants";

export default function FeatureSection() {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold font-montserrat mb-4">Возможности платформы</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
}
