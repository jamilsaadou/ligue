-- Historical diagnostics remain unspecified; never infer their sex.
ALTER TABLE "DiagnosticAttempt" ADD COLUMN "sex" TEXT;
ALTER TABLE "DiagnosticSubmission" ADD COLUMN "sex" TEXT;
ALTER TABLE "DiagnosticAttempt" ADD CONSTRAINT "DiagnosticAttempt_sex_check" CHECK ("sex" IN ('female', 'male'));
ALTER TABLE "DiagnosticSubmission" ADD CONSTRAINT "DiagnosticSubmission_sex_check" CHECK ("sex" IN ('female', 'male'));
