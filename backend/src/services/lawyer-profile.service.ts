import { eq, and, ilike, or, gte, lte, sql } from 'drizzle-orm';
import { db } from '../db';
import { lawyerProfiles, users, type LawyerProfile, type NewLawyerProfile, type AvailabilityStatus } from '../models/schema';

export interface LawyerProfileFilters {
  specializations?: string[];
  serviceAreas?: string[];
  languages?: string[];
  minExperience?: number;
  maxExperience?: number;
  minHourlyRate?: number;
  maxHourlyRate?: number;
  availabilityStatus?: AvailabilityStatus;
  minRating?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface LawyerProfileWithUser extends LawyerProfile {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

class LawyerProfileService {
  /**
   * Create a new lawyer profile
   */
  async createProfile(profileData: NewLawyerProfile): Promise<LawyerProfile> {
    try {
      const [profile] = await db.insert(lawyerProfiles).values(profileData).returning();
      return profile;
    } catch (error) {
      console.error('Error creating lawyer profile:', error);
      throw new Error('Failed to create lawyer profile');
    }
  }

  /**
   * Update an existing lawyer profile
   */
  async updateProfile(profileId: number, userId: string, updateData: Partial<NewLawyerProfile>): Promise<LawyerProfile> {
    try {
      const [profile] = await db
        .update(lawyerProfiles)
        .set({ ...updateData, updatedAt: new Date() })
        .where(and(eq(lawyerProfiles.id, profileId), eq(lawyerProfiles.userId, userId)))
        .returning();
      
      if (!profile) {
        throw new Error('Profile not found or access denied');
      }
      
      return profile;
    } catch (error) {
      console.error('Error updating lawyer profile:', error);
      throw new Error('Failed to update lawyer profile');
    }
  }

  /**
   * Get a lawyer profile by ID
   */
  async getProfileById(profileId: number): Promise<LawyerProfileWithUser | null> {
    try {
      const result = await db
        .select({
          id: lawyerProfiles.id,
          userId: lawyerProfiles.userId,
          specializations: lawyerProfiles.specializations,
          yearsExperience: lawyerProfiles.yearsExperience,
          bio: lawyerProfiles.bio,
          officeAddress: lawyerProfiles.officeAddress,
          serviceAreas: lawyerProfiles.serviceAreas,
          languages: lawyerProfiles.languages,
          education: lawyerProfiles.education,
          barAdmissions: lawyerProfiles.barAdmissions,
          hourlyRate: lawyerProfiles.hourlyRate,
          consultationFee: lawyerProfiles.consultationFee,
          availabilityStatus: lawyerProfiles.availabilityStatus,
          rating: lawyerProfiles.rating,
          casesHandled: lawyerProfiles.casesHandled,
          successRate: lawyerProfiles.successRate,
          verified: lawyerProfiles.verified,
          createdAt: lawyerProfiles.createdAt,
          updatedAt: lawyerProfiles.updatedAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(lawyerProfiles)
        .innerJoin(users, eq(lawyerProfiles.userId, users.id))
        .where(eq(lawyerProfiles.id, profileId))
        .limit(1);

      return result[0] || null;
    } catch (error) {
      console.error('Error getting lawyer profile:', error);
      throw new Error('Failed to get lawyer profile');
    }
  }

  /**
   * Get a lawyer profile by user ID
   */
  async getProfileByUserId(userId: string): Promise<LawyerProfile | null> {
    try {
      const [profile] = await db
        .select()
        .from(lawyerProfiles)
        .where(eq(lawyerProfiles.userId, userId))
        .limit(1);

      return profile || null;
    } catch (error) {
      console.error('Error getting lawyer profile by user ID:', error);
      throw new Error('Failed to get lawyer profile');
    }
  }

  /**
   * Get all lawyer profiles with filters
   */
  async getProfiles(filters: LawyerProfileFilters = {}): Promise<LawyerProfileWithUser[]> {
    try {
      const conditions = [];

      // Filter by specializations
      if (filters.specializations && filters.specializations.length > 0) {
        conditions.push(
          or(...filters.specializations.map(spec => 
            ilike(sql`${lawyerProfiles.specializations}::text`, `%${spec}%`)
          ))
        );
      }

      // Filter by service areas
      if (filters.serviceAreas && filters.serviceAreas.length > 0) {
        conditions.push(
          or(...filters.serviceAreas.map(area => 
            ilike(sql`${lawyerProfiles.serviceAreas}::text`, `%${area}%`)
          ))
        );
      }

      // Filter by languages
      if (filters.languages && filters.languages.length > 0) {
        conditions.push(
          or(...filters.languages.map(lang => 
            ilike(sql`${lawyerProfiles.languages}::text`, `%${lang}%`)
          ))
        );
      }

      // Filter by experience range
      if (filters.minExperience !== undefined) {
        conditions.push(gte(lawyerProfiles.yearsExperience, filters.minExperience));
      }
      if (filters.maxExperience !== undefined) {
        conditions.push(lte(lawyerProfiles.yearsExperience, filters.maxExperience));
      }

      // Filter by hourly rate range
      if (filters.minHourlyRate !== undefined) {
        conditions.push(gte(lawyerProfiles.hourlyRate, filters.minHourlyRate));
      }
      if (filters.maxHourlyRate !== undefined) {
        conditions.push(lte(lawyerProfiles.hourlyRate, filters.maxHourlyRate));
      }

      // Filter 
      
      // Filter by minimum rating
      if (filters.minRating !== undefined) {
        conditions.push(gte(lawyerProfiles.rating, filters.minRating.toString()));
      }

      // Search in name, bio, or specializations
      if (filters.search) {
        conditions.push(
          or(
            ilike(users.name, `%${filters.search}%`),
            ilike(lawyerProfiles.bio, `%${filters.search}%`),
            ilike(sql`${lawyerProfiles.specializations}::text`, `%${filters.search}%`)
          )
        );
      }

      // Build the query with all conditions and pagination
      const query = db
        .select({
          id: lawyerProfiles.id,
          userId: lawyerProfiles.userId,
          specializations: lawyerProfiles.specializations,
          yearsExperience: lawyerProfiles.yearsExperience,
          bio: lawyerProfiles.bio,
          officeAddress: lawyerProfiles.officeAddress,
          serviceAreas: lawyerProfiles.serviceAreas,
          languages: lawyerProfiles.languages,
          education: lawyerProfiles.education,
          barAdmissions: lawyerProfiles.barAdmissions,
          hourlyRate: lawyerProfiles.hourlyRate,
          consultationFee: lawyerProfiles.consultationFee,
          availabilityStatus: lawyerProfiles.availabilityStatus,
          rating: lawyerProfiles.rating,
          casesHandled: lawyerProfiles.casesHandled,
          successRate: lawyerProfiles.successRate,
          verified: lawyerProfiles.verified,
          createdAt: lawyerProfiles.createdAt,
          updatedAt: lawyerProfiles.updatedAt,
          user: {
            id: users.id,
            name: users.name,
            email: users.email,
          },
        })
        .from(lawyerProfiles)
        .innerJoin(users, eq(lawyerProfiles.userId, users.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(filters.limit || 50)
        .offset(filters.offset || 0);

      const profiles = await query;
      return profiles;
    } catch (error) {
      console.error('Error getting lawyer profiles:', error);
      throw new Error('Failed to get lawyer profiles');
    }
  }

  /**
   * Verify a lawyer profile (admin only)
   */
  async verifyProfile(profileId: number): Promise<LawyerProfile> {
    try {
      const [profile] = await db
        .update(lawyerProfiles)
        .set({ verified: true, updatedAt: new Date() })
        .where(eq(lawyerProfiles.id, profileId))
        .returning();

      if (!profile) {
        throw new Error('Profile not found');
      }

      return profile;
    } catch (error) {
      console.error('Error verifying lawyer profile:', error);
      throw new Error('Failed to verify lawyer profile');
    }
  }

  /**
   * Get available specializations
   */
  getAvailableSpecializations(): string[] {
    return [
      // --- Core Legal Fields ---
      'Criminal Law',
      'Civil Law',
      'Corporate Law',
      'Constitutional Law',
      'Administrative Law',
      'International Law',
  
      // --- Family & Personal Law ---
      'Family Law',
      'Divorce Law',
      'Child Custody',
      'Adoption Law',
      'Succession and Inheritance Law',
      'Estate Planning',
  
      // --- Business & Finance ---
      'Tax Law',
      'Banking Law',
      'Securities Law',
      'Insurance Law',
      'Bankruptcy Law',
      'Consumer Protection Law',
      'Competition (Antitrust) Law',
  
      // --- Employment & Labor ---
      'Labor Law',
      'Employment Law',
      'Industrial Relations Law',
      'Workers Compensation',
      'Social Security Law',
  
      // --- Property & Contracts ---
      'Real Estate Law',
      'Contract Law',
      'Property Law',
      'Tenancy Law',
  
      // --- Technology & Media ---
      'Cyber Law',
      'Intellectual Property Law',
      'Data Protection and Privacy Law',
      'Information Technology Law',
      'Media and Broadcasting Law',
      'Entertainment Law',
      'Sports Law',
  
      // --- Health, Environment & Society ---
      'Healthcare Law',
      'Medical Malpractice Law',
      'Environmental Law',
      'Human Rights Law',
      'Animal Welfare Law',
      'Education Law',
  
      // --- Specialized & Emerging Areas ---
      'Maritime (Admiralty) Law',
      'Aviation Law',
      'Energy Law',
      'Infrastructure Law',
      'Mining and Natural Resources Law',
      'Agricultural Law',
      'Election Law',
      'Public Interest Litigation (PIL)',
      'Forensic and Investigative Law',
  
      // --- Immigration & International Relations ---
      'Immigration Law',
      'Refugee and Asylum Law',
      'International Trade Law',
  
      // --- Tort and Liability ---
      'Personal Injury Law',
      'Product Liability Law',
      'Defamation Law',
  
      // --- Specific Practice Areas ---
      'DUI/DWI Law',
      'Veterans Benefits Law',
      'Customs and Excise Law',
      'Marital Dispute Law',
  
      // --- Indian Context Specific ---
      'Cyber Crime Law',
      'Service Law (Government Employment)',
      'Intellectual Property (Patents, Trademarks, Copyrights)',
      'Alternative Dispute Resolution (ADR)',
      'Arbitration and Mediation Law',
      'Public Policy Law'
    ];
  }
  

  getAvailableServiceAreas(): string[] {
  return [
    'Mumbai, MH',
    'Delhi, DL',
    'Bengaluru, KA',
    'Hyderabad, TS',
    'Chennai, TN',
    'Kolkata, WB',
    'Pune, MH',
    'Ahmedabad, GJ',
    'Surat, GJ',
    'Jaipur, RJ',
    'Lucknow, UP',
    'Kanpur, UP',
    'Nagpur, MH',
    'Indore, MP',
    'Bhopal, MP',
    'Patna, BR',
    'Vadodara, GJ',
    'Ludhiana, PB',
    'Agra, UP',
    'Nashik, MH',
    'Rajkot, GJ',
    'Varanasi, UP',
    'Visakhapatnam, AP',
    'Coimbatore, TN',
    'Thiruvananthapuram, KL',
    'Kochi, KL',
    'Mangalore, KA',
    'Chandigarh, CH',
    'Gurugram, HR',
    'Noida, UP',
    'Ghaziabad, UP',
    'Amritsar, PB',
    'Ranchi, JH',
    'Guwahati, AS',
    'Mysuru, KA',
    'Madurai, TN',
    'Raipur, CG',
    'Dehradun, UK',
    'Jammu, JK',
    'Udaipur, RJ'
  ];
}


  /**
   * Get available languages
   */
  // getAvailableLanguages(): string[] {
  //   return [
  //     'English',
  //     'Spanish',
  //     'French',
  //     'German',
  //     'Italian',
  //     'Portuguese',
  //     'Russian',
  //     'Chinese (Mandarin)',
  //     'Chinese (Cantonese)',
  //     'Japanese',
  //     'Korean',
  //     'Arabic',
  //     'Hindi',
  //     'Urdu',
  //     'Bengali',
  //     'Punjabi',
  //     'Gujarati',
  //     'Tamil',
  //     'Telugu',
  //     'Marathi',
  //     'Vietnamese',
  //     'Thai',
  //     'Indonesian',
  //     'Malay',
  //     'Tagalog',
  //     'Dutch',
  //     'Swedish',
  //     'Norwegian',
  //     'Danish',
  //     'Finnish',
  //     'Polish',
  //     'Czech',
  //     'Hungarian',
  //     'Romanian',
  //     'Bulgarian',
  //     'Greek',
  //     'Turkish',
  //     'Hebrew',
  //     'Persian',
  //     'Swahili',
  //     'Amharic',
  //     'Yoruba',
  //     'Igbo',
  //     'Hausa',
  //     'Zulu',
  //     'Afrikaans'
  //   ];
  // }
  getAvailableLanguages(): string[] {
    return [
      'English',
      'Spanish',
      'French',
      'German',
      'Italian',
      'Portuguese',
      'Russian',
      'Chinese (Mandarin)',
      'Chinese (Cantonese)',
      'Japanese',
      'Korean',
      'Arabic',
  
      // Indian Languages 🇮🇳
      'Hindi',
      'Urdu',
      'Bengali',
      'Punjabi',
      'Gujarati',
      'Marathi',
      'Tamil',
      'Telugu',
      'Kannada',
      'Malayalam',
      'Odia',
      'Assamese',
      'Konkani',
      'Sanskrit',
      'Sindhi',
      'Manipuri (Meitei)',
      'Dogri',
      'Kashmiri',
      'Maithili',
      'Santali',
      'Bodo',
      'Nepali',
  
      // Other Asian & Global Languages
      'Vietnamese',
      'Thai',
      'Indonesian',
      'Malay',
      'Tagalog',
      'Dutch',
      'Swedish',
      'Norwegian',
      'Danish',
      'Finnish',
      'Polish',
      'Czech',
      'Hungarian',
      'Romanian',
      'Bulgarian',
      'Greek',
      'Turkish',
      'Hebrew',
      'Persian',
      'Swahili',
      'Amharic',
      'Yoruba',
      'Igbo',
      'Hausa',
      'Zulu',
      'Afrikaans'
    ];
  }
  
}

export default new LawyerProfileService();
