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
  console.log("🚀 デモ用Seedデータの投入を開始します...");

  const hashedPassword = await bcrypt.hash("pass@000", 10);

  // ==========================================
  // 1. 既存レコードの取得 (Admin: 11, Taro: 23)
  // ==========================================
  console.log("Fetching existing Admin and Main User...");
  const admin = await prisma.admin.findUnique({ where: { email: "admin@example.com" } });
  const userTaro = await prisma.user.findUnique({ where: { account_id: "0000000000" } });

  if (!admin || !userTaro) {
    throw new Error("管理者(ID:11)または卒展タロウ(ID:23)が見つかりません。先に初期登録を済ませてください。");
  }

  // ==========================================
  // 2. 賑やかし用ユーザーの作成
  // ==========================================
  console.log("Creating/Updating sub-users...");
  const userHanako = await prisma.user.upsert({
    where: { account_id: "demo_user_02" },
    update: {},
    create: {
      account_id: "demo_user_02",
      password: hashedPassword,
      nickname: "読書大好きハナコ",
      address: "東京都",
      sub_address: "渋谷区",
      age: 25,
      gender: 2,
      self_introduction: "ミステリー小説をよく読みます。休日はカフェで読書するのが日課です。",
      color: "#F87171",
      pattern: "dots",
      pattern_color: "#FFE4E6",
      user_status: 1,
    },
  });

  const userEngineer = await prisma.user.upsert({
    where: { account_id: "demo_user_03" },
    update: {},
    create: {
      account_id: "demo_user_03",
      password: hashedPassword,
      nickname: "エンジニア見習い",
      address: "岩手県",
      sub_address: "滝沢市",
      age: 22,
      gender: 1,
      self_introduction: "バックエンドエンジニアを目指して勉強中です！最近はRustに興味があります。",
      color: "#10B981",
      pattern: "lines",
      pattern_color: "#D1FAE5",
      user_status: 1,
    },
  });

  // ==========================================
  // 3. リアクションマスタ (1:いいね, 2:幸せ, 3:悲しみ, 4:怒り)
  // ==========================================
  console.log("Setting up Reaction Masters...");
  const reactions = [
    { id: 1, label: "いいね", icon: "loveReaction.png" },
    { id: 2, label: "幸せ", icon: "happyReaction.png" },
    { id: 3, label: "悲しみ", icon: "sadReaction.png" },
    { id: 4, label: "怒り", icon: "angryReaction.png" },
  ];

  for (const r of reactions) {
    await prisma.reaction.upsert({
      where: { id: r.id },
      update: {},
      create: { id: r.id, reaction: r.label, icon_path: `/icons/${r.icon}` },
    });
  }

  // ==========================================
  // 4. イベントの作成 (2件)
  // ==========================================
  console.log("Creating Events...");
  const eventWinter = await prisma.event.create({
    data: {
      title: "2026年 冬の読書感想文コンテスト",
      detail: "心に響いた一冊を紹介しよう。優秀作品には図書カードを贈呈します！",
      status: 1,
      start_period: new Date("2026-02-01T00:00:00Z"),
      end_period: new Date("2026-03-31T23:59:59Z"),
      first_voting_start_period: new Date("2026-03-01T00:00:00Z"),
      first_voting_end_period: new Date("2026-03-15T23:59:59Z"),
      second_voting_start_period: new Date("2026-03-16T00:00:00Z"),
      second_voting_end_period: new Date("2026-03-31T23:59:59Z"),
      public_flag: true,
    },
  });

  const eventSpring = await prisma.event.create({
    data: {
      title: "2026年 春のスキルアップ読書フェア",
      detail: "新しい年度に向けて、あなたの人生を変えた技術書や名作を紹介してください。",
      status: 1,
      start_period: new Date("2026-02-10T00:00:00Z"),
      end_period: new Date("2026-04-30T23:59:59Z"),
      first_voting_start_period: new Date("2026-04-01T00:00:00Z"),
      first_voting_end_period: new Date("2026-04-15T23:59:59Z"),
      second_voting_start_period: new Date("2026-04-16T00:00:00Z"),
      second_voting_end_period: new Date("2026-04-30T23:59:59Z"),
      public_flag: true,
    },
  });

  // ==========================================
  // 5. 書籍データの作成 (文庫・技術書)
  // ==========================================
  console.log("Creating Books...");
  const bookList = [
    { isbn: "9784798157573", title: "達人プログラマー", author: "Andrew Hunt", publisher: "翔泳社" },
    { isbn: "9784101010014", title: "こころ", author: "夏目漱石", publisher: "新潮文庫" },
    { isbn: "9784061814646", title: "十角館の殺人", author: "綾辻行人", publisher: "講談社文庫" },
    { isbn: "9784101001050", title: "人間失格", author: "太宰治", publisher: "新潮文庫" },
    { isbn: "9784150300012", title: "火星年代記", author: "レイ・ブラッドベリ", publisher: "ハヤカワ文庫" },
  ];

  for (const b of bookList) {
    await prisma.book.upsert({
      where: { isbn: b.isbn },
      update: {},
      create: { ...b, status: 1 },
    });
  }

  // ==========================================
  // 6. 長文レビューの作成 (各ユーザーから)
  // ==========================================
  console.log("Creating Reviews...");

  const r1 = await prisma.bookReview.create({
    data: {
      user_id: userTaro.id,
      event_id: eventSpring.id,
      isbn: "9784798157573",
      book_title: "達人プログラマー",
      evaluations_status: 1,
      public_flag: true,
      nickname: userTaro.nickname,
      address: userTaro.address,
      age: userTaro.age,
      gender: userTaro.gender,
      self_introduction: userTaro.self_introduction,
      color: userTaro.color,
      pattern: userTaro.pattern,
      pattern_color: userTaro.pattern_color,
      review: "この本は、単なる技術書を超えた、開発者としての『矜持』を教えてくれるガイドブックです。特に『割れた窓を放置しない』という言葉は、私の制作活動における座右の銘になりました。小さなバグや整理されていないコードをそのままにすることが、いかにプロジェクト全体の士気を下げ、品質を蝕んでいくか。卒展のシステムを構築する中で、納期が迫り妥協しそうになった時、この本の言葉が何度も私を引き止めてくれました。実務に出る前にこの本に出会えたことは大きな財産です。"
    }
  });

  const r2 = await prisma.bookReview.create({
    data: {
      user_id: userHanako.id,
      event_id: eventWinter.id,
      isbn: "9784061814646",
      book_title: "十角館の殺人",
      evaluations_status: 1,
      public_flag: true,
      nickname: userHanako.nickname,
      address: userHanako.address,
      age: userHanako.age,
      gender: userHanako.gender,
      self_introduction: userHanako.self_introduction,
      color: userHanako.color,
      pattern: userHanako.pattern,
      pattern_color: userHanako.pattern_color,
      review: "ミステリー界の伝説的な一冊ですが、今読んでもその衝撃は全く色褪せません。孤島、奇妙な館、そして大学生たち。古典的なクローズドサークルの設定だと思って読み進めていくと、あの一行で世界が完全にひっくり返ります。あまりの衝撃に、読んだ瞬間に数ページ読み返してしまいました。作者の巧妙なミスディレクションと、計算され尽くした構成には感服するばかりです。未読の方がいたら、何の情報も入れずに今すぐ手に取ってほしい名作です。"
    }
  });

  const r3 = await prisma.bookReview.create({
    data: {
      user_id: userEngineer.id,
      event_id: eventWinter.id,
      isbn: "9784101001050",
      book_title: "人間失格",
      evaluations_status: 1,
      public_flag: true,
      nickname: userEngineer.nickname,
      address: userEngineer.address,
      age: userEngineer.age,
      gender: userEngineer.gender,
      self_introduction: userEngineer.self_introduction,
      color: userEngineer.color,
      pattern: userEngineer.pattern,
      pattern_color: userEngineer.pattern_color,
      review: "『恥の多い生涯を送って来ました』。大人になってから読み返すと、この一文は学生時代とは異なる痛みを持って迫ってきます。主人公・葉蔵が抱く人間への恐怖や、道化を演じることでしか他者と繋がれない不器用さは、現代のSNS社会に生きる私たちの姿にも通じるものがあります。自分を曝け出すことの恐怖と、それでも誰かに認められたいという矛盾。幸福とは何か、人間であるとはどういうことか。便利すぎる世の中で見失いがちな弱さを問いかけてくれます。"
    }
  });

  // ==========================================
  // 7. 大量のリアクション紐付け
  // ==========================================
  console.log("Creating Reactions...");
  await prisma.bookReviewReaction.createMany({
    data: [
      { user_id: userHanako.id, book_review_id: r1.id, reaction_id: 1 },
      { user_id: userHanako.id, book_review_id: r1.id, reaction_id: 2 },
      { user_id: userEngineer.id, book_review_id: r1.id, reaction_id: 1 },
      { user_id: userTaro.id, book_review_id: r2.id, reaction_id: 1 },
      { user_id: userTaro.id, book_review_id: r2.id, reaction_id: 2 },
      { user_id: userHanako.id, book_review_id: r3.id, reaction_id: 3 },
      { user_id: userTaro.id, book_review_id: r3.id, reaction_id: 3 },
    ],
    skipDuplicates: true,
  });

  // ==========================================
  // 8. お知らせ
  // ==========================================
  console.log("Creating Notifications...");
  await prisma.notification.createMany({
    data: [
      {
        admin_id: admin.id,
        title: "2026年度 卒展書評コンテスト開催決定！",
        detail: "今年もやってきました。あなたの心の一冊を投稿してください。",
        public_flag: true,
        notification_type: 1,
        public_date: new Date(),
      },
      {
        admin_id: admin.id,
        title: "【重要】春のスキルアップ読書フェアを開始しました",
        detail: "技術書・ビジネス書を投稿して、Amazonギフト券をゲットしよう。",
        public_flag: true,
        notification_type: 1,
        public_date: new Date(),
      }
    ]
  });

  console.log("✅ 全てのデモデータの投入が完了しました！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
