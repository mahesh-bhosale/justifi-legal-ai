import { and, eq, gte, ilike, lte, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { lawyerProfiles, type AvailabilityStatus } from '../models/schema';

export interface LawyerSearchFilters {
  specializations?: string[];
  city?: string;
  minYears?: number;
  maxRate?: number;
  languages?: string[];
  availability?: AvailabilityStatus;
  minRating?: number;
  limit?: number;
  offset?: number;
}

export interface RankedLawyerProfile {
  id: number;
  userId: string;
  specializations: string[];
  yearsExperience: number;
  bio: string;
  officeAddress: string;
  serviceAreas: string[];
  languages: string[];
  hourlyRate: number | null;
  availabilityStatus: AvailabilityStatus;
  rating: string | number | null;
  casesHandled: number | null;
  successRate: string | null;
  verified: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  score: number;
}

class LawyersService {
  async searchLawyers(filters: LawyerSearchFilters): Promise<RankedLawyerProfile[]> {
    const conditions: any[] = [];

    if (filters.specializations && filters.specializations.length > 0) {
      conditions.push(
        or(
          ...filters.specializations.map((spec) =>
            ilike(sql`${lawyerProfiles.specializations}::text`, `%${spec}%`)
          )
        )
      );
    }

    if (filters.languages && filters.languages.length > 0) {
      conditions.push(
        or(
          ...filters.languages.map((lang) =>
            ilike(sql`${lawyerProfiles.languages}::text`, `%${lang}%`)
          )
        )
      );
    }

    if (filters.minYears !== undefined) {
      conditions.push(gte(lawyerProfiles.yearsExperience, filters.minYears));
    }

    if (filters.maxRate !== undefined) {
      conditions.push(lte(lawyerProfiles.hourlyRate, filters.maxRate));
    }

    if (filters.availability) {
      conditions.push(eq(lawyerProfiles.availabilityStatus, filters.availability));
    }

    if (filters.minRating !== undefined) {
      // rating stored as numeric, Drizzle returns as string sometimes → compare as text cast
      conditions.push(gte(sql`${lawyerProfiles.rating}::numeric`, filters.minRating));
    }

    if (filters.city) {
      // Do a broad match on officeAddress for the city/region
      conditions.push(ilike(lawyerProfiles.officeAddress, `%${filters.city}%`));
    }

    const rows = await db
      .select()
      .from(lawyerProfiles)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(filters.limit ?? 50)
      .offset(filters.offset ?? 0);

    const ranked = rows.map((p) => {
      const years = Number(p.yearsExperience ?? 0);
      const ratingNum = p.rating === null ? 0 : Number(p.rating);
      const hourly = p.hourlyRate === null ? null : Number(p.hourlyRate);

      // specializationMatch: 1 if all requested specializations are included; 0.5 if any overlap; 0 otherwise
      let specializationMatch = 0;
      if (filters.specializations && filters.specializations.length > 0) {
        const set = new Set((p.specializations ?? []).map((s) => s.toLowerCase()));
        const requested = filters.specializations.map((s) => s.toLowerCase());
        const hasAll = requested.every((s) => set.has(s));
        const hasAny = requested.some((s) => set.has(s));
        specializationMatch = hasAll ? 1 : hasAny ? 0.5 : 0;
      }

      // locationMatch: 1 if city/region matches in officeAddress
      let locationMatch = 0;
      if (filters.city && p.officeAddress) {
        locationMatch = p.officeAddress.toLowerCase().includes(filters.city.toLowerCase()) ? 1 : 0;
      }

      // normalizedYears: years / 20 capped to 1
      const normalizedYears = Math.min(1, years / 20);

      // ratingNorm: rating / 5
      const ratingNorm = Math.min(1, Math.max(0, ratingNum / 5));

      // availabilityBoost: available=1, limited=0.5, unavailable=0
      let availabilityBoost = 0;
      if (p.availabilityStatus === 'available') availabilityBoost = 1;
      else if (p.availabilityStatus === 'limited') availabilityBoost = 0.5;
      else availabilityBoost = 0;

      // languageMatch: 1 if any overlap between filters.languages and profile.languages
      let languageMatch = 0;
      if (filters.languages && filters.languages.length > 0) {
        const profLangs = new Set((p.languages ?? []).map((l) => l.toLowerCase()));
        const anyOverlap = filters.languages.some((l) => profLangs.has(l.toLowerCase()));
        languageMatch = anyOverlap ? 1 : 0;
      }

      // feeFit: up to 10 if hourlyRate within maxRate; scaled so lower is better
      let feeFit = 0;
      if (filters.maxRate !== undefined && hourly !== null) {
        if (hourly <= filters.maxRate) {
          // Map [0 .. maxRate] to [10 .. 2], reserving max of 10 and not giving 0
          const ratio = hourly / (filters.maxRate || 1);
          feeFit = Math.max(2, 10 - ratio * 8); // 10 at zero cost, ~2 near the max
        } else {
          feeFit = 0;
        }
      }

      const score =
        0 +
        40 * specializationMatch +
        15 * locationMatch +
        15 * normalizedYears +
        15 * ratingNorm +
        10 * availabilityBoost +
        5 * languageMatch +
        feeFit;

      return {
        ...p,
        score: Number(score.toFixed(2)),
      } as RankedLawyerProfile;
    });

    ranked.sort((a, b) => b.score - a.score);
    return ranked;
  }
}

export default new LawyersService();


