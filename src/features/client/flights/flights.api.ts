import { client } from '@/client-setup/client';
import type { ApiResponse } from '@/types/api';
import type {
  FlightOfferResponseData,
  SearchFlightsPayload,
  SearchFlightsResponseData,
} from '@/features/client/flights/flights.type';

export const searchFlights = async (payload: SearchFlightsPayload) => {
  const { data } = await client.post<ApiResponse<SearchFlightsResponseData>>(
    '/flights/search',
    payload
  );
  return data;
};

export const getFlightOffer = async (id: string) => {
  const { data } = await client.get<ApiResponse<FlightOfferResponseData>>(
    `/flights/offers/${encodeURIComponent(id)}`
  );
  return data;
};