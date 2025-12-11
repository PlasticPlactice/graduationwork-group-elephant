"use client"
import Textbox from '@/components/ui/admin-textbox';
import AdminButton from '@/components/ui/admin-button';
import "@/styles/admin/events-details.css"
import { Icon } from '@iconify/react';
import { useState,useEffect } from 'react';
import StatusEditModal from "@/components/admin/StatusEditModal";
import CsvOutputModal from '@/components/admin/CsvOutputModal';
import AllMessageSendModal from "@/components/admin/AllMessageSendModal"
import { useRouter } from 'next/navigation';

export default function Page() { 
    const [openRows, setOpenRows] = useState<number[]>([]);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [displayCount, setDisplayCount] = useState<number>(10);

    const [isStatusEditModalOpen, setIsStatusEditModalOpen] = useState(false);
    const [isCsvOutputModalOpen, setIsCsvOutputModalOpen] = useState(false);
    const [isAllMessageSendModalOpen, setIsAllMessageSendModalOpen] = useState(false);

    const router = useRouter();

    const toggleRow = (id: number) => {
        setOpenRows(prev => 
            prev.includes(id) 
                ? prev.filter(rowId => rowId !== id)
                : [...prev, id]
        );
    };

    // モーダルが開いている時に背景のスクロールを防ぐ
    useEffect(() => {
        if (isStatusEditModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        // クリーンアップ関数
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isStatusEditModalOpen]);

    const handleStatusEdit = () => {
        setIsStatusEditModalOpen(true)
    }
    const handleCsvOutput = () => {
        setIsCsvOutputModalOpen(true)
    }
    const handleAllMessageSend = () => {
        setIsAllMessageSendModalOpen(true);
    }
    const closeModal = () => {
        setIsStatusEditModalOpen(false)
        setIsCsvOutputModalOpen(false)
        setIsAllMessageSendModalOpen(false)
    }

    const handlepreview = () => {
        router.push('/admin/print-preview')
    }

    // サンプルデータ
    const tableData = [
        { id: 10, title: '転生したらスライムだった件', nickname: '象花たろう', status: '一次通過', votes: 30 },
        { id: 11, title: '本好きの下剋上', nickname: '山田太郎', status: '一次通過', votes: 45 },
        { id: 12, title: '無職転生', nickname: '佐藤花子', status: '一次通過', votes: 15 },
        { id: 13, title: 'オーバーロード', nickname: '田中一郎', status: '一次通過', votes: 28 },
        { id: 14, title: 'この素晴らしい世界に祝福を!', nickname: '鈴木次郎', status: '一次通過', votes: 52 },
        { id: 15, title: 'Re:ゼロから始める異世界生活', nickname: '高橋三郎', status: '一次通過', votes: 38 },
        { id: 16, title: '幼女戦記', nickname: '伊藤四郎', status: '一次通過', votes: 22 },
        { id: 17, title: 'ログ・ホライズン', nickname: '渡辺五郎', status: '一次通過', votes: 19 },
        { id: 18, title: 'ソードアート・オンライン', nickname: '中村六郎', status: '一次通過', votes: 67 },
        { id: 19, title: '魔法科高校の劣等生', nickname: '小林七郎', status: '一次通過', votes: 41 },
        { id: 20, title: 'ダンジョンに出会いを求めるのは間違っているだろうか', nickname: '加藤八郎', status: '一次通過', votes: 33 },
        { id: 21, title: 'ゲート 自衛隊 彼の地にて、斯く戦えり', nickname: '吉田九郎', status: '一次通過', votes: 25 },
        { id: 22, title: '盾の勇者の成り上がり', nickname: '山本十郎', status: '一次通過', votes: 44 },
        { id: 23, title: '転生賢者の異世界ライフ', nickname: '松本花子', status: '一次通過', votes: 31 },
        { id: 24, title: '薬屋のひとりごと', nickname: '井上美咲', status: '一次通過', votes: 58 },
        { id: 25, title: '異世界食堂', nickname: '木村健太', status: '一次通過', votes: 27 },
        { id: 26, title: '蜘蛛ですが、なにか?', nickname: '林美穂', status: '一次通過', votes: 36 },
        { id: 27, title: '勇者パーティーを追放されたビーストテイマー', nickname: '清水大輔', status: '一次通過', votes: 20 },
        { id: 28, title: '陰の実力者になりたくて!', nickname: '森田裕子', status: '一次通過', votes: 49 },
        { id: 29, title: '最強陰陽師の異世界転生記', nickname: '石川雄一', status: '一次通過', votes: 34 },
    ];
    // 表示するデータをスライス
    const displayedData = tableData.slice(0, displayCount);
    
    return (
        <main>
            {/*---------------------------
            検索ボックス
            ---------------------------*/}
            <div className="flex px-5 pt-3 pb-6 mx-8 my-6 shadow-sm search-area">
                
                <div className="input-group">
                    <p>書籍タイトル</p>
                    <Textbox 
                        size="lg" 
                        className="custom-input-full"
                    />
                </div>

                <div className="ml-5 input-group">
                    <p>ニックネーム</p>
                    <Textbox
                        className='custom-input-full'
                        type='text'/>
                </div>

                <div className="ml-5 input-group">
                    <p>ステータス</p>
                    <select className='custom-input-full'>
                        <option value="評価前">評価前</option>
                        <option value="一次通過">一次通過</option>
                        <option value="二次通過">二次通過</option>
                        <option value="三次通過">三次通過</option>
                    </select>
                </div>

                <AdminButton
                    label="検索" 
                    type="submit" 
                    icon="mdi:search"
                    iconPosition="left"
                    className='self-end ml-5 search-btn'
                />
            </div>

            <div className='flex justify-end mx-8 gap-3'>
                <AdminButton
                    label='メッセージ送信'
                    icon='ic:baseline-message'
                    iconPosition='left'
                    className='w-auto'
                    onClick={handleAllMessageSend}
                />
                <AdminButton
                    label='CSV出力'
                    icon='material-symbols:download'
                    iconPosition='left'
                    className='w-auto'
                    onClick={handleCsvOutput}
                />
                <AdminButton
                    label='ステータス変更'
                    icon='material-symbols:edit-outline'
                    iconPosition='left'
                    className='w-auto'
                    onClick={handleStatusEdit}
                />
            </div>

            <div className='flex items-center mx-8 gap-3'>
                <p>表示数</p>
                <select
                    className='all-select'
                    value={displayCount}
                    onChange={(e) => setDisplayCount(Number(e.target.value))}
                >
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                </select>
                <button className='choice-btn font-bold'>一括選択</button>
            </div>

            <div className='mx-8 mt-8'>
                <table className="w-full event-table">
                    <thead className='table-head'>
                        <tr>
                            <th className='flex items-center justify-center '>
                                {/* <input type="checkbox" className='head-check' disabled/> */}
                                <div className='my-2 ml-1 head-check bg-white'></div>
                            </th>
                            <th className='w-28'>
                                <div className='flex items-center '>
                                    ID<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th className='w-1/4'>
                                <div className='flex items-center'>
                                    書籍タイトル<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className='flex items-center'>
                                    ニックネーム<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className='flex items-center '>
                                    ステータス<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                <div className='flex items-center'>
                                    投票数<Icon icon='uil:arrow' rotate={1}></Icon>
                                </div>
                            </th>
                            <th>
                                {/* <Icon icon='fe:arrow-up'></Icon> */}
                            </th>
                        </tr>
                    </thead>
                    {/* アコーディオン */}
                    <tbody className='border'>
                        {displayedData.map((row) => (
                            <>
                                <tr key={row.id} className='table-row'>
                                    <td className='text-center py-2 pl-1'>
                                        <input type="checkbox" className='head-check'/>
                                    </td>
                                    <td>
                                        <span>{row.id}</span>
                                    </td>
                                    <td>
                                        <span className='title-text'>{row.title}</span>
                                    </td>
                                    <td>
                                        <span>{row.nickname}</span>
                                    </td>
                                    <td>
                                        <span className='status-text font-bold py-2 px-6 rounded-2xl'>{row.status}</span>
                                    </td>
                                    <td>
                                        <span>{row.votes}</span>
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => toggleRow(row.id)}
                                            className='accordion-toggle'
                                        >
                                            <Icon 
                                                icon='fe:arrow-up' 
                                                className={`icon transition-transform ${openRows.includes(row.id) ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                    </td>
                                </tr>
                                {openRows.includes(row.id) && (
                                    <tr key={`${row.id}-details`} className='details-row'>
                                        <td colSpan={7} className='details-content'>
                                            <div className='p-4 flex'>
                                                <section className='w-4/7'>
                                                    <h3 className='font-bold mb-2 ml-4'>書評本文</h3>
                                                    <div className='book-review-section w-auto h-84 ml-4 p-2'>
                                                        <p>１ヶ月前、私は会社の先輩の冴子さえこさんと付き合うことになった。
                                                            前からずっと気になっていた先輩に断れるのを覚悟で呑みに誘った。
                                                            「美味しいお酒が呑めるなら一緒に呑んでもいいけど」
                                                            普段あまり笑顔を見せない冴子さんが少し楽しそうに笑みを浮かべているのを見て、私は内心ガッツポーズをした。
                                                            大分酔いが回って来た頃、私は思いきって冴子さんに
                                                            「彼氏さんどんな人なんですか？」と探りを入れた。
                                                            社内でも美人で仕事もできる冴子さんがモテないわけがないのだけど、人づてにフリーらしいと聞いて本当かどうか確かめたかった。「今は一人」「へぇ～意外ですね。私が男なら冴子さんみたいな素敵な人、絶対落としに行きますよ！」「藍田あいだは男じゃないから落としには来ないってこと？」全くもって予想外の返答に私は持っていたグラスを落としそうになった。「…女が落としに行っても冴子さんは落ちてくれるんですか？」平然を装いながら、でも内心では耳元にも聞こえるくらいに心臓がドキドキしていた。「男とか女とかそんな些末なこと、どうでもいいでしょ」当たり前のことを聞くなと言わんばかりの態度に私は思いきって
                                                            エクスアーマータイプ：モノケロス。リバティー・アライアンスの紋章に描かれたモノケロスを外観モチーフに取り入れた最新型のアーマータイプである。ポーンA1などの生命保護機能を重要視した汎用アーマータイプと異なり、より攻撃的な目的をもって開発された経緯を持つ。また使用者の能力・適正に依存する部分が多く、白堊理研の人体強化計画によって生み出された強化兵士を素体として装着することを前提としている。
                                                            リバティー・アライアンスにとって脅威となる「ゾアントロプス・レーヴェ」「パラポーン・エクスパンダー」といった強力な個体に対抗するべく、素体となる強化兵士は全身の知覚、筋力を強制的に向上させられている。彼らは 機械部品に頼らない生物としての強化を施され、ヒトという種の枠の中で生きながらに最大限の戦闘能力を獲得したが、代償としてすべての個体が人格面に何らかの障害を抱えている。実戦では一体がモノケロスを纏って対エクスパンダーに投入された記録があり、短時間ではあるが互角以上の戦闘能力を発揮したこの個体には「白麟角」と呼ばれる特別な呼称が与えられた。
                                                        </p>
                                                    </div>
                                                </section>

                                                <section className='ml-10 w-3/7'>
                                                    <h3 className='font-bold mb-2'>書籍情報</h3>
                                                    <div>
                                                        <div className='book-data'>
                                                            <h4 className='book-head'>タイトル</h4>
                                                            <p className='book-content'>転生したらスライムだった件</p>
                                                        </div>

                                                        <div className='book-data'>
                                                            <h4 className='book-head'>著者</h4>
                                                            <p className='book-content'>伏瀬</p>
                                                        </div>

                                                        <div className='book-data'>
                                                            <h4 className='book-head'>出版社</h4>
                                                            <p className='book-content'>マイクロマガジン社</p>
                                                        </div>

                                                        <div className='book-data'>
                                                            <h4 className='book-head'>ISBN</h4>
                                                            <p className='book-content'>978-4-89637-459-9(一巻)</p>
                                                        </div>
                                                    </div>
                                                    <div className='flex justify-end '>
                                                        <AdminButton
                                                            label='印刷プレビュー'
                                                            icon='material-symbols:print'
                                                            iconPosition='left'
                                                            className='print-preview-btn w-auto'   
                                                            onClick={handlepreview}
                                                        />
                                                    </div>
                                                </section>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ページネーション */}
            <div className="flex items-center justify-center my-5 page-section">
                <Icon icon="weui:arrow-filled" rotate={2} width={20} className="page-arrow"></Icon>
                <button
                    type="button"
                    className={`px-4 py-1 page-number ${currentPage === 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(1)}
                    aria-current={currentPage === 1 ? "page" : undefined}
                >1</button>
                <button
                    type="button"
                    className={`px-4 py-1 page-number ${currentPage === 2 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(2)}
                    aria-current={currentPage === 2 ? "page" : undefined}
                >2</button>
                <button
                    type="button"
                    className={`px-4 py-1 page-number ${currentPage === 3 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(3)}
                    aria-current={currentPage === 3 ? "page" : undefined}
                >3</button>
                <span className="px-4 py-1 page-number" aria-hidden="true">...</span>
                <button
                    type="button"
                    className={`px-4 py-1 page-number ${currentPage === 5 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(5)}
                    aria-current={currentPage === 5 ? "page" : undefined}
                >5</button>
                <Icon icon="weui:arrow-filled" width={20} className="page-arrow"></Icon>
            </div>

            {/* モーダル */}
            <StatusEditModal isOpen={isStatusEditModalOpen} onClose={closeModal} />
            <CsvOutputModal isOpen={isCsvOutputModalOpen} onClose={closeModal} />
            <AllMessageSendModal isOpen={isAllMessageSendModalOpen} onClose={closeModal}/>
        </main>
    )    
}
