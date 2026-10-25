export type MoodType = 
  | 'joyful' 
  | 'peaceful' 
  | 'productive' 
  | 'thoughtful' 
  | 'melancholy' 
  | 'anxious' 
  | 'grateful' 
  | 'energetic';

export type WeatherType = 
  | 'sunny' 
  | 'cloudy' 
  | 'rainy' 
  | 'snowy' 
  | 'stormy' 
  | 'windy' 
  | 'night';

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  mood: MoodType;
  weather: WeatherType;
  tags: string[];
  photos: string[]; // Base64 image data URLs
  audioMemo?: string | null; // Base64 audio data URL
  audioDuration?: number; // Duration in seconds
  isFavorite: boolean;
  location?: string;
  wordCount: number;
}

export interface SecuritySettings {
  isLockEnabled: boolean;
  isBiometricsEnabled: boolean;
  biometricCredentialId: string | null;
  biometricUserName?: string;
  isPinEnabled: boolean;
  pinHash: string | null; // SHA-256 hash
  autoLockMinutes: number; // 0 = immediate, 1, 5, 15, -1 = never
  lastActiveTimestamp: number;
  stealthMode: boolean; // Disguises app title
  fakeDecoyPinHash: string | null;
}

export interface JpegExportTheme {
  id: 'parchment' | 'dark-velvet' | 'clean-linen' | 'grid-journal' | 'cyber-stealth';
  name: string;
  bgColor: string;
  textColor: string;
  fontClass: string;
  accentColor: string;
}

export interface PdfExportOptions {
  scope: 'all' | 'single' | 'favorites' | 'date-range';
  singleEntryId?: string;
  startDate?: string;
  endDate?: string;
  includePhotos: boolean;
  includeAudioNotes: boolean;
  watermark: boolean;
  watermarkText: string;
  paperSize: 'a4' | 'letter';
}
