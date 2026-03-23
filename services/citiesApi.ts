import { City, refineContinentFromTimezone, getContinentForCountry } from '@/constants/cities';

const BASE_URL = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/geonames-all-cities-with-a-population-1000/records';

interface GeoNamesRecord {
  name: string;
  country_code: string;
  cou_name_en: string;
  population: number;
  coordinates: {
    lat: number;
    lon: number;
  };
  geoname_id: string;
  timezone: string;
}

interface ApiResponse {
  total_count: number;
  results: GeoNamesRecord[];
}

export interface PaginatedCityResult {
  cities: City[];
  totalCount: number;
  hasMore: boolean;
}

function recordToCity(record: GeoNamesRecord): City {
  const country = record.cou_name_en || record.country_code;
  const continent = refineContinentFromTimezone(record.timezone) ?? getContinentForCountry(country);
  return {
    id: `geo-${record.geoname_id}`,
    name: record.name,
    country,
    latitude: record.coordinates?.lat ?? 0,
    longitude: record.coordinates?.lon ?? 0,
    continent,
  };
}

export async function searchCitiesApi(
  query: string,
  limit: number = 20,
  offset: number = 0
): Promise<PaginatedCityResult> {
  if (query.length < 2) return { cities: [], totalCount: 0, hasMore: false };

  try {
    const trimmed = query.trim();
    const whereClause = `search(name,"${trimmed}")`;
    const url = `${BASE_URL}?where=${encodeURIComponent(whereClause)}&order_by=${encodeURIComponent('name ASC')}&limit=${limit}&offset=${offset}`;
    console.log('Fetching cities:', url);

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Cities API error:', response.status);
      return { cities: [], totalCount: 0, hasMore: false };
    }

    const data: ApiResponse = await response.json();
    console.log(`Found ${data.total_count} cities for "${query}", returning ${data.results.length} (offset: ${offset})`);

    const cities = data.results
      .filter((r) => r.coordinates)
      .map(recordToCity);

    return {
      cities,
      totalCount: data.total_count,
      hasMore: offset + limit < data.total_count,
    };
  } catch (error) {
    console.error('Error fetching cities:', error);
    return { cities: [], totalCount: 0, hasMore: false };
  }
}

export async function fetchCitiesByCountry(
  countryCode: string,
  limit: number = 30,
  offset: number = 0
): Promise<PaginatedCityResult> {
  try {
    const whereClause = `country_code="${countryCode.trim()}"`;
    const url = `${BASE_URL}?where=${encodeURIComponent(whereClause)}&order_by=${encodeURIComponent('name ASC')}&limit=${limit}&offset=${offset}`;
    console.log('Fetching cities by country:', url);

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Cities by country API error:', response.status);
      return { cities: [], totalCount: 0, hasMore: false };
    }

    const data: ApiResponse = await response.json();
    console.log(`Found ${data.total_count} cities in ${countryCode}, returning ${data.results.length} (offset: ${offset})`);

    const cities = data.results
      .filter((r) => r.coordinates)
      .map(recordToCity);

    return {
      cities,
      totalCount: data.total_count,
      hasMore: offset + limit < data.total_count,
    };
  } catch (error) {
    console.error('Error fetching cities by country:', error);
    return { cities: [], totalCount: 0, hasMore: false };
  }
}

export async function fetchCitiesByCountryName(
  countryName: string,
  limit: number = 30,
  offset: number = 0
): Promise<PaginatedCityResult> {
  try {
    const whereClause = `search(cou_name_en,"${countryName.trim()}")`;
    const url = `${BASE_URL}?where=${encodeURIComponent(whereClause)}&order_by=${encodeURIComponent('name ASC')}&limit=${limit}&offset=${offset}`;
    console.log('Fetching cities by country name:', url);

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Cities by country name API error:', response.status);
      return { cities: [], totalCount: 0, hasMore: false };
    }

    const data: ApiResponse = await response.json();
    console.log(`Found ${data.total_count} cities in "${countryName}", returning ${data.results.length} (offset: ${offset})`);

    const cities = data.results
      .filter((r) => r.coordinates)
      .map(recordToCity);

    return {
      cities,
      totalCount: data.total_count,
      hasMore: offset + limit < data.total_count,
    };
  } catch (error) {
    console.error('Error fetching cities by country name:', error);
    return { cities: [], totalCount: 0, hasMore: false };
  }
}

export async function fetchNearbyCities(
  lat: number,
  lon: number,
  limit: number = 20,
  radiusKm: number = 500
): Promise<City[]> {
  try {
    const url = `${BASE_URL}?where=within_distance(coordinates, geom'POINT(${lon} ${lat})', ${radiusKm}km)&order_by=population DESC&limit=${limit}`;
    console.log('Fetching nearby cities:', url);

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Nearby cities API error:', response.status);
      return [];
    }

    const data: ApiResponse = await response.json();
    console.log(`Found ${data.results.length} nearby cities`);

    return data.results
      .filter((r) => r.coordinates)
      .map(recordToCity);
  } catch (error) {
    console.error('Error fetching nearby cities:', error);
    return [];
  }
}

export async function fetchTopCities(
  limit: number = 50,
  offset: number = 0
): Promise<PaginatedCityResult> {
  try {
    const url = `${BASE_URL}?order_by=${encodeURIComponent('name ASC')}&limit=${limit}&offset=${offset}`;
    console.log('Fetching top cities:', url);

    const response = await fetch(url);
    if (!response.ok) {
      console.error('Top cities API error:', response.status);
      return { cities: [], totalCount: 0, hasMore: false };
    }

    const data: ApiResponse = await response.json();
    console.log(`Fetched ${data.results.length} top cities (offset: ${offset}, total: ${data.total_count})`);

    const cities = data.results
      .filter((r) => r.coordinates)
      .map(recordToCity);

    return {
      cities,
      totalCount: data.total_count,
      hasMore: offset + limit < data.total_count,
    };
  } catch (error) {
    console.error('Error fetching top cities:', error);
    return { cities: [], totalCount: 0, hasMore: false };
  }
}
