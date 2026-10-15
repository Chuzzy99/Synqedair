// Static route suggestions for the home page. These are placeholders only:
// no prices, airlines or durations. Real data appears after a search.

export type RouteSuggestion = {
  city: string;
  code: string;
};

// Country code -> the airport hub we pre-select for that visitor
export const ORIGIN_MAP: Record<string, { city: string; code: string }> = {
  NG: { city: 'Lagos', code: 'LOS' },
  GH: { city: 'Accra', code: 'ACC' },
  KE: { city: 'Nairobi', code: 'NBO' },
  ET: { city: 'Addis', code: 'ADD' },
  ZA: { city: 'Johannesburg', code: 'JNB' },
  SN: { city: 'Dakar', code: 'DKR' },
  CM: { city: 'Douala', code: 'DLA' },
  TZ: { city: 'Dar es Salaam', code: 'DAR' },
  UG: { city: 'Kampala', code: 'EBB' },
  RW: { city: 'Kigali', code: 'KGL' },
  GB: { city: 'London', code: 'LHR' },
  US: { city: 'New York', code: 'JFK' },
  CA: { city: 'Toronto', code: 'YYZ' },
  AE: { city: 'Dubai', code: 'DXB' },
  DE: { city: 'Frankfurt', code: 'FRA' },
  FR: { city: 'Paris', code: 'CDG' },
  NL: { city: 'Amsterdam', code: 'AMS' },
  IT: { city: 'Rome', code: 'FCO' },
  SA: { city: 'Riyadh', code: 'RUH' },
  QA: { city: 'Doha', code: 'DOH' },
};

export const DEFAULT_ORIGIN = { city: 'New York', code: 'JFK' };

// "Popular for you" (5 per hub)
export const POPULAR_ROUTES: Record<string, RouteSuggestion[]> = {
  LOS: [
    { city: 'London', code: 'LHR' },
    { city: 'New York', code: 'JFK' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'Dubai', code: 'DXB' },
    { city: 'Accra', code: 'ACC' },
  ],
  ACC: [
    { city: 'London', code: 'LHR' },
    { city: 'New York', code: 'JFK' },
    { city: 'Dubai', code: 'DXB' },
    { city: 'Lagos', code: 'LOS' },
    { city: 'Toronto', code: 'YYZ' },
  ],
  NBO: [
    { city: 'London', code: 'LHR' },
    { city: 'Dubai', code: 'DXB' },
    { city: 'Lagos', code: 'LOS' },
    { city: 'Toronto', code: 'YYZ' },
    { city: 'New York', code: 'JFK' },
  ],
  ADD: [
    { city: 'London', code: 'LHR' },
    { city: 'Dubai', code: 'DXB' },
    { city: 'Toronto', code: 'YYZ' },
    { city: 'New York', code: 'JFK' },
    { city: 'Lagos', code: 'LOS' },
  ],
  JNB: [
    { city: 'London', code: 'LHR' },
    { city: 'Dubai', code: 'DXB' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'Lagos', code: 'LOS' },
    { city: 'New York', code: 'JFK' },
  ],
  LHR: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'Johannesburg', code: 'JNB' },
    { city: 'Dubai', code: 'DXB' },
  ],
  JFK: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'London', code: 'LHR' },
    { city: 'Addis', code: 'ADD' },
  ],
  YYZ: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'London', code: 'LHR' },
    { city: 'Addis', code: 'ADD' },
  ],
  DXB: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'London', code: 'LHR' },
    { city: 'Addis', code: 'ADD' },
  ],
  FRA: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'London', code: 'LHR' },
    { city: 'Addis', code: 'ADD' },
  ],
  CDG: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'London', code: 'LHR' },
    { city: 'Addis', code: 'ADD' },
  ],
  AMS: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'London', code: 'LHR' },
    { city: 'Addis', code: 'ADD' },
  ],
};

// "Routes built for the diaspora" (6 per hub)
export const DIASPORA_ROUTES: Record<string, RouteSuggestion[]> = {
  LOS: [
    { city: 'London', code: 'LHR' },
    { city: 'New York', code: 'JFK' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'Dubai', code: 'DXB' },
    { city: 'Toronto', code: 'YYZ' },
    { city: 'Kigali', code: 'KGL' },
  ],
  ACC: [
    { city: 'London', code: 'LHR' },
    { city: 'Toronto', code: 'YYZ' },
    { city: 'New York', code: 'JFK' },
    { city: 'Dubai', code: 'DXB' },
    { city: 'Lagos', code: 'LOS' },
    { city: 'Amsterdam', code: 'AMS' },
  ],
  NBO: [
    { city: 'London', code: 'LHR' },
    { city: 'Dubai', code: 'DXB' },
    { city: 'Toronto', code: 'YYZ' },
    { city: 'Lagos', code: 'LOS' },
    { city: 'New York', code: 'JFK' },
    { city: 'Kigali', code: 'KGL' },
  ],
  ADD: [
    { city: 'London', code: 'LHR' },
    { city: 'Toronto', code: 'YYZ' },
    { city: 'New York', code: 'JFK' },
    { city: 'Dubai', code: 'DXB' },
    { city: 'Lagos', code: 'LOS' },
    { city: 'Nairobi', code: 'NBO' },
  ],
  JNB: [
    { city: 'London', code: 'LHR' },
    { city: 'Dubai', code: 'DXB' },
    { city: 'New York', code: 'JFK' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'Lagos', code: 'LOS' },
    { city: 'Amsterdam', code: 'AMS' },
  ],
  LHR: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'Addis', code: 'ADD' },
    { city: 'Johannesburg', code: 'JNB' },
    { city: 'Dubai', code: 'DXB' },
  ],
  JFK: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'Addis', code: 'ADD' },
    { city: 'London', code: 'LHR' },
    { city: 'Dubai', code: 'DXB' },
  ],
  YYZ: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'London', code: 'LHR' },
    { city: 'Addis', code: 'ADD' },
    { city: 'Dubai', code: 'DXB' },
  ],
  DXB: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'London', code: 'LHR' },
    { city: 'New York', code: 'JFK' },
    { city: 'Addis', code: 'ADD' },
  ],
  FRA: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'London', code: 'LHR' },
    { city: 'Addis', code: 'ADD' },
    { city: 'Dubai', code: 'DXB' },
  ],
  CDG: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'Addis', code: 'ADD' },
    { city: 'London', code: 'LHR' },
    { city: 'Dubai', code: 'DXB' },
  ],
  AMS: [
    { city: 'Lagos', code: 'LOS' },
    { city: 'Accra', code: 'ACC' },
    { city: 'Nairobi', code: 'NBO' },
    { city: 'London', code: 'LHR' },
    { city: 'Addis', code: 'ADD' },
    { city: 'Dubai', code: 'DXB' },
  ],
};