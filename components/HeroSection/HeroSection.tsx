import Image from 'next/image';

interface HeroSectionProps {
  backdropPath: string | null;
  title: string;
  subtitle: string;
  alt: string;
}

export default function HeroSection({
  backdropPath,
  title,
  subtitle,
  alt,
}: HeroSectionProps) {
  return (
    <div className="relative h-96 w-full overflow-hidden">
      {backdropPath && (
        <Image
          src={backdropPath}
          alt={alt}
          fill
          className="object-cover"
          priority
        />
      )}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute bottom-8 left-8 text-white">
        <h1 className="text-4xl font-bold mb-2">{title}</h1>
        <p className="text-lg opacity-90">{subtitle}</p>
      </div>
    </div>
  );
}
