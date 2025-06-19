interface OverviewSectionProps {
  overview: string | null;
}

export default function OverviewSection({ overview }: OverviewSectionProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
      <p className="text-gray-700 leading-relaxed">
        {overview || 'No overview available.'}
      </p>
    </div>
  );
}
