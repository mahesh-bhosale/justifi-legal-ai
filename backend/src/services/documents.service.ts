import { eq } from 'drizzle-orm';
import { db } from '../db';
import { caseDocuments, cases, type CaseDocument } from '../models/schema';

async function ensureParticipant(caseId: number, userId: string): Promise<boolean> {
  const [c] = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
  if (!c) return false;
  if (c.citizenId === userId) return true;
  if (c.lawyerId === userId) return true;
  return false;
}

class DocumentsService {
  async uploadDocument(params: { caseId: number; uploadedBy: string; fileUrl: string; fileName: string; mimeType?: string; fileSize?: number; description?: string; }): Promise<CaseDocument | null> {
    const can = await ensureParticipant(params.caseId, params.uploadedBy);
    if (!can) return null;
    const [created] = await db.insert(caseDocuments).values({
      caseId: params.caseId,
      uploadedBy: params.uploadedBy,
      fileUrl: params.fileUrl,
      fileName: params.fileName,
      mimeType: params.mimeType,
      fileSize: params.fileSize,
      description: params.description,
    }).returning();
    return created ?? null;
  }

  async listDocuments(caseId: number, requesterId: string): Promise<CaseDocument[] | null> {
    const can = await ensureParticipant(caseId, requesterId);
    if (!can) return null;
    const rows = await db.select().from(caseDocuments).where(eq(caseDocuments.caseId, caseId));
    return rows;
  }
}

export default new DocumentsService();


