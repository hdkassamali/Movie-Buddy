interface FeatureCardProps {
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
}

export default function FeatureCard({
  title,
  description,
  buttonText = 'Coming Soon →',
  onClick,
}: FeatureCardProps) {
  return (
    <div
      className={`bg-white/5 rounded-lg p-6 ${onClick ? 'cursor-pointer hover:bg-white/10 transition-colors' : ''}`}
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-blue-100 text-sm mb-4">{description}</p>
      <button className="text-blue-300 hover:text-blue-200 text-sm font-medium">
        {onClick ? 'Go →' : buttonText}
      </button>
    </div>
  );
}
