import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 シードデータの投入を開始します...");


  console.log("Cleaning up existing data...");
  // 外部キー制約を考慮して、子テーブルから順番に削除します
  await prisma.userMessage.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notificationFile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.bookReviewReaction.deleteMany();
  await prisma.bookReview.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.user.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.book.deleteMany();
  await prisma.event.deleteMany();
  await prisma.file.deleteMany();
  console.log("✅ Cleanup finished.");

  // 1. 管理者作成 (Admin)
  // メール: admin@example.com, パスワード: password
  const adminPassword = await bcrypt.hash("password", 10);
  console.log("Creating Admins...");
  for (let i = 1; i <= 10; i++) {
    await prisma.admin.upsert({
      where: { email: `admin${i}@example.com` },
      update: {},
      create: {
        email: `admin${i}@example.com`,
        password: adminPassword,
      },
    });
  }

  // 2. ユーザー作成 (User)
  console.log("Creating Users...");
  const userPassword = await bcrypt.hash("password", 10);
  const users = [];
  for (let i = 1; i <= 15; i++) {
    const user = await prisma.user.upsert({
      where: { account_id: `user${i}` },
      update: {},
      create: {
        account_id: `user${i}`,
        password: userPassword,
        nickname: `ユーザー${i}`,
        address: i % 2 === 0 ? "東京都" : "大阪府",
        sub_address: i % 2 === 0 ? "渋谷区" : "北区",
        age: 20 + (i % 30),
        gender: (i % 2) + 1, // 1 or 2
        self_introduction: `こんにちは、ユーザー${i}です。読書が好きです。`,
        color: i % 2 === 0 ? "red" : "blue",
        pattern: i % 2 === 0 ? "A" : "B",
        pattern_color: i % 2 === 0 ? "blue" : "green",
        user_status: 1,
      },
    });
    users.push(user);
  }

  // 3. イベント作成 (Event)
  console.log("Creating Events...");
  const events = [];
  for (let i = 1; i <= 10; i++) {
    const event = await prisma.event.create({
      data: {
        title: `読書イベント Vol.${i}`,
        detail: `第${i}回 読書感想文コンテストです。`,
        status: i % 3, // 0, 1, 2
        start_period: new Date(),
        end_period: new Date(new Date().setDate(new Date().getDate() + 30)),
        first_voting_start_period: new Date(),
        first_voting_end_period: new Date(
          new Date().setDate(new Date().getDate() + 10),
        ),
        second_voting_start_period: new Date(
          new Date().setDate(new Date().getDate() + 11),
        ),
        second_voting_end_period: new Date(
          new Date().setDate(new Date().getDate() + 20),
        ),
        public_flag: true,
      },
    });
    events.push(event);
  }

  // 4. 書籍作成 (Book)
  console.log("Creating Books...");
  const books = [];
  for (let i = 1; i <= 15; i++) {
    const book = await prisma.book.upsert({
      where: { isbn: `978-4-00-00000${i}-0` },
      update: {},
      create: {
        isbn: `978-4-00-00000${i}-0`,
        title: `書籍タイトル ${i}`,
        title_ruby: `ショセキタイトル ${i}`,
        author: `著者 ${i}`,
        author_ruby: `チョシャ ${i}`,
        publisher: `出版社 ${i}`,
        published_date: "2023-01-01",
        all_pages: 200 + i * 10,
        image_url: "https://placehold.jp/150x200.png",
      },
    });
    books.push(book);
  }

  // 5. Reaction (10 records)
  console.log("Creating Reactions...");
  const reactionTypes = [
    "いいね",
    "感動",
    "学び",
    "共感",
    "応援",
    "驚き",
    "悲しい",
    "楽しい",
    "怒り",
    "その他",
  ];
  const reactions = [];
  for (let i = 0; i < reactionTypes.length; i++) {
    const reaction = await prisma.reaction.create({
      data: {
        reaction: reactionTypes[i],
        icon_path: `/icons/reaction_${i + 1}.png`,
      },
    });
    reactions.push(reaction);
  }

  // 6. BookReview (30 records)
  console.log("Creating BookReviews...");
  const reviews = [];
  for (let i = 1; i <= 30; i++) {
    const user = users[i % users.length];
    const book = books[i % books.length];
    const event = events[i % events.length];

    const review = await prisma.bookReview.create({
      data: {
        user_id: user.id,
        event_id: event.id,
        review: `これは書籍「${book.title}」の感想文です。とても面白かったです。${i}回目の投稿。`,
        isbn: book.isbn,
        book_title: book.title,
        author: book.author,
        publishers: book.publisher,
        evaluations_status: i % 4, // 0:評価前, 1:一次通過, 2:二次通過, 3:三次通過
        evaluations_count: i * 5,
        nickname: user.nickname,
        address: user.address,
        age: user.age,
        gender: user.gender,
        self_introduction: user.self_introduction,
        color: user.color,
        pattern: user.pattern,
        pattern_color: user.pattern_color,
        public_flag: true,
      },
    });
    reviews.push(review);
  }

  // 7. BookReviewReaction (30 records)
  console.log("Creating BookReviewReactions...");
  for (let i = 0; i < reviews.length; i++) {
    const reaction = reactions[i % reactions.length];
    await prisma.bookReviewReaction.create({
      data: {
        book_review_id: reviews[i].id,
        reaction_id: reaction.id,
        user_id: reviews[i].user_id
      },
    });
  }

  // 8. Message & UserMessage (10 records)
  console.log("Creating Messages...");
  const admin = await prisma.admin.findFirst();
  if (admin) {
    for (let i = 1; i <= 10; i++) {
      const message = await prisma.message.create({
        data: {
          admin_id: admin.id,
          message: `お知らせメッセージ ${i} です。`,
          type: i % 3, // 0:通常, 1:審査通過, 2:落選
          draft_flag: false,
        },
      });

      // Link to random users
      for (let j = 0; j < 3; j++) {
        const user = users[(i + j) % users.length];
        await prisma.userMessage.create({
          data: {
            user_id: user.id,
            message_id: message.id,
            is_read: j % 2 === 0,
          },
        });
      }
    }
  }

  // 9. Notification (10 records)
  console.log("Creating Notifications...");
  if (admin) {
    for (let i = 1; i <= 10; i++) {
      await prisma.notification.create({
        data: {
          admin_id: admin.id,
          title: `お知らせタイトル ${i}`,
          detail: `これはお知らせの詳細内容です。${i}番目の通知です。`,
          public_flag: true,
          notification_type: 1,
          draft_flag: false,
        },
      });
    }
  }

  // 10. File (10 records)
  console.log("Creating Files...");
  const files = [];
  for (let i = 1; i <= 10; i++) {
    const file = await prisma.file.create({
      data: {
        name: `file_${i}.pdf`,
        data_path: `/uploads/file_${i}.pdf`,
        type: "application/pdf",
      },
    });
    files.push(file);
  }

  // 11. NotificationFile (10 records)
  console.log("Creating NotificationFiles...");
  const notifications = await prisma.notification.findMany();
  if (notifications.length > 0 && files.length > 0) {
    for (let i = 0; i < 10; i++) {
      await prisma.notificationFile.create({
        data: {
          notification_id: notifications[i % notifications.length].id,
          file_id: files[i % files.length].id,
          sort_order: i,
        },
      });
    }
  }

  // 12. PasswordReset (10 records)
  console.log("Creating PasswordResets...");
  if (admin) {
    for (let i = 1; i <= 10; i++) {
      await prisma.passwordReset.create({
        data: {
          admin_id: admin.id,
          token: `reset_token_${i}_${Date.now()}`,
          expires_at: new Date(new Date().setDate(new Date().getDate() + 1)),
        },
      });
    }
  }

  console.log("✨ シードデータの投入が完了しました！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
