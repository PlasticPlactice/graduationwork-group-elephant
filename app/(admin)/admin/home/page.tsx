"use client";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import "@/styles/admin/home.css";
import Link from "next/link";

export default function Page() {
  const router = useRouter();

  const handleDetail = () => {
    router.push("/admin/events");
  };

  const eventData = [
    { id: 1, title: "第1回文庫X", date: "2025年10月30日", status: "2" },
    { id: 2, title: "第2回文庫X", date: "2026年10月30日", status: "3" },
  ];

  const getProgressValue = (status: string) => {
    const statusMap: { [key: string]: number } = {
      "0": 11,
      "1": 37,
      "2": 63,
      "3": 89,
    };
    return statusMap[status] || 0;
  };

  const getCircleClassName = (index: number, status: string) => {
    const statusNumber = parseInt(status);
    if (index <= statusNumber) {
      return "event-condition-circle-now";
    }
    return "event-condition-circle-future";
  };

  const getArrowIcon = (index: number, status: string) => {
    const statusNumber = parseInt(status);
    if (statusNumber === index) {
      return (
        <Icon icon="bxs:up-arrow" rotate={2} className="up-arrow m-auto"></Icon>
      );
    }
    return (
      <Icon icon="material-symbols:circle" className="m-auto text-white"></Icon>
    );
  };
  return (
    <main className="home-main">
      <div className="mt-5">
        <h1 className="text-center event-title">開催中のイベント</h1>
        <div className="event-scroll-content m-auto w-3/5 py-2 px-5 shadow">
          {eventData.map((event) => (
            <div
              key={event.id}
              className=" py-4 m-auto text-center event-container mb-4"
            >
              <div className="mx-auto flex items-center justify-between w-4/5">
                <p className="font-bold event-name">{event.title}</p>
                <p className="event-date event-date-now">
                  一次審査の締切：{event.date}
                </p>
              </div>

              <div className="flex justify-between w-2/3 mx-auto mt-4">
                <p className="w-10">{getArrowIcon(0, event.status)}</p>
                <p className="w-10">{getArrowIcon(1, event.status)}</p>
                <p className="w-10">{getArrowIcon(2, event.status)}</p>
                <p className="w-10">{getArrowIcon(3, event.status)}</p>
              </div>
              <div className="flex justify-between w-2/3 m-auto event-condition-status-circle">
                <p className="w-10">
                  <Icon
                    icon="material-symbols:circle"
                    className={getCircleClassName(0, event.status)}
                  ></Icon>
                </p>
                <p className="w-10">
                  <Icon
                    icon="material-symbols:circle"
                    className={getCircleClassName(1, event.status)}
                  ></Icon>
                </p>
                <p className="w-10">
                  <Icon
                    icon="material-symbols:circle"
                    className={getCircleClassName(2, event.status)}
                  ></Icon>
                </p>
                <p className="w-10">
                  <Icon
                    icon="material-symbols:circle"
                    className={getCircleClassName(3, event.status)}
                  ></Icon>
                </p>
              </div>
              <div className="flex justify-center mt-2">
                {/* 11,37,63,89 */}
                <progress
                  max={100}
                  value={getProgressValue(event.status)}
                  className="w-4/5"
                ></progress>
              </div>
              <div className="flex justify-between w-2/3 m-auto">
                <span>開催前</span>
                <span>一次審査</span>
                <span>二次審査</span>
                <span>終了済</span>
              </div>
              <button
                className="event-detail-btn mb-3 mt-7 p-0"
                onClick={handleDetail}
              >
                イベント詳細
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 grid-rows-2 m-auto w-3/5 gap-x-14 gap-y-5 mt-10 mb-3">
        {/* お知らせ・寄贈管理 */}
        <Link href="/admin/notice" className="flex p-2 shadow-md admin-card">
          <div className="flex items-center justify-center w-auto mx-1">
            <Icon
              icon="mdi:megaphone"
              width="50"
              height="50"
              className="rounded-full admin-icon"
            />
          </div>
          <div>
            <h2 className="mb-1 ml-6 text-left card-title">
              お知らせ・寄贈管理
            </h2>
            <p className="mb-1 ml-6 card-description">
              お知らせの一覧・投稿・編集
            </p>
          </div>
        </Link>

        {/* イベント管理 */}
        <Link
          href="/admin/events"
          className="flex py-2 pl-2 shadow-md admin-card"
        >
          <div className="flex items-center justify-center w-auto mx-1">
            <Icon
              icon="mdi:calendar"
              width="50"
              height="50"
              className="p-1 rounded-full admin-icon"
            />
          </div>
          <div>
            <h2 className="mb-1 ml-6 text-left card-title">イベント管理</h2>
            <p className="mb-1 ml-6 card-description">イベントの作成・編集</p>
          </div>
        </Link>

        {/* ユーザー管理 */}
        <Link
          href="/admin/users"
          className="flex py-2 pl-2 pr-5 shadow-md admin-card"
        >
          <div className="flex items-center justify-center w-auto mx-1">
            <Icon
              icon="mdi:people"
              width="50"
              height="50"
              className="p-1 rounded-full admin-icon"
            />
          </div>
          <div>
            <h2 className="mb-1 ml-6 text-left card-title">ユーザー管理</h2>
            <p className="mb-1 ml-6 card-description">
              ユーザー情報閲覧・書評閲覧
            </p>
          </div>
        </Link>

        {/* パスワード変更 */}
        <Link
          href="/admin/password"
          className="flex py-2 pl-2 pr-5 shadow-md admin-card"
        >
          <div className="flex items-center justify-center w-auto mx-1">
            <Icon
              icon="material-symbols:key"
              width="50"
              height="50"
              className="p-1 rounded-full admin-icon"
            />
          </div>
          <div>
            <h2 className="mb-1 ml-6 text-left card-title">パスワード変更</h2>
            <p className="mb-1 ml-6 card-description">パスワードを変更</p>
          </div>
        </Link>

        {/* 利用規約管理 */}
        <Link
          href="/admin/terms"
          className="flex py-2 pl-2 pr-5 shadow-md admin-card"
        >
          <div className="flex items-center justify-center w-auto mx-1">
            <Icon
              icon="mingcute:paper-fill"
              width="50"
              height="50"
              className="p-1 rounded-full admin-icon"
            />
          </div>
          <div>
            <h2 className="mb-1 ml-6 text-left card-title">利用規約管理</h2>
            <p className="mb-1 ml-6 card-description">利用規約を管理</p>
          </div>
        </Link>
      </div>
    </main>
  );
}
