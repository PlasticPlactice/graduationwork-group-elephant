"use client";

import "@/styles/public/top.css";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/features/EventCard";
import { ItemModal } from "@/components/features/ItemModal";
import { useState } from "react";

export default function Home() {
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<{
    id: number;
    date: string;
    title: string;
    image: string;
  } | null>(null);

  const handleNewsClick = (
    id: number,
    title: string,
    date: string,
    image: string
  ) => {
    setSelectedNews({ id, date, title, image });
    setShowNewsModal(true);
  };

  return (
    <div>
      <main>
        <div className="hero">
          <div className="heroContent">
            <div className="heroPoster" role="img" aria-label="トップ画像">
              <div className="posterStack">
                <Image
                  src="/top/retop.png"
                  alt=""
                  fill
                  priority
                  sizes="100vw"
                  className="posterLayer posterLayer--1"
                  style={{ objectFit: "contain" }}
                />
              </div>
            </div>
            <div className="heroText">
              <h1 className="heroTitle">象と花<br />プロジェクト</h1>
              <a className="heroBunkoBadge" href="#bunko-x">
                文庫<span>X</span>はこちら
              </a>
            </div>
          </div>
        </div>
        <section id="about" className="about">
          <div className="about__inner">
            <h2 className="about__title">
              <span className="about__title-line"></span>
              象と花プロジェクトとは？
              <span className="about__title-line"></span>
            </h2>
            <div className="about__text">
              <p>
                象と花は古本販売の盛岡書房と、新刊書店のさわや書店が共同で行うプロジェクトです。
              </p>
              <br className="br-sp-only" />
              <p>
                あなたに知識や情報、感動を与えてくれた本を循環させ、病気と戦う子供たちのための本に替えて贈ります。
              </p>
              <br className="br-sp-only" />
              <p>
                身近な人に贈り物を手渡すような気持ちで、子供たちと読書のよろこびを分かち合える取り組みです。
              </p>
            </div>
            <div className="about__button">
              <Button
                href="https://zoutohana.com/about.html"
                style={{ backgroundColor: "#36A8B1", color: "#ffffff" }}
              >
                くわしくはこちら
              </Button>
            </div>
          </div>
        </section>

        <section id="bunko-x" className="bunko-x">
          <div className="bunko-x__inner">
            {/* 投票可能なイベント */}
            <div className="bunko-x__events">
              <h3 className="bunko-x__subtitle">
                <span className="bunko-x__subtitle-line"></span>
                投票可能なイベント
                <span className="bunko-x__subtitle-line"></span>
              </h3>

              <div className="event-cards">
                {/* Card 1 */}
                <EventCard
                  title="第2回 文庫Xイベント"
                  daysLeft={10}
                  description="投票期間中です！投票してみましょう！"
                  buttonBackgroundColor="var(--color-bg)"
                  buttonBorderColor="#36A8B1"
                  buttonTextColor="#36A8B1"
                />

                {/* Card 2 */}
                <EventCard
                  title="第1回 文庫Xイベント"
                  daysLeft={10}
                  description="投票期間中です！投票してみましょう！"
                  buttonBackgroundColor="var(--color-bg)"
                  buttonBorderColor="#36A8B1"
                  buttonTextColor="#36A8B1"
                />
              </div>

              <div className="bunko-x__all-events">
                <Button
                  className="w-full mb-24"
                  href="/event"
                  style={{
                    backgroundColor: "#36A8B1",
                    color: "var(--color-white)",
                    width: "100%",
                    maxWidth: "400px",
                  }}
                >
                  すべてのイベント
                </Button>
              </div>
            </div>

            {/* 文庫Xについて */}
            <div className="bunko-x__intro">
              <h2 className="bunko-x__title">
                文庫<span className="text-red">X</span>について
              </h2>
              <div className="bunko-x__text">
                <p>
                  この取り組みは、岩手県盛岡市の書店「さわや書店フェザン店」の書店員が2016年に始めました。SNSを通して話題が広まり全国の書店でも同様の取り組みが行われるようになりました。
                </p>
                <br></br>
                <p>文庫Xの目的は、</p>
                <ul className="bunko-x__list">
                  <li>
                    既に有名な作品だけでなく、本来埋もれてしまうかもしれない本の魅力を伝えること、
                  </li>
                  <li>
                    読者が固定観念や先入観にとらわれず、純粋に本と出会う楽しさを感じることにあります。
                  </li>
                </ul>
                <p>
                  読者は、メッセージカードに書かれた「おすすめしたい想い」や「読むべき理由」を頼りに本を手に取ります。それにより、通常とは違う、少しミステリアスでワクワクする読書体験が生まれます。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="news" className="news news--about-bg">
          <div className="news__inner">
            <h2 className="news__title">
              <span className="news__title-line"></span>
              おしらせ
              <span className="news__title-line"></span>
            </h2>
            <div className="news__list">
              {/* News Item 1 */}
              <div
                className="news-item cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() =>
                  handleNewsClick(
                    1,
                    "第１回文庫Xが開催されました！",
                    "2025-10-01",
                    "/top/image1.png"
                  )
                }
              >
                <div className="news-item__image">
                  <Image
                    src="/top/image1.png"
                    alt="News Image"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="news-item__meta">
                  <span className="news-item__date">2025-10-01</span>
                  <span className="news-item__badge">NEW</span>
                </div>
                <p className="news-item__text">第１回文庫Xが開催されました！</p>
              </div>

              {/* News Item 2 */}
              <div
                className="news-item cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() =>
                  handleNewsClick(
                    2,
                    "第１回文庫Xが開催されました！",
                    "2025-10-01",
                    "/top/image1.png"
                  )
                }
              >
                <div className="news-item__image">
                  <Image
                    src="/top/image1.png"
                    alt="News Image"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="news-item__meta">
                  <span className="news-item__date">2025-10-01</span>
                  <span className="news-item__badge">NEW</span>
                </div>
                <p className="news-item__text">第１回文庫Xが開催されました！</p>
              </div>
            </div>
            <div className="news__button">
              <Button
                className="w-full"
                href="/news"
                style={{
                  backgroundColor: "#36A8B1",
                  color: "#ffffff",
                  width: "100%",
                  maxWidth: "400px",
                }}
              >
                すべてのおしらせ
              </Button>
            </div>
          </div>
        </section>

        <section className="news news--about-bg">
          <div className="news__inner">
            <h2 className="news__title">
              <span className="news__title-line"></span>
              寄贈情報
              <span className="news__title-line"></span>
            </h2>
            <div className="news__list">
              {/* News Item 1 */}
              <div
                className="news-item cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() =>
                  handleNewsClick(
                    3,
                    "○○様より「ハリーポッター」を寄贈していただきました！",
                    "2025-10-01",
                    "/top/image1.png"
                  )
                }
              >
                <div className="news-item__image">
                  <Image
                    src="/top/image1.png"
                    alt="News Image"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="news-item__meta">
                  <span className="news-item__date">2025-10-01</span>
                  <span className="news-item__badge">NEW</span>
                </div>
                <p className="news-item__text">
                  ○○様より「ハリーポッター」を寄贈していただきました！
                </p>
              </div>

              {/* News Item 2 */}
              <div
                className="news-item cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() =>
                  handleNewsClick(
                    4,
                    "○○様より「ハリーポッター」を寄贈していただきました！",
                    "2025-10-01",
                    "/top/image1.png"
                  )
                }
              >
                <div className="news-item__image">
                  <Image
                    src="/top/image1.png"
                    alt="News Image"
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="news-item__meta">
                  <span className="news-item__date">2025-10-01</span>
                  <span className="news-item__badge">NEW</span>
                </div>
                <p className="news-item__text">
                  ○○様より「ハリーポッター」を寄贈していただきました！
                </p>
              </div>
            </div>
            <div className="donation-button">
              <Button
                className="w-full"
                href="/donation"
                style={{
                  backgroundColor: "#36A8B1",
                  color: "#ffffff",
                  width: "100%",
                  maxWidth: "400px",
                }}
              >
                すべての寄贈情報
              </Button>
            </div>
          </div>
        </section>

        <section id="donation" className="news">
          <div className="news__inner">
            <h2 className="news__title">
              <span className="news__title-line"></span>
              寄贈について
              <span className="news__title-line"></span>
            </h2>
            <div className="donation-text">
              <p>
                岩手医科大学附属病院の小児病棟をはじめ、子供食堂や自動養護施設などへ本の寄贈を行っています。
              </p>
              <p>
                届けられた本は病院や施設の本棚に並び、その一冊が、子供たちの一歩を踏み出す勇気となっています。
              </p>
              <p>
                この活動は、地元企業や地域の皆さまの温かいご協力によって支えられています。
              </p>
              <p>
                本を通して生まれる「つながり」が、子どもたちの未来にそっと寄り添う力になると信じています。
              </p>
            </div>
            <a
              href="https://zoutohana.com/collect.html"
              className="donation-banner"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="donation-banner__image">
                <Image
                  src="/top/image.png"
                  alt="Donation Banner"
                  fill
                  style={{ objectFit: "cover", opacity: 0.4 }}
                />
              </div>
              <div className="donation-banner__content">
                <span className="donation-banner__text">私たちの取り組み</span>
                <span className="donation-banner__arrow">&gt;</span>
              </div>
            </a>
          </div>
        </section>
      </main>

      {/* ニュースモーダル */}
      {selectedNews && showNewsModal && (
        <ItemModal
          item={selectedNews}
          onClose={() => setShowNewsModal(false)}
        />
      )}
    </div>
  );
}

