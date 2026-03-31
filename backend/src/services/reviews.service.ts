import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db';
import { cases, lawyerProfiles, reviews, users } from '../models/schema';

export type ReviewServiceErrorCode =
  | 'case_not_found'
  | 'forbidden'
  | 'case_not_completed'
  | 'case_missing_lawyer'
  | 'case_already_reviewed'
  | 'user_already_reviewed_lawyer';

export class ReviewsServiceError extends Error {
  code: ReviewServiceErrorCode;

  constructor(code: ReviewServiceErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export type ReviewsServiceReview = typeof reviews.$inferSelect;

export type LawyerReviewWithCitizenName = ReviewsServiceReview & {
  citizenName: string;
};

export interface LawyerReviewStats {
  averageRating: number | null;
  totalReviews: number;
  ratingDistribution: {
    [key: number]: number;
  };
}

class ReviewsService {
  async getCaseReview(caseId: number, citizenId: string): Promise<{
    hasReviewForCase: boolean;
    hasUserReviewedLawyer: boolean;
    review: ReviewsServiceReview | null;
  }> {
    const [c] = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
    if (!c) throw new ReviewsServiceError('case_not_found', 'Case not found');
    if (c.citizenId !== citizenId) throw new ReviewsServiceError('forbidden', 'Not allowed');

    if (!c.lawyerId) {
      // If there is no lawyer associated, the user cannot review.
      return {
        hasReviewForCase: false,
        hasUserReviewedLawyer: false,
        review: null,
      };
    }

    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.caseId, caseId))
      .limit(1);

    const [userReview] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(and(eq(reviews.citizenId, citizenId), eq(reviews.lawyerId, c.lawyerId)))
      .limit(1);

    return {
      hasReviewForCase: !!review,
      hasUserReviewedLawyer: !!userReview,
      review: review ?? null,
    };
  }

  async getUserLawyerReview(lawyerId: string, citizenId: string): Promise<ReviewsServiceReview | null> {
    const [row] = await db.select().from(reviews).where(and(eq(reviews.citizenId, citizenId), eq(reviews.lawyerId, lawyerId))).limit(1);
    return row ?? null;
  }

  async createReview(input: {
    caseId: number;
    lawyerId: string;
    citizenId: string;
    rating: number;
    comment?: string;
  }): Promise<ReviewsServiceReview> {
    return await db.transaction(async (tx) => {
      const [c] = await tx.select().from(cases).where(eq(cases.id, input.caseId)).limit(1);
      if (!c) throw new ReviewsServiceError('case_not_found', 'Case not found');
      if (c.citizenId !== input.citizenId) throw new ReviewsServiceError('forbidden', 'Not allowed');

      const status = c.status as string;
      if (status !== 'resolved' && status !== 'closed') {
        throw new ReviewsServiceError('case_not_completed', 'Case must be resolved or closed to review');
      }

      if (!c.lawyerId) {
        throw new ReviewsServiceError('case_missing_lawyer', 'Case has no associated lawyer');
      }

      // Enforce that the review matches the lawyer assigned on the case.
      if (String(c.lawyerId) !== String(input.lawyerId)) {
        throw new ReviewsServiceError('forbidden', 'Lawyer does not match case');
      }

      const [caseReview] = await tx
        .select()
        .from(reviews)
        .where(eq(reviews.caseId, input.caseId))
        .limit(1);
      if (caseReview) throw new ReviewsServiceError('case_already_reviewed', 'You have already reviewed this case');

      const [userLawyerReview] = await tx
        .select()
        .from(reviews)
        .where(and(eq(reviews.citizenId, input.citizenId), eq(reviews.lawyerId, input.lawyerId)))
        .limit(1);
      if (userLawyerReview) {
        throw new ReviewsServiceError(
          'user_already_reviewed_lawyer',
          'You have already reviewed this lawyer'
        );
      }

      const [created] = await tx
        .insert(reviews)
        .values({
          caseId: input.caseId,
          lawyerId: input.lawyerId,
          citizenId: input.citizenId,
          rating: input.rating,
          comment: input.comment ?? null,
          // createdAt/updatedAt are defaulted by DB
        })
        .returning();

      // Recalculate lawyer stats inside the same transaction.
      const stats = await tx.execute(
        sql<{ avgRating: string | null; totalReviews: number }>`SELECT
          AVG(${reviews.rating})::numeric(3,2)::text AS "avgRating",
          COUNT(*)::int AS "totalReviews"
        FROM reviews
        WHERE ${reviews.lawyerId} = ${input.lawyerId}`
      );

      const avgRating = stats[0]?.avgRating ? Number(stats[0].avgRating) : null;
      const totalReviews = Number(stats[0]?.totalReviews ?? 0);

      await tx
        .update(lawyerProfiles)
        .set({
          rating: avgRating != null ? avgRating.toFixed(2) : '0.00',
          casesHandled: totalReviews,
          updatedAt: new Date() as any,
        })
        .where(eq(lawyerProfiles.userId, input.lawyerId));

      return created;
    });
  }

