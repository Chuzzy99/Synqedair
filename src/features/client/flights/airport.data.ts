import type { Airport } from '@/components/AirportInput';

// Local airport list so suggestions appear instantly (and still work if the
// remote places API is down). Order = priority when several results tie,
// so Nigerian / West African airports come first.
export const LOCAL_AIRPORTS: Airport[] = [
  // Nigeria
  { code: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria' },
  { code: 'ABV', name: 'Nnamdi Azikiwe International Airport', city: 'Abuja', country: 'Nigeria' },
  { code: 'PHC', name: 'Port Harcourt International Airport', city: 'Port Harcourt', country: 'Nigeria' },
  { code: 'KAN', name: 'Mallam Aminu Kano International Airport', city: 'Kano', country: 'Nigeria' },
  { code: 'ENU', name: 'Akanu Ibiam International Airport', city: 'Enugu', country: 'Nigeria' },
  { code: 'QOW', name: 'Sam Mbakwe Airport', city: 'Owerri', country: 'Nigeria' },
  { code: 'BNI', name: 'Benin Airport', city: 'Benin City', country: 'Nigeria' },
  { code: 'CBQ', name: 'Margaret Ekpo International Airport', city: 'Calabar', country: 'Nigeria' },
  { code: 'QUO', name: 'Akwa Ibom International Airport', city: 'Uyo', country: 'Nigeria' },
  { code: 'KAD', name: 'Kaduna Airport', city: 'Kaduna', country: 'Nigeria' },
  { code: 'ILR', name: 'Ilorin International Airport', city: 'Ilorin', country: 'Nigeria' },
  { code: 'JOS', name: 'Yakubu Gowon Airport', city: 'Jos', country: 'Nigeria' },
  { code: 'IBA', name: 'Ibadan Airport', city: 'Ibadan', country: 'Nigeria' },
  { code: 'QRW', name: 'Warri Airport', city: 'Warri', country: 'Nigeria' },
  { code: 'ABB', name: 'Asaba International Airport', city: 'Asaba', country: 'Nigeria' },
  { code: 'MIU', name: 'Maiduguri International Airport', city: 'Maiduguri', country: 'Nigeria' },
  { code: 'YOL', name: 'Yola Airport', city: 'Yola', country: 'Nigeria' },
  { code: 'SKO', name: 'Sadiq Abubakar III International Airport', city: 'Sokoto', country: 'Nigeria' },
  { code: 'AKR', name: 'Akure Airport', city: 'Akure', country: 'Nigeria' },
  { code: 'BCU', name: 'Sir Abubakar Tafawa Balewa Airport', city: 'Bauchi', country: 'Nigeria' },
  { code: 'DKA', name: "Umaru Musa Yar'Adua International Airport", city: 'Katsina', country: 'Nigeria' },
  { code: 'GMO', name: 'Gombe Lawanti International Airport', city: 'Gombe', country: 'Nigeria' },
  { code: 'MXJ', name: 'Minna Airport', city: 'Minna', country: 'Nigeria' },
  // West Africa
  { code: 'ACC', name: 'Kotoka International Airport', city: 'Accra', country: 'Ghana' },
  { code: 'KMS', name: 'Kumasi Airport', city: 'Kumasi', country: 'Ghana' },
  { code: 'ABJ', name: 'Félix-Houphouët-Boigny International Airport', city: 'Abidjan', country: "Côte d'Ivoire" },
  { code: 'DKR', name: 'Blaise Diagne International Airport', city: 'Dakar', country: 'Senegal' },
  { code: 'LFW', name: 'Gnassingbé Eyadéma International Airport', city: 'Lomé', country: 'Togo' },
  { code: 'COO', name: 'Cadjehoun Airport', city: 'Cotonou', country: 'Benin' },
  { code: 'OUA', name: 'Ouagadougou Airport', city: 'Ouagadougou', country: 'Burkina Faso' },
  { code: 'BKO', name: 'Modibo Keita International Airport', city: 'Bamako', country: 'Mali' },
  { code: 'FNA', name: 'Lungi International Airport', city: 'Freetown', country: 'Sierra Leone' },
  { code: 'ROB', name: 'Roberts International Airport', city: 'Monrovia', country: 'Liberia' },
  { code: 'BJL', name: 'Banjul International Airport', city: 'Banjul', country: 'Gambia' },
  { code: 'CKY', name: 'Ahmed Sékou Touré International Airport', city: 'Conakry', country: 'Guinea' },
  { code: 'NIM', name: 'Diori Hamani International Airport', city: 'Niamey', country: 'Niger' },
  { code: 'NKC', name: 'Nouakchott–Oumtounsy International Airport', city: 'Nouakchott', country: 'Mauritania' },
  { code: 'OXB', name: 'Osvaldo Vieira International Airport', city: 'Bissau', country: 'Guinea-Bissau' },
  // Central / East / Southern Africa
  { code: 'DLA', name: 'Douala International Airport', city: 'Douala', country: 'Cameroon' },
  { code: 'NSI', name: 'Yaoundé Nsimalen International Airport', city: 'Yaoundé', country: 'Cameroon' },
  { code: 'LBV', name: 'Léon-Mba International Airport', city: 'Libreville', country: 'Gabon' },
  { code: 'FIH', name: "N'djili Airport", city: 'Kinshasa', country: 'DR Congo' },
  { code: 'BZV', name: 'Maya-Maya Airport', city: 'Brazzaville', country: 'Congo' },
  { code: 'SSG', name: 'Malabo International Airport', city: 'Malabo', country: 'Equatorial Guinea' },
  { code: 'NDJ', name: "N'Djamena International Airport", city: "N'Djamena", country: 'Chad' },
  { code: 'LAD', name: 'Quatro de Fevereiro Airport', city: 'Luanda', country: 'Angola' },
  { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya' },
  { code: 'MBA', name: 'Moi International Airport', city: 'Mombasa', country: 'Kenya' },
  { code: 'ADD', name: 'Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia' },
  { code: 'DAR', name: 'Julius Nyerere International Airport', city: 'Dar es Salaam', country: 'Tanzania' },
  { code: 'JRO', name: 'Kilimanjaro International Airport', city: 'Kilimanjaro', country: 'Tanzania' },
  { code: 'ZNZ', name: 'Abeid Amani Karume International Airport', city: 'Zanzibar', country: 'Tanzania' },
  { code: 'EBB', name: 'Entebbe International Airport', city: 'Kampala', country: 'Uganda' },
  { code: 'KGL', name: 'Kigali International Airport', city: 'Kigali', country: 'Rwanda' },
  { code: 'LUN', name: 'Kenneth Kaunda International Airport', city: 'Lusaka', country: 'Zambia' },
  { code: 'HRE', name: 'Robert Gabriel Mugabe International Airport', city: 'Harare', country: 'Zimbabwe' },
  { code: 'MPM', name: 'Maputo International Airport', city: 'Maputo', country: 'Mozambique' },
  { code: 'GBE', name: 'Sir Seretse Khama International Airport', city: 'Gaborone', country: 'Botswana' },
  { code: 'WDH', name: 'Hosea Kutako International Airport', city: 'Windhoek', country: 'Namibia' },
  { code: 'MRU', name: 'Sir Seewoosagur Ramgoolam International Airport', city: 'Mauritius', country: 'Mauritius' },
  { code: 'JNB', name: 'O. R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa' },
  { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa' },
  { code: 'DUR', name: 'King Shaka International Airport', city: 'Durban', country: 'South Africa' },
  // North Africa
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt' },
  { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco' },
  { code: 'ALG', name: 'Houari Boumediene Airport', city: 'Algiers', country: 'Algeria' },
  { code: 'TUN', name: 'Tunis–Carthage International Airport', city: 'Tunis', country: 'Tunisia' },
  // Europe
  { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'United Kingdom' },
  { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'United Kingdom' },
  { code: 'STN', name: 'Stansted Airport', city: 'London', country: 'United Kingdom' },
  { code: 'LTN', name: 'Luton Airport', city: 'London', country: 'United Kingdom' },
  { code: 'LCY', name: 'London City Airport', city: 'London', country: 'United Kingdom' },
  { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom' },
  { code: 'BHX', name: 'Birmingham Airport', city: 'Birmingham', country: 'United Kingdom' },
  { code: 'EDI', name: 'Edinburgh Airport', city: 'Edinburgh', country: 'United Kingdom' },
  { code: 'GLA', name: 'Glasgow Airport', city: 'Glasgow', country: 'United Kingdom' },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
  { code: 'ORY', name: 'Orly Airport', city: 'Paris', country: 'France' },
  { code: 'AMS', name: 'Schiphol Airport', city: 'Amsterdam', country: 'Netherlands' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
  { code: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Germany' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', city: 'Madrid', country: 'Spain' },
  { code: 'BCN', name: 'Josep Tarradellas Barcelona–El Prat Airport', city: 'Barcelona', country: 'Spain' },
  { code: 'LIS', name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal' },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino Airport', city: 'Rome', country: 'Italy' },
  { code: 'MXP', name: 'Malpensa Airport', city: 'Milan', country: 'Italy' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Türkiye' },
  { code: 'SAW', name: 'Sabiha Gökçen International Airport', city: 'Istanbul', country: 'Türkiye' },
  { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
  { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark' },
  { code: 'ARN', name: 'Arlanda Airport', city: 'Stockholm', country: 'Sweden' },
  { code: 'OSL', name: 'Oslo Airport', city: 'Oslo', country: 'Norway' },
  { code: 'HEL', name: 'Helsinki-Vantaa Airport', city: 'Helsinki', country: 'Finland' },
  { code: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland' },
  { code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece' },
  // Middle East
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates' },
  { code: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates' },
  { code: 'SHJ', name: 'Sharjah International Airport', city: 'Sharjah', country: 'United Arab Emirates' },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar' },
  { code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia' },
  { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia' },
  { code: 'MCT', name: 'Muscat International Airport', city: 'Muscat', country: 'Oman' },
  { code: 'KWI', name: 'Kuwait International Airport', city: 'Kuwait City', country: 'Kuwait' },
  { code: 'BAH', name: 'Bahrain International Airport', city: 'Manama', country: 'Bahrain' },
  { code: 'AMM', name: 'Queen Alia International Airport', city: 'Amman', country: 'Jordan' },
  { code: 'TLV', name: 'Ben Gurion Airport', city: 'Tel Aviv', country: 'Israel' },
  // Americas
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States' },
  { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'United States' },
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'Newark', country: 'United States' },
  { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington', country: 'United States' },
  { code: 'DCA', name: 'Ronald Reagan Washington National Airport', city: 'Washington', country: 'United States' },
  { code: 'ATL', name: 'Hartsfield–Jackson Atlanta International Airport', city: 'Atlanta', country: 'United States' },
  { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States' },
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States' },
  { code: 'AUS', name: 'Austin–Bergstrom International Airport', city: 'Austin', country: 'United States' },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States' },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States' },
  { code: 'SAN', name: 'San Diego International Airport', city: 'San Diego', country: 'United States' },
  { code: 'SEA', name: 'Seattle–Tacoma International Airport', city: 'Seattle', country: 'United States' },
  { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States' },
  { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'United States' },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States' },
  { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'United States' },
  { code: 'BOS', name: 'Logan International Airport', city: 'Boston', country: 'United States' },
  { code: 'PHL', name: 'Philadelphia International Airport', city: 'Philadelphia', country: 'United States' },
  { code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'United States' },
  { code: 'PHX', name: 'Phoenix Sky Harbor International Airport', city: 'Phoenix', country: 'United States' },
  { code: 'MSP', name: 'Minneapolis–Saint Paul International Airport', city: 'Minneapolis', country: 'United States' },
  { code: 'DTW', name: 'Detroit Metropolitan Wayne County Airport', city: 'Detroit', country: 'United States' },
  { code: 'CLT', name: 'Charlotte Douglas International Airport', city: 'Charlotte', country: 'United States' },
  { code: 'BWI', name: 'Baltimore/Washington International Airport', city: 'Baltimore', country: 'United States' },
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada' },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada' },
  { code: 'YUL', name: 'Montréal–Trudeau International Airport', city: 'Montréal', country: 'Canada' },
  { code: 'YYC', name: 'Calgary International Airport', city: 'Calgary', country: 'Canada' },
  { code: 'YOW', name: 'Ottawa Macdonald–Cartier International Airport', city: 'Ottawa', country: 'Canada' },
  { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico' },
  { code: 'PTY', name: 'Tocumen International Airport', city: 'Panama City', country: 'Panama' },
  { code: 'KIN', name: 'Norman Manley International Airport', city: 'Kingston', country: 'Jamaica' },
  { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia' },
  { code: 'GRU', name: 'São Paulo–Guarulhos International Airport', city: 'São Paulo', country: 'Brazil' },
  { code: 'GIG', name: 'Rio de Janeiro–Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil' },
  { code: 'EZE', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina' },
  // Asia / Oceania
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India' },
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India' },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India' },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India' },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore' },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong' },
  { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China' },
  { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China' },
  { code: 'CAN', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China' },
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
  { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan' },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia' },
  { code: 'CGK', name: 'Soekarno–Hatta International Airport', city: 'Jakarta', country: 'Indonesia' },
  { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines' },
  { code: 'LHE', name: 'Allama Iqbal International Airport', city: 'Lahore', country: 'Pakistan' },
  { code: 'KHI', name: 'Jinnah International Airport', city: 'Karachi', country: 'Pakistan' },
  { code: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', country: 'Bangladesh' },
  { code: 'CMB', name: 'Bandaranaike International Airport', city: 'Colombo', country: 'Sri Lanka' },
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia' },
];

// Nicknames for cities, keyed by airport code (lowercase, no accents)
const ALIASES: Record<string, string[]> = {
  LOS: ['eko', 'ikeja', 'murtala muhammed'],
  ABV: ['fct', 'nnamdi azikiwe'],
  PHC: ['ph', 'garden city'],
  JFK: ['nyc', 'ny', 'new york city', 'manhattan', 'kennedy'],
  LGA: ['nyc', 'ny', 'new york city', 'manhattan'],
  EWR: ['nyc', 'new york', 'new jersey'],
  IAD: ['dc', 'washington dc', 'washington d.c.'],
  DCA: ['dc', 'washington dc', 'washington d.c.'],
  LHR: ['london heathrow'],
  LGW: ['london gatwick'],
  CDG: ['paris cdg', 'roissy'],
  IST: ['turkey'],
  SAW: ['turkey'],
  JNB: ['joburg', 'jozi', 'oliver tambo'],
  ACC: ['kotoka'],
  DXB: ['dubai uae'],
  SFO: ['san fran', 'bay area'],
  LAX: ['la'],
  DFW: ['dallas fort worth'],
  BOM: ['bombay'],
  DEL: ['new delhi'],
};

// Countries typed by nickname -> country name (lowercase, no accents)
const COUNTRY_ALIASES: Record<string, string> = {
  uk: 'united kingdom',
  england: 'united kingdom',
  britain: 'united kingdom',
  'great britain': 'united kingdom',
  usa: 'united states',
  us: 'united states',
  america: 'united states',
  'united states of america': 'united states',
  uae: 'united arab emirates',
  emirates: 'united arab emirates',
  turkey: 'turkiye',
  'ivory coast': "cote d'ivoire",
  holland: 'netherlands',
  drc: 'dr congo',
  naija: 'nigeria',
  korea: 'south korea',
};

// States / provinces -> airports (lowercase, no accents)
const STATE_AIRPORTS: Record<string, string[]> = {
  // Nigeria
  lagos: ['LOS'],
  fct: ['ABV'],
  'federal capital territory': ['ABV'],
  rivers: ['PHC'],
  kano: ['KAN'],
  enugu: ['ENU'],
  imo: ['QOW'],
  edo: ['BNI'],
  'cross river': ['CBQ'],
  'akwa ibom': ['QUO'],
  kaduna: ['KAD'],
  kwara: ['ILR'],
  plateau: ['JOS'],
  oyo: ['IBA'],
  delta: ['QRW', 'ABB'],
  borno: ['MIU'],
  adamawa: ['YOL'],
  sokoto: ['SKO'],
  ondo: ['AKR'],
  bauchi: ['BCU'],
  katsina: ['DKA'],
  gombe: ['GMO'],
  'niger state': ['MXJ'],
  // United States
  california: ['LAX', 'SFO', 'SAN'],
  texas: ['IAH', 'DFW', 'AUS'],
  florida: ['MIA', 'MCO'],
  'new york': ['JFK', 'LGA'],
  'new jersey': ['EWR'],
  illinois: ['ORD'],
  nevada: ['LAS'],
  massachusetts: ['BOS'],
  pennsylvania: ['PHL'],
  colorado: ['DEN'],
  arizona: ['PHX'],
  minnesota: ['MSP'],
  michigan: ['DTW'],
  'north carolina': ['CLT'],
  maryland: ['BWI'],
  virginia: ['IAD'],
  // Canada
  ontario: ['YYZ', 'YOW'],
  'british columbia': ['YVR'],
  quebec: ['YUL'],
  alberta: ['YYC'],
  // UK / Australia
  scotland: ['EDI', 'GLA'],
  'new south wales': ['SYD'],
  victoria: ['MEL'],
};

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const startsWithWord = (text: string, q: string) =>
  text.split(/[\s\-–']+/).some((word) => word.startsWith(q));

/**
 * Ranks airports for a typed query.
 * 0 exact code / city starts with  ·  1 nickname or a word in the city starts with
 * 2 airport name word  ·  3 country, country nickname or state
 * 4 contains anywhere
 * Ties keep the order of LOCAL_AIRPORTS.
 */
export const searchLocalAirports = (rawQuery: string, limit = 8): Airport[] => {
  const q = normalize(rawQuery);
  if (!q) return [];

  // Countries typed by nickname ("uk", "usa", "turkey")
  const aliasCountries = new Set<string>();
  Object.entries(COUNTRY_ALIASES).forEach(([alias, country]) => {
    if (alias === q || (q.length >= 3 && alias.startsWith(q))) aliasCountries.add(country);
  });

  // States / provinces typed by name ("texas", "kano")
  const stateCodes = new Set<string>();
  Object.entries(STATE_AIRPORTS).forEach(([state, codes]) => {
    if (state === q || (q.length >= 3 && (state.startsWith(q) || startsWithWord(state, q)))) {
      codes.forEach((c) => stateCodes.add(c));
    }
  });

  const scored: { airport: Airport; score: number; order: number }[] = [];

  LOCAL_AIRPORTS.forEach((airport, order) => {
    const city = normalize(airport.city);
    const name = normalize(airport.name);
    const country = normalize(airport.country);
    const code = airport.code.toLowerCase();
    const aliases = ALIASES[airport.code] ?? [];

    let score = -1;
    if (code === q || city.startsWith(q)) score = 0;
    else if (aliases.some((a) => a === q || a.startsWith(q))) score = 1;
    else if (startsWithWord(city, q)) score = 1;
    else if (startsWithWord(name, q)) score = 2;
    else if (country.startsWith(q) || (q.length >= 3 && startsWithWord(country, q))) score = 3;
    else if (aliasCountries.has(country)) score = 3;
    else if (stateCodes.has(airport.code)) score = 3;
    else if (q.length >= 3 && (city.includes(q) || name.includes(q))) score = 4;

    if (score >= 0) scored.push({ airport, score, order });
  });

  return scored
    .sort((a, b) => a.score - b.score || a.order - b.order)
    .slice(0, limit)
    .map((s) => s.airport);
};