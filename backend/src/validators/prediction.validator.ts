import { z } from 'zod';

// Maximum allowed PDF file size (10MB)
export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

export const predictionUploadSchema = z.object({
  // In the future we can add metadata fields (e.g., caseId, description)
});

export const validatePdfFile = (file: Express.Multer.File | undefined) => {
  if (!file) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        message: 'PDF file is required',
        path: ['file'],
      },
    ]);
  }

  if (file.mimetype !== 'application/pdf') {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        message: 'Only PDF files are allowed',
        path: ['file'],
      },
    ]);
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        message: 'PDF file size exceeds 10MB limit',
        path: ['file'],
      },
    ]);
  }
};

export type PredictionUploadInput = z.infer<typeof predictionUploadSchema>;

