import Image from 'next/image';
import { tmdbImageUrl } from '@/lib/tmdb';
import type { TMDBProductionCompany } from '@/types/tmdb';

interface ProductionCompaniesProps {
  companies: TMDBProductionCompany[];
}

export default function ProductionCompanies({
  companies,
}: ProductionCompaniesProps) {
  if (!companies || companies.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Production Companies
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {companies.map((company) => (
          <div key={company.id} className="flex items-center space-x-3">
            {company.logo_path ? (
              <Image
                src={tmdbImageUrl.poster(company.logo_path, 'w154') || ''}
                alt={company.name}
                width={50}
                height={50}
                className="w-12 h-12 object-contain"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-400 text-xs">Logo</span>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900">{company.name}</h3>
              {company.origin_country && (
                <p className="text-gray-500 text-sm">
                  {company.origin_country}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