  async getLawyerReviews(lawyerId: string): Promise<LawyerReviewWithCitizenName[]> {
    return await db
      .select({
        id: reviews.id,
        caseId: reviews.caseId,
        lawyerId: reviews.lawyerId,
        citizenId: reviews.citizenId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        updatedAt: reviews.updatedAt,
        citizenName: users.name,
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.citizenId, users.id))
      .where(eq(reviews.lawyerId, lawyerId))
      .orderBy(desc(reviews.createdAt));
  }

  async getLawyerReviewStats(lawyerId: string): Promise<LawyerReviewStats> {
    const [row] = await db.execute(
      sql<{ averageRating: string | null; totalReviews: number }>`SELECT
        AVG(${reviews.rating})::numeric(3,2)::text AS "averageRating",
        COUNT(*)::int AS "totalReviews"
      FROM reviews
      WHERE ${reviews.lawyerId} = ${lawyerId}`
    );

    const distributionRows = await db.execute(
      sql<{ rating: number; count: number }[]>`SELECT
        ${reviews.rating}::int AS "rating",
        COUNT(*)::int AS "count"
      FROM reviews
      WHERE ${reviews.lawyerId} = ${lawyerId}
      GROUP BY ${reviews.rating}
      ORDER BY ${reviews.rating}`
    );

    const distribution: Record<number, number> = {};
    for (const r of distributionRows as unknown as { rating: number; count: number }[]) {
      distribution[Number(r.rating)] = Number(r.count);
    }

    return {
      averageRating: row?.averageRating ? Number(row.averageRating) : null,
      totalReviews: Number(row?.totalReviews ?? 0),
      ratingDistribution: distribution,
    };
  }

  async deleteReview(reviewId: number, citizenId: string): Promise<boolean> {
    return await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
      if (!existing) return false;
      if (existing.citizenId !== citizenId) throw new ReviewsServiceError('forbidden', 'Not allowed');

      const lawyerId = existing.lawyerId;

      await tx.delete(reviews).where(eq(reviews.id, reviewId));

      // Recalculate stats after deletion.
      const stats = await tx.execute(
        sql<{ avgRating: string | null; totalReviews: number }>`SELECT
          AVG(${reviews.rating})::numeric(3,2)::text AS "avgRating",
          COUNT(*)::int AS "totalReviews"
        FROM reviews
        WHERE ${reviews.lawyerId} = ${lawyerId}`
      );

      const avgRating = stats[0]?.avgRating ? Number(stats[0].avgRating) : null;
      const totalReviews = Number(stats[0]?.totalReviews ?? 0);

      await tx
        .update(lawyerProfiles)
        .set({
          rating: avgRating != null ? avgRating.toFixed(2) : '0.00',
          casesHandled: totalReviews,
          updatedAt: new Date() as any,
        })
        .where(eq(lawyerProfiles.userId, lawyerId));

      return true;
    });
  }
}

export default new ReviewsService();

