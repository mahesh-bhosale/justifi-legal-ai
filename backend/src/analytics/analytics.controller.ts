import { Request, Response } from 'express';
import analyticsService from './analytics.service';

export class AnalyticsController {
  async adminOverview(_req: Request, res: Response): Promise<void> {
    const data = await analyticsService.getAdminOverview();
    res.json({ success: true, data });
  }

  async adminUsersGrowth(_req: Request, res: Response): Promise<void> {
    const data = await analyticsService.getAdminUsersGrowth();
    res.json({ success: true, data });
  }

  async adminCasesTrend(_req: Request, res: Response): Promise<void> {
    const data = await analyticsService.getAdminCasesTrend();
    res.json({ success: true, data });
  }

  async adminLawyerActivity(_req: Request, res: Response): Promise<void> {
    const data = await analyticsService.getAdminLawyerActivity();
    res.json({ success: true, data });
  }

  async lawyerDashboard(req: Request, res: Response): Promise<void> {
    const userId = (req.user as any)?.userId as string;
    const data = await analyticsService.getLawyerDashboard(userId);
    res.json({ success: true, data });
  }

  async lawyerCaseStats(req: Request, res: Response): Promise<void> {
    const userId = (req.user as any)?.userId as string;
    const data = await analyticsService.getLawyerCaseStats(userId);
    res.json({ success: true, data });
  }

  async lawyerProposalSuccess(req: Request, res: Response): Promise<void> {
    const userId = (req.user as any)?.userId as string;
    const data = await analyticsService.getLawyerProposalSuccess(userId);
    res.json({ success: true, data });
  }

  async lawyerReviews(req: Request, res: Response): Promise<void> {
    const userId = (req.user as any)?.userId as string;
    const data = await analyticsService.getLawyerReviews(userId);
    res.json({ success: true, data });
  }

  async citizenDashboard(req: Request, res: Response): Promise<void> {
    const userId = (req.user as any)?.userId as string;
    const data = await analyticsService.getCitizenDashboard(userId);
    res.json({ success: true, data });
  }

  async citizenCaseHistory(req: Request, res: Response): Promise<void> {
    const userId = (req.user as any)?.userId as string;
    const data = await analyticsService.getCitizenCaseHistory(userId);
    res.json({ success: true, data });
  }

  async citizenPredictionUsage(req: Request, res: Response): Promise<void> {
    const userId = (req.user as any)?.userId as string;
    const data = await analyticsService.getCitizenPredictionUsage(userId);
    res.json({ success: true, data });
  }

  async aiModelPerformance(_req: Request, res: Response): Promise<void> {
    const data = await analyticsService.getAIModelPerformance();
    res.json({ success: true, data });
  }

  async aiSummarizationStats(_req: Request, res: Response): Promise<void> {
    const data = await analyticsService.getAISummarizationStats();
    res.json({ success: true, data });
  }
}

export default new AnalyticsController();

