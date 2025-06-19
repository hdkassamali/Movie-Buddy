// Base types
export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface TMDBImage {
  aspect_ratio: number;
  height: number;
  iso_639_1: string | null;
  file_path: string;
  vote_average: number;
  vote_count: number;
  width: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBProductionCountry {
  iso_3166_1: string;
  name: string;
}

export interface TMDBSpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

// Movie types
export interface TMDBMovieSearchResult {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface TMDBMovieDetails {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: {
    id: number;
    name: string;
    poster_path: string | null;
    backdrop_path: string | null;
  } | null;
  budget: number;
  genres: TMDBGenre[];
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: TMDBSpokenLanguage[];
  status:
    | 'Rumored'
    | 'Planned'
    | 'In Production'
    | 'Post Production'
    | 'Released'
    | 'Canceled';
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  // Optional appended data
  credits?: TMDBCredits;
  images?: {
    backdrops: TMDBImage[];
    logos: TMDBImage[];
    posters: TMDBImage[];
  };
  videos?: {
    results: TMDBVideo[];
  };
}

// TV Show types
export interface TMDBTVShowSearchResult {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
}

export interface TMDBTVShowDetails {
  adult: boolean;
  backdrop_path: string | null;
  created_by: {
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path: string | null;
  }[];
  episode_run_time: number[];
  first_air_date: string;
  genres: TMDBGenre[];
  homepage: string;
  id: number;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    production_code: string;
    runtime: number;
    season_number: number;
    show_id: number;
    still_path: string | null;
  } | null;
  name: string;
  next_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    vote_average: number;
    vote_count: number;
    air_date: string;
    episode_number: number;
    production_code: string;
    runtime: number | null;
    season_number: number;
    show_id: number;
    still_path: string | null;
  } | null;
  networks: {
    id: number;
    logo_path: string | null;
    name: string;
    origin_country: string;
  }[];
  number_of_episodes: number;
  number_of_seasons: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  production_companies: TMDBProductionCompany[];
  production_countries: TMDBProductionCountry[];
  seasons: {
    air_date: string;
    episode_count: number;
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    vote_average: number;
  }[];
  spoken_languages: TMDBSpokenLanguage[];
  status: string;
  tagline: string;
  type: string;
  vote_average: number;
  vote_count: number;
  // Optional appended data
  credits?: TMDBCredits;
  images?: {
    backdrops: TMDBImage[];
    logos: TMDBImage[];
    posters: TMDBImage[];
  };
  videos?: {
    results: TMDBVideo[];
  };
}

// Credits types
export interface TMDBCastMember {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  cast_id: number;
  character: string;
  credit_id: string;
  order: number;
}

export interface TMDBCrewMember {
  adult: boolean;
  gender: number | null;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  credit_id: string;
  department: string;
  job: string;
}

export interface TMDBCredits {
  id: number;
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

// Person types
export interface TMDBPersonSearchResult {
  adult: boolean;
  gender: number;
  id: number;
  known_for_department: string;
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  known_for: (TMDBMovieSearchResult | TMDBTVShowSearchResult)[];
}

// Multi search types
export interface TMDBMultiSearchResult {
  adult?: boolean;
  backdrop_path?: string | null;
  genre_ids?: number[];
  id: number;
  media_type: 'movie' | 'tv' | 'person';
  original_language?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  popularity: number;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
  title?: string;
  name?: string;
  video?: boolean;
  vote_average?: number;
  vote_count?: number;
  origin_country?: string[];
  known_for_department?: string;
  known_for?: (TMDBMovieSearchResult | TMDBTVShowSearchResult)[];
}

// Video types
export interface TMDBVideo {
  iso_639_1: string;
  iso_3166_1: string;
  name: string;
  key: string;
  site: string;
  size: number;
  type:
    | 'Trailer'
    | 'Teaser'
    | 'Clip'
    | 'Featurette'
    | 'Behind the Scenes'
    | 'Bloopers';
  official: boolean;
  published_at: string;
  id: string;
}

// Genre lists
export interface TMDBGenreList {
  genres: TMDBGenre[];
}

// Trending types
export type TMDBTrendingResult =
  | TMDBMovieSearchResult
  | TMDBTVShowSearchResult
  | TMDBPersonSearchResult;

// Search response types
export type TMDBMovieSearchResponse = TMDBResponse<TMDBMovieSearchResult>;
export type TMDBTVShowSearchResponse = TMDBResponse<TMDBTVShowSearchResult>;
export type TMDBPersonSearchResponse = TMDBResponse<TMDBPersonSearchResult>;
export type TMDBMultiSearchResponse = TMDBResponse<TMDBMultiSearchResult>;

// Discover response types
export type TMDBDiscoverMovieResponse = TMDBResponse<TMDBMovieSearchResult>;
export type TMDBDiscoverTVResponse = TMDBResponse<TMDBTVShowSearchResult>;

// Trending response types
export type TMDBTrendingResponse = TMDBResponse<TMDBTrendingResult>;

// Error types (re-export from lib/tmdb.ts)
export interface TMDBError {
  success: false;
  status_code: number;
  status_message: string;
}

// Configuration types for image URLs
export interface TMDBConfiguration {
  images: {
    base_url: string;
    secure_base_url: string;
    backdrop_sizes: string[];
    logo_sizes: string[];
    poster_sizes: string[];
    profile_sizes: string[];
    still_sizes: string[];
  };
  change_keys: string[];
}

// Utility types for function parameters
export interface SearchOptions {
  page?: number;
  language?: string;
}

export interface MovieSearchOptions extends SearchOptions {
  year?: number;
  region?: string;
  primary_release_year?: number;
}

export interface TVSearchOptions extends SearchOptions {
  firstAirDateYear?: number;
}

export interface DetailOptions {
  language?: string;
  appendToResponse?: string[];
}

export interface DiscoverMovieOptions extends SearchOptions {
  sort_by?: string;
  year?: number;
  primary_release_year?: number;
  primary_release_date_gte?: string;
  primary_release_date_lte?: string;
  with_genres?: string;
  without_genres?: string;
  with_cast?: string;
  with_crew?: string;
  with_people?: string;
  with_companies?: string;
  with_keywords?: string;
  without_keywords?: string;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  with_original_language?: string;
  vote_average_gte?: number;
  vote_average_lte?: number;
  vote_count_gte?: number;
  vote_count_lte?: number;
  certification?: string;
  certification_lte?: string;
  certification_gte?: string;
  include_adult?: boolean;
  include_video?: boolean;
  watch_region?: string;
  with_watch_providers?: string;
  with_watch_monetization_types?: string;
}

export interface DiscoverTVOptions extends SearchOptions {
  sort_by?: string;
  air_date_gte?: string;
  air_date_lte?: string;
  first_air_date_gte?: string;
  first_air_date_lte?: string;
  first_air_date_year?: number;
  timezone?: string;
  vote_average_gte?: number;
  vote_average_lte?: number;
  vote_count_gte?: number;
  vote_count_lte?: number;
  with_genres?: string;
  with_networks?: string;
  without_genres?: string;
  with_runtime_gte?: number;
  with_runtime_lte?: number;
  include_null_first_air_dates?: boolean;
  with_original_language?: string;
  without_keywords?: string;
  screened_theatrically?: boolean;
  with_companies?: string;
  with_keywords?: string;
  with_watch_providers?: string;
  watch_region?: string;
  with_watch_monetization_types?: string;
  with_status?: string;
  with_type?: string;
}
