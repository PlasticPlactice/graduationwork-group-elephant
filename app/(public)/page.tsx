"use client";

import "@/styles/public/top.css";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/features/EventCard";
import { ItemModal } from "@/components/features/ItemModal";
import { NotificationItem } from "@/lib/types/notification";

type PublicEvent = {
  id: number;
  title: string;
  detail?: string | null;
  first_voting_end_period: string;
};

export default function Home() {
  const [news, setNews] = useState<NotificationItem[]>([]);
  const [donations, setDonations] = useState<NotificationItem[]>([]);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [showNewsModal, setShowNewsModal] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NotificationItem | null>(
    null,
  );
  const [isAtTop, setIsAtTop] = useState(true);

  const handleNewsClick = (item: NotificationItem) => {
    setSelectedNews(item);
    setShowNewsModal(true);
  };

  useEffect(() => {
    fetch("/api/notifications?type=0&page=1")
      .then((res) => res.json())
      .then((data) => setNews(data.data || []));
    fetch("/api/notifications?type=1&page=1")
      .then((res) => res.json())
      .then((data) => setDonations(data.data || []));
    fetch("/api/events?status=now")
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));

    const updateIsAtTop = () => {
      setIsAtTop(window.scrollY <= 8);
    };
    updateIsAtTop();
    window.addEventListener("scroll", updateIsAtTop, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateIsAtTop);
    };
  }, []);

  return (
    <div className="public-page">
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
              <h1 className="heroTitle">
                象と花
                <br />
                プロジェクト
              </h1>
              <a className="heroBunkoBadge" href="#bunko-x-title">
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
            {/* 文庫Xについて */}
            <div className="bunko-x__intro">
              <h2 id="bunko-x-title" className="bunko-x__title">
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

            {/* 投票可能なイベント */}
            <div className="bunko-x__events">
              <h3 className="bunko-x__subtitle">
                <span className="bunko-x__subtitle-line"></span>
                投票可能なイベント
                <span className="bunko-x__subtitle-line"></span>
              </h3>

              <div className="event-cards">
                {events.length > 0 ? (
                  events.slice(0, 2).map((event) => {
                    const now = new Date();
                    const votingEnd = new Date(event.second_voting_end_period);
                    const daysLeft = Math.max(
                      0,
                      Math.ceil(
                        (votingEnd.getTime() - now.getTime()) /
                          (1000 * 60 * 60 * 24),
                      ),
                    );
                    return (
                      <EventCard
                        key={event.id}
                        eventId={String(event.id)}
                        href="/posts/bookshelf"
                        title={event.title}
                        daysLeft={daysLeft}
                        detail={
                          event.detail || "投票期間中です！投票してみましょう！"
                        }
                        buttonBackgroundColor="var(--color-bg)"
                        buttonBorderColor="#36A8B1"
                        buttonTextColor="#36A8B1"
                      />
                    );
                  })
                ) : (
                  <p>イベントが開催していないようです</p>
                )}
              </div>

              <div className="bunko-x__all-events">
                <Button
                  className="w-full mb-16"
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
              {news.length === 0 ? (
                <p className="text-center text-sm text-slate-600">
                  現在お知らせはありません。
                </p>
              ) : (
                news.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="news-item cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleNewsClick(item)}
                  >
                    <div className="news-item__image">
                      <Image
                        src={item.image || "/top/image1.png"}
                        alt={item.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="news-item__meta">
                      <span className="news-item__date">{item.date}</span>
                      <span className="news-item__badge">NEW</span>
                    </div>
                    <p className="news-item__text">{item.title}</p>
                  </div>
                ))
              )}
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
              {donations.length === 0 ? (
                <p className="text-center text-sm text-slate-600">
                  現在寄贈情報はありません。
                </p>
              ) : (
                donations.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="news-item cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handleNewsClick(item)}
                  >
                    <div className="news-item__image">
                      <Image
                        src={item.image || "/top/image1.png"}
                        alt={item.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className="news-item__meta">
                      <span className="news-item__date">{item.date}</span>
                      <span className="news-item__badge">NEW</span>
                    </div>
                    <p className="news-item__text">{item.title}</p>
                  </div>
                ))
              )}
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

        <button
          type="button"
          className={`back-to-top${isAtTop ? " back-to-top--hidden" : ""}`}
          aria-label="ページ上部へ戻る"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          ▲
        </button>
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
