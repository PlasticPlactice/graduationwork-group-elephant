-- CreateIndex
CREATE INDEX "Notification_public_end_date_idx" ON "Notification"("public_end_date");

-- CreateIndex
CREATE INDEX "Notification_notification_type_public_flag_public_date_idx" ON "Notification"("notification_type", "public_flag", "public_date");

-- CreateIndex
CREATE INDEX "Notification_notification_type_public_flag_idx" ON "Notification"("notification_type", "public_flag");
