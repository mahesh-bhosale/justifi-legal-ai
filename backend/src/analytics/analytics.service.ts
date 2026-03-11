import { and, count, desc, eq, gte, lte, sql, inArray } from 'drizzle-orm';
import { db } from '../lib/db';
import { aiUsage, casePredictions, caseProposals, cases, reviews, users } from '../models/schema';

// Helper to get start/end of last N months
function getMonthWindow(monthsBack: number = 6) {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const start = new Date(end);
  start.setMonth(start.getMonth() - monthsBack);
  return { start, end };
}

export class AnalyticsService {
  // -------- Admin analytics --------

  async getAdminOverview() {
    const [{ totalUsers }] = await db
      .select({ totalUsers: count() })
      .from(users);

    const [{ totalCases }] = await db
      .select({ totalCases: count() })
      .from(cases);

    const [{ totalLawyers }] = await db
      .select({ totalLawyers: count() })
      .from(users)
      .where(eq(users.role, 'lawyer'));

    const [{ totalCitizens }] = await db
      .select({ totalCitizens: count() })
      .from(users)
      .where(eq(users.role, 'citizen'));

    return {
      totalUsers,
      totalCases,
      totalLawyers,
      totalCitizens,
    };
  }

  async getAdminUsersGrowth() {
    const { start, end } = getMonthWindow(6);

    const rows = await db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM ${users.createdAt})::int`,
        month: sql<number>`EXTRACT(MONTH FROM ${users.createdAt})::int`,
        count: count().as('count'),
      })
      .from(users)
      .where(
        and(
          gte(users.createdAt, start),
          lte(users.createdAt, end),
        ),
      )
      .groupBy(
        sql`EXTRACT(YEAR FROM ${users.createdAt})`,
        sql`EXTRACT(MONTH FROM ${users.createdAt})`,
      )
      .orderBy(
        sql`EXTRACT(YEAR FROM ${users.createdAt})`,
        sql`EXTRACT(MONTH FROM ${users.createdAt})`,
      );

    return rows.map((r) => ({
      label: `${r.year}-${String(r.month).padStart(2, '0')}`,
      count: Number(r.count),
    }));
  }

  async getAdminCasesTrend() {
    const { start, end } = getMonthWindow(6);

    const rows = await db
      .select({
        year: sql<number>`EXTRACT(YEAR FROM ${cases.createdAt})::int`,
        month: sql<number>`EXTRACT(MONTH FROM ${cases.createdAt})::int`,
        count: count().as('count'),
      })
      .from(cases)
      .where(
        and(
          gte(cases.createdAt, start),
          lte(cases.createdAt, end),
        ),
      )
      .groupBy(
        sql`EXTRACT(YEAR FROM ${cases.createdAt})`,
        sql`EXTRACT(MONTH FROM ${cases.createdAt})`,
      )
      .orderBy(
        sql`EXTRACT(YEAR FROM ${cases.createdAt})`,
        sql`EXTRACT(MONTH FROM ${cases.createdAt})`,
      );

    return rows.map((r) => ({
      label: `${r.year}-${String(r.month).padStart(2, '0')}`,
      count: Number(r.count),
    }));
  }

  async getAdminLawyerActivity() {
    const rows = await db
      .select({
        lawyerId: cases.lawyerId,
        caseCount: count().as('caseCount'),
      })
      .from(cases)
      .where(sql`${cases.lawyerId} IS NOT NULL`)
      .groupBy(cases.lawyerId)
      .orderBy(desc(count()))
      .limit(10);

    const lawyerIds = rows
      .map((r) => r.lawyerId)
      .filter((id): id is string => !!id);

    const lawyerUsers =
      lawyerIds.length === 0
        ? []
        : await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
            })
            .from(users)
            .where(inArray(users.id, lawyerIds));

    const nameById = new Map(lawyerUsers.map((u) => [u.id, u.name || u.email]));

    return rows.map((r) => ({
      lawyerId: r.lawyerId,
      lawyerName: r.lawyerId ? nameById.get(r.lawyerId) || 'Unknown' : 'Unknown',
      caseCount: Number(r.caseCount),
    }));
  }

  // -------- Lawyer analytics --------

  async getLawyerDashboard(userId: string) {
    const [{ activeCases }] = await db
      .select({ activeCases: count().as('count') })
      .from(cases)
      .where(
        and(
          eq(cases.lawyerId, userId),
          sql`${cases.status} IN ('pending_lawyer_acceptance','in_progress')`,
        ),
      );

    const [{ totalCases }] = await db
      .select({ totalCases: count().as('count') })
      .from(cases)
      .where(eq(cases.lawyerId, userId));

    const [{ completedCases }] = await db
      .select({ completedCases: count().as('count') })
      .from(cases)
      .where(
        and(
          eq(cases.lawyerId, userId),
          sql`${cases.status} IN ('resolved','closed')`,
        ),
      );

    const [{ avgRating }] = await db
      .select({
        avgRating: sql<number | null>`AVG(${reviews.rating})`,
      })
      .from(reviews)
      .where(eq(reviews.lawyerId, userId));

    return {
      activeCases: Number(activeCases),
      totalCases: Number(totalCases),
      completedCases: Number(completedCases),
      averageRating: avgRating ? Number(avgRating) : null,
    };
  }

  async getLawyerCaseStats(userId: string) {
    const rows = await db
      .select({
        status: cases.status,
        count: count().as('count'),
      })
      .from(cases)
      .where(eq(cases.lawyerId, userId))
      .groupBy(cases.status);

    return rows.map((r) => ({
      status: r.status,
      count: Number(r.count),
    }));
  }

  async getLawyerProposalSuccess(userId: string) {
    const rows = await db
      .select({
        status: caseProposals.status,
        count: count().as('count'),
      })
      .from(caseProposals)
      .where(eq(caseProposals.lawyerId, userId))
      .groupBy(caseProposals.status);

    return rows.map((r) => ({
      status: r.status,
      count: Number(r.count),
    }));
  }

  async getLawyerReviews(userId: string) {
    const rows = await db
      .select({
        rating: reviews.rating,
        createdAt: reviews.createdAt,
      })
      .from(reviews)
      .where(eq(reviews.lawyerId, userId))
      .orderBy(reviews.createdAt);

    return rows.map((r) => ({
      rating: r.rating,
      createdAt: r.createdAt,
    }));
  }

  // -------- Citizen analytics --------

  async getCitizenDashboard(userId: string) {
    const [{ totalCases }] = await db
      .select({ totalCases: count().as('count') })
      .from(cases)
      .where(eq(cases.citizenId, userId));

    const [{ activeCases }] = await db
      .select({ activeCases: count().as('count') })
      .from(cases)
      .where(
        and(
          eq(cases.citizenId, userId),
          sql`${cases.status} IN ('pending','in_progress','pending_lawyer_acceptance')`,
        ),
      );

    const [{ resolvedCases }] = await db
      .select({ resolvedCases: count().as('count') })
      .from(cases)
      .where(
        and(
          eq(cases.citizenId, userId),
          sql`${cases.status} IN ('resolved','closed','rejected')`,
        ),
      );

    const [{ predictionCount }] = await db
      .select({ predictionCount: count().as('count') })
      .from(casePredictions)
      .where(eq(casePredictions.userId, userId));

    return {
      totalCases: Number(totalCases),
      activeCases: Number(activeCases),
      resolvedCases: Number(resolvedCases),
      predictionCount: Number(predictionCount),
    };
  }

  async getCitizenCaseHistory(userId: string) {
    const rows = await db
      .select({
        id: cases.id,
        status: cases.status,
        createdAt: cases.createdAt,
      })
      .from(cases)
      .where(eq(cases.citizenId, userId))
      .orderBy(cases.createdAt);

    return rows;
  }

  async getCitizenPredictionUsage(userId: string) {
    const rows = await db
      .select({
        date: sql<string>`DATE(${casePredictions.createdAt})::text`,
        count: count().as('count'),
      })
      .from(casePredictions)
      .where(eq(casePredictions.userId, userId))
      .groupBy(sql`DATE(${casePredictions.createdAt})`)
      .orderBy(sql`DATE(${casePredictions.createdAt})`);

    return rows.map((r) => ({
      date: r.date,
      count: Number(r.count),
    }));
  }

  // -------- AI analytics --------

  async getAIModelPerformance() {
    const [{ totalPredictions }] = await db
      .select({ totalPredictions: count().as('count') })
      .from(casePredictions);

    const rows = await db
      .select({
        prediction: casePredictions.prediction,
        count: count().as('count'),
      })
      .from(casePredictions)
      .groupBy(casePredictions.prediction);

    const confidenceRows = await db
      .select({
        bucket: sql<string>`CASE 
          WHEN ${casePredictions.confidence} < 0.5 THEN '<0.5'
          WHEN ${casePredictions.confidence} < 0.7 THEN '0.5-0.7'
          WHEN ${casePredictions.confidence} < 0.9 THEN '0.7-0.9'
          ELSE '>=0.9' END`,
        count: count().as('count'),
      })
      .from(casePredictions)
      .groupBy(sql`1`);

    return {
      totalPredictions: Number(totalPredictions),
      outcomeDistribution: rows.map((r) => ({
        prediction: r.prediction,
        count: Number(r.count),
      })),
      confidenceBuckets: confidenceRows.map((r) => ({
        bucket: r.bucket,
        count: Number(r.count),
      })),
    };
  }

  async getAISummarizationStats() {
    const rows = await db
      .select({
        endpoint: aiUsage.endpoint,
        totalUsage: sql<number>`SUM(${aiUsage.usageCount})::int`,
      })
      .from(aiUsage)
      .groupBy(aiUsage.endpoint);

    return rows.map((r) => ({
      endpoint: r.endpoint,
      totalUsage: Number(r.totalUsage),
    }));
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;

