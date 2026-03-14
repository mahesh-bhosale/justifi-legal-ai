import { eq, desc } from 'drizzle-orm';
import { db } from '../db';
import { caseDocuments, cases, users, type CaseDocument } from '../models/schema';

async function ensureParticipant(caseId: number, userId: string): Promise<boolean> {
  const [c] = await db.select().from(cases).where(eq(cases.id, caseId)).limit(1);
  if (!c) return false;
  if (c.citizenId === userId) return true;
  if (c.lawyerId === userId) return true;
  return false;
}

export interface CaseDocumentWithUploader extends CaseDocument {
  uploadedByName: string | null;
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

  async listDocuments(caseId: number, requesterId: string): Promise<CaseDocumentWithUploader[] | null> {
    const can = await ensureParticipant(caseId, requesterId);
    if (!can) return null;
    const rows = await db
      .select({
        id: caseDocuments.id,
        caseId: caseDocuments.caseId,
        uploadedBy: caseDocuments.uploadedBy,
        uploadedByName: users.name,
        fileUrl: caseDocuments.fileUrl,
        fileName: caseDocuments.fileName,
        mimeType: caseDocuments.mimeType,
        fileSize: caseDocuments.fileSize,
        description: caseDocuments.description,
        createdAt: caseDocuments.createdAt,
      })
      .from(caseDocuments)
      .leftJoin(users, eq(caseDocuments.uploadedBy, users.id))
      .where(eq(caseDocuments.caseId, caseId))
      .orderBy(desc(caseDocuments.createdAt));
    return rows;
  }

  async getDocumentById(
    caseId: number,
    documentId: number,
    requesterId: string
  ): Promise<CaseDocument | null> {
    const can = await ensureParticipant(caseId, requesterId);
    if (!can) return null;

    const [doc] = await db
      .select()
      .from(caseDocuments)
      .where(eq(caseDocuments.id, documentId))
      .limit(1);

    if (!doc || doc.caseId !== caseId) {
      return null;
    }

    return doc;
  }
}

export default new DocumentsService();

// Named helpers for clarity in module organization
export const insertDocumentRecord = (
  params: Parameters<DocumentsService['uploadDocument']>[0]
) => documentsService.uploadDocument(params);

export const fetchCaseDocuments = (
  caseId: number,
  requesterId: string
) => documentsService.listDocuments(caseId, requesterId);

const documentsService = new DocumentsService();


