import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { Location, KOTEL } from '@/constants/locations';

const STORAGE_KEY = 'target_location';

export const [TargetLocationProvider, useTargetLocation] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [targetLocation, setTargetLocation] = useState<Location>(KOTEL);

  const updateMutation = useMutation({
    mutationFn: async (location: Location) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(location));
      return location;
    },
  });

  const setTarget = (location: Location) => {
    console.log('Setting new target location:', location.name, location.latitude, location.longitude);
    setTargetLocation(location);
    updateMutation.mutate(location);
  };

  return {
    targetLocation,
    setTarget,
    isLoading: false,
  };
});
