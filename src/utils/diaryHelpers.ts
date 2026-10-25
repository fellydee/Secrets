import { MoodType, WeatherType } from '../types/diary';

export interface MoodMeta {
  type: MoodType;
  label: string;
  emoji: string;
  colorClass: string;
  badgeBg: string;
}

export const MOODS: Record<MoodType, MoodMeta> = {
  joyful: { type: 'joyful', label: 'joyful', emoji: '🌸', colorClass: 'text-[#E83375]', badgeBg: 'bg-[#FDF0F5] text-[#E83375] border-[#F8CBDC]' },
  peaceful: { type: 'peaceful', label: 'peaceful', emoji: '🌿', colorClass: 'text-[#2D6A4F]', badgeBg: 'bg-[#EEF7F2] text-[#2D6A4F] border-[#C7E6D7]' },
  thoughtful: { type: 'thoughtful', label: 'thoughtful', emoji: '🌌', colorClass: 'text-[#4338CA]', badgeBg: 'bg-[#EEF2FF] text-[#4338CA] border-[#C7D2FE]' },
  grateful: { type: 'grateful', label: 'grateful', emoji: '🌷', colorClass: 'text-[#D97706]', badgeBg: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]' },
  productive: { type: 'productive', label: 'productive', emoji: '🌱', colorClass: 'text-[#2563EB]', badgeBg: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]' },
  melancholy: { type: 'melancholy', label: 'melancholy', emoji: '🌧️', colorClass: 'text-[#64748B]', badgeBg: 'bg-[#F1F5F9] text-[#64748B] border-[#CBD5E1]' },
  anxious: { type: 'anxious', label: 'anxious', emoji: '🌊', colorClass: 'text-[#7C3AED]', badgeBg: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]' },
  energetic: { type: 'energetic', label: 'energetic', emoji: '🍒', colorClass: 'text-[#E83375]', badgeBg: 'bg-[#FDF0F5] text-[#E83375] border-[#F8CBDC]' },
};

export interface WeatherMeta {
  type: WeatherType;
  label: string;
  emoji: string;
}

export const WEATHERS: Record<WeatherType, WeatherMeta> = {
  sunny: { type: 'sunny', label: 'sunny', emoji: '☀️' },
  cloudy: { type: 'cloudy', label: 'cloudy', emoji: '⛅' },
  rainy: { type: 'rainy', label: 'rainy', emoji: '🌧️' },
  snowy: { type: 'snowy', label: 'snowy', emoji: '❄️' },
  stormy: { type: 'stormy', label: 'stormy', emoji: '⛈️' },
  windy: { type: 'windy', label: 'windy', emoji: '🍃' },
  night: { type: 'night', label: 'starlit', emoji: '🌙' },
};

export const REFLECTION_PROMPTS = [
  'How was your day? 🌷',
  'What is a secret moment that made your heart skip today?',
  'plant a memory everyday, what will you remember about this afternoon?',
  'What is a quiet truth you whispered to yourself today?',
  'Describe a sensory detail: a scent, an old song, or someone’s smile.',
  'What made you feel proud of who you are becoming?',
  'What is something heavy you are ready to let go of tonight?',
  'Who crossed your mind today that you are grateful for?',
  'What did you learn about your resilience this week?',
  'If today was a plant in your garden, how would you water it?'
];

export function calculateWordCount(text: string): number {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function formatJournalDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// Format like One Year: "saturday, 24.05"
export function formatOneYearStyleDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    const weekday = d.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${weekday}, ${day}.${month}`;
  } catch {
    return dateStr;
  }
}

// Calculate Day of Year (e.g. 18/365)
export function getDayOfYearProgress(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = d.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayNumber = Math.floor(diff / oneDay);
    const isLeapYear = (d.getFullYear() % 4 === 0 && d.getFullYear() % 100 !== 0) || d.getFullYear() % 400 === 0;
    const totalDays = isLeapYear ? 366 : 365;
    return `${dayNumber}/${totalDays}`;
  } catch {
    return '';
  }
}
