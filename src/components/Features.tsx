import {
  CommandLineIcon,
  CodeBracketIcon,
  ShareIcon,
  BookOpenIcon,
} from "@heroicons/react/24/solid";

interface FeatureCardProps {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

function FeatureCard({ Icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-base-200/50 p-6 rounded-lg shadow-md hover:scale-105 transition-all">
      <Icon className="w-12 h-12 text-primary mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-neutral-500">{description}</p>
    </div>
  );
}

function Features() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard Icon={CommandLineIcon} title="Multiple Languages" description="Execute code in various programming languages within a secure
              environment." />
          <FeatureCard Icon={CodeBracketIcon} title="Live Execution" description="Test your code snippets in real-time with instant feedback and results." />
          <FeatureCard Icon={ShareIcon} title="Share Templates" description="Create and share reusable code templates with the community." />
          <FeatureCard Icon={BookOpenIcon} title="Save & Organize" description="Keep your code organized and accessible in your personal library." />
        </div>
      </div>
    </div>
  );
}

export default Features;
