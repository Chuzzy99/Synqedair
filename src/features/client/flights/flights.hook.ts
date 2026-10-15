'use client';

import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import * as flightsApi from '@/features/client/flights/flights.api';
import { getApiErrorMessage } from '@/lib/apiError';
import type { SearchFlightsPayload } from '@/features/client/flights/flights.type';

export const flightKeys = {
  search: (params: SearchFlightsPayload | null) => ['flights', 'search', params] as const,
  offer: (id: string | null) => ['flights', 'offer', id] as const,
};

export const useSearchFlights = (params: SearchFlightsPayload | null) => {
  const query = useQuery({
    queryKey: flightKeys.search(params),
    queryFn: async () => {
      const response = await flightsApi.searchFlights(params as SearchFlightsPayload);
      return response.data;
    },
    enabled: params !== null,
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    offers: query.data?.offers ?? [],
    offerRequestId: query.data?.offerRequestId ?? null,
    count: query.data?.count ?? 0,
    isSearching: query.isLoading,
    isError: query.isError,
    errorMessage: query.isError
      ? getApiErrorMessage(query.error, 'Flight search failed. Please try again.')
      : null,
    hasSearched: query.isSuccess,
    refetch: query.refetch,
  };
};

/**
 * Loads one offer fresh from our backend (price, segments, extras).
 * Pass `null` to stay idle until the offer id is known.
 */
export const useFlightOffer = (id: string | null) => {
  const query = useQuery({
    queryKey: flightKeys.offer(id),
    queryFn: async () => {
      const response = await flightsApi.getFlightOffer(id as string);
      return response.data;
    },
    enabled: id !== null,

    // Always show the live price, never a cached one
    staleTime: 0,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // The backend answers 410 when the fare has expired or is gone
  const isExpired =
    query.isError && axios.isAxiosError(query.error) && query.error.response?.status === 410;

  return {
    offer: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    isExpired,
    errorMessage: query.isError
      ? getApiErrorMessage(query.error, 'We could not load this fare. Please try again.')
      : null,
    refetch: query.refetch,
  };
};