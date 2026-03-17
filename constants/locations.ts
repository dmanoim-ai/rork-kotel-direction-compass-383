export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}

export const KOTEL: Location = {
  id: 'kotel',
  name: 'Kotel',
  latitude: 31.7767,
  longitude: 35.2345,
  description: 'Western Wall, Jerusalem',
};

export const PRESET_LOCATIONS: Location[] = [
  KOTEL,
  {
    id: 'temple-mount',
    name: 'Temple Mount',
    latitude: 31.7780,
    longitude: 35.2354,
    description: 'Jerusalem, Israel',
  },
  {
    id: 'tower-of-david',
    name: 'Tower of David',
    latitude: 31.7765,
    longitude: 35.2286,
    description: 'Jerusalem, Israel',
  },
  {
    id: 'mount-of-olives',
    name: 'Mount of Olives',
    latitude: 31.7788,
    longitude: 35.2451,
    description: 'Jerusalem, Israel',
  },
];
