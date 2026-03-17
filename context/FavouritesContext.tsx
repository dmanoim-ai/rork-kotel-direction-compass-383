import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Location, KOTEL } from '@/constants/locations';

const STORAGE_KEY = 'favourites';

export interface Favourite {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  isDefault?: boolean;
}

const DEFAULT_FAVOURITES: Favourite[] = [
  {
    id: 'fav-kotel',
    name: 'Kotel (Western Wall)',
    latitude: KOTEL.latitude,
    longitude: KOTEL.longitude,
    description: 'Jerusalem, Israel',
    isDefault: true,
  },
];

export const [FavouritesProvider, useFavourites] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [favourites, setFavourites] = useState<Favourite[]>(DEFAULT_FAVOURITES);

  const favouritesQuery = useQuery({
    queryKey: ['favourites'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Favourite[];
        return parsed;
      }
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FAVOURITES));
      return DEFAULT_FAVOURITES;
    },
  });

  useEffect(() => {
    if (favouritesQuery.data) {
      setFavourites(favouritesQuery.data);
    }
  }, [favouritesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (updated: Favourite[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['favourites'], data);
    },
  });

  const addFavourite = useCallback((location: Location, customName?: string) => {
    const newFav: Favourite = {
      id: `fav-${Date.now()}`,
      name: customName || location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      description: location.description,
    };
    const updated = [...favourites, newFav];
    setFavourites(updated);
    saveMutation.mutate(updated);
    console.log('Added favourite:', newFav.name);
  }, [favourites, saveMutation]);

  const removeFavourite = useCallback((id: string) => {
    const updated = favourites.filter(f => f.id !== id);
    setFavourites(updated);
    saveMutation.mutate(updated);
    console.log('Removed favourite:', id);
  }, [favourites, saveMutation]);

  const isFavourite = useCallback((latitude: number, longitude: number) => {
    return favourites.some(
      f => Math.abs(f.latitude - latitude) < 0.0001 && Math.abs(f.longitude - longitude) < 0.0001
    );
  }, [favourites]);

  return useMemo(() => ({
    favourites,
    addFavourite,
    removeFavourite,
    isFavourite,
    isLoading: favouritesQuery.isLoading,
  }), [favourites, addFavourite, removeFavourite, isFavourite, favouritesQuery.isLoading]);
});
