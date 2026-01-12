-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "account_id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "address" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "self_introduction" TEXT,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "pattern" TEXT NOT NULL DEFAULT 'white',
    "pattern_color" TEXT NOT NULL DEFAULT 'white',
    "user_status" TEXT NOT NULL DEFAULT 'normal',
    "user_stop_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "isbn" TEXT NOT NULL,
    "isbn_ruby" TEXT,
    "title" TEXT NOT NULL,
    "title_ruby" TEXT,
    "author" TEXT NOT NULL,
    "author_ruby" TEXT,
    "all_pages" INTEGER,
    "publisher" TEXT,
    "height_size" TEXT,
    "width_size" TEXT,
    "caption" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookReview" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "isbn" TEXT NOT NULL,
    "event_id" INTEGER,
    "review" TEXT NOT NULL,
    "book_title" TEXT NOT NULL,
    "book_title_ruby" TEXT,
    "author" TEXT NOT NULL,
    "author_ruby" TEXT,
    "all_pages" INTEGER,
    "publishers" TEXT,
    "book_height_size" TEXT,
    "book_width_size" TEXT,
    "caption" TEXT,
    "evaluations_status" TEXT NOT NULL DEFAULT 'pending',
    "evaluations_count" INTEGER NOT NULL DEFAULT 0,
    "nickname" TEXT NOT NULL,
    "address" TEXT,
    "age" TEXT,
    "gender" TEXT,
    "self_introduction" TEXT,
    "color" TEXT,
    "pattern" TEXT,
    "pattern_color" TEXT,
    "public_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "BookReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookReviewReaction" (
    "id" SERIAL NOT NULL,
    "reaction_id" INTEGER NOT NULL,
    "book_review_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookReviewReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "start_period" TIMESTAMP(3) NOT NULL,
    "end_period" TIMESTAMP(3),
    "first_voting_start_period" TIMESTAMP(3),
    "first_voting_end_period" TIMESTAMP(3),
    "second_voting_start_period" TIMESTAMP(3),
    "second_voting_end_period" TIMESTAMP(3),
    "public_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reaction" (
    "id" SERIAL NOT NULL,
    "reaction" TEXT NOT NULL,
    "icon_path" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Reaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "public_flag" BOOLEAN NOT NULL DEFAULT false,
    "public_date" TIMESTAMP(3),
    "notification_type" TEXT NOT NULL,
    "draft_flag" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationFile" (
    "id" SERIAL NOT NULL,
    "file_id" INTEGER NOT NULL,
    "notification_id" INTEGER NOT NULL,
    "sort_order" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NotificationFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "draft_flag" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserMessage" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "message_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "UserMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" SERIAL NOT NULL,
    "admin_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "data_path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_flag" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ReactionToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ReactionToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_account_id_key" ON "User"("account_id");

-- CreateIndex
CREATE INDEX "User_deleted_flag_idx" ON "User"("deleted_flag");

-- CreateIndex
CREATE INDEX "User_user_status_idx" ON "User"("user_status");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_deleted_flag_idx" ON "Admin"("deleted_flag");

-- CreateIndex
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");

-- CreateIndex
CREATE INDEX "Book_isbn_idx" ON "Book"("isbn");

-- CreateIndex
CREATE INDEX "BookReview_user_id_idx" ON "BookReview"("user_id");

-- CreateIndex
CREATE INDEX "BookReview_isbn_idx" ON "BookReview"("isbn");

-- CreateIndex
CREATE INDEX "BookReview_event_id_idx" ON "BookReview"("event_id");

-- CreateIndex
CREATE INDEX "BookReview_deleted_flag_idx" ON "BookReview"("deleted_flag");

-- CreateIndex
CREATE INDEX "BookReview_public_flag_idx" ON "BookReview"("public_flag");

-- CreateIndex
CREATE INDEX "BookReviewReaction_book_review_id_idx" ON "BookReviewReaction"("book_review_id");

-- CreateIndex
CREATE INDEX "BookReviewReaction_user_id_idx" ON "BookReviewReaction"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "BookReviewReaction_reaction_id_book_review_id_user_id_key" ON "BookReviewReaction"("reaction_id", "book_review_id", "user_id");

-- CreateIndex
CREATE INDEX "Event_deleted_flag_idx" ON "Event"("deleted_flag");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_public_flag_idx" ON "Event"("public_flag");

-- CreateIndex
CREATE INDEX "Reaction_deleted_flag_idx" ON "Reaction"("deleted_flag");

-- CreateIndex
CREATE INDEX "Notification_admin_id_idx" ON "Notification"("admin_id");

-- CreateIndex
CREATE INDEX "Notification_deleted_flag_idx" ON "Notification"("deleted_flag");

-- CreateIndex
CREATE INDEX "Notification_public_flag_idx" ON "Notification"("public_flag");

-- CreateIndex
CREATE INDEX "Notification_draft_flag_idx" ON "Notification"("draft_flag");

-- CreateIndex
CREATE INDEX "NotificationFile_file_id_idx" ON "NotificationFile"("file_id");

-- CreateIndex
CREATE INDEX "NotificationFile_notification_id_idx" ON "NotificationFile"("notification_id");

-- CreateIndex
CREATE INDEX "NotificationFile_deleted_flag_idx" ON "NotificationFile"("deleted_flag");

-- CreateIndex
CREATE INDEX "Message_admin_id_idx" ON "Message"("admin_id");

-- CreateIndex
CREATE INDEX "Message_deleted_flag_idx" ON "Message"("deleted_flag");

-- CreateIndex
CREATE INDEX "Message_draft_flag_idx" ON "Message"("draft_flag");

-- CreateIndex
CREATE INDEX "UserMessage_user_id_idx" ON "UserMessage"("user_id");

-- CreateIndex
CREATE INDEX "UserMessage_message_id_idx" ON "UserMessage"("message_id");

-- CreateIndex
CREATE INDEX "UserMessage_deleted_flag_idx" ON "UserMessage"("deleted_flag");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_admin_id_idx" ON "PasswordReset"("admin_id");

-- CreateIndex
CREATE INDEX "PasswordReset_token_idx" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "File_deleted_flag_idx" ON "File"("deleted_flag");

-- CreateIndex
CREATE INDEX "_ReactionToUser_B_index" ON "_ReactionToUser"("B");

-- AddForeignKey
ALTER TABLE "BookReview" ADD CONSTRAINT "BookReview_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookReview" ADD CONSTRAINT "BookReview_isbn_fkey" FOREIGN KEY ("isbn") REFERENCES "Book"("isbn") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookReview" ADD CONSTRAINT "BookReview_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookReviewReaction" ADD CONSTRAINT "BookReviewReaction_reaction_id_fkey" FOREIGN KEY ("reaction_id") REFERENCES "Reaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookReviewReaction" ADD CONSTRAINT "BookReviewReaction_book_review_id_fkey" FOREIGN KEY ("book_review_id") REFERENCES "BookReview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookReviewReaction" ADD CONSTRAINT "BookReviewReaction_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationFile" ADD CONSTRAINT "NotificationFile_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationFile" ADD CONSTRAINT "NotificationFile_notification_id_fkey" FOREIGN KEY ("notification_id") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMessage" ADD CONSTRAINT "UserMessage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMessage" ADD CONSTRAINT "UserMessage_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordReset" ADD CONSTRAINT "PasswordReset_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReactionToUser" ADD CONSTRAINT "_ReactionToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Reaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReactionToUser" ADD CONSTRAINT "_ReactionToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
