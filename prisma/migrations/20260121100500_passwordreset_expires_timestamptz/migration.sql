-- Move PasswordReset expires_at timezone change into its own migration for clarity
ALTER TABLE "PasswordReset" ALTER COLUMN "expires_at" SET DATA TYPE TIMESTAMPTZ(3);
