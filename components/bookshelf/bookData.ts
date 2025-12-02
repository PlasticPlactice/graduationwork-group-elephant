export type PatternType = "none" | "stripe" | "dot" | "check";

export type Book = {
  id: string;
  pattern: PatternType;
  baseColor: string;
  patternColor?: string;
  review?: string;
};

export const BOOKS: Book[] = [
  {
    id: "b1",
    pattern: "stripe",
    baseColor: "#ffffff",
    patternColor: "#71b9ff",
    review:
      "いつもの日常を離れ、青い海沿いの町で自分を見つめ直す女性の物語。静かな余韻が心に残り、読み終えると誰かにそっと勧めたくなります。",
  },
  {
    id: "b2",
    pattern: "check",
    baseColor: "#ffffff",
    patternColor: "#ff5b5b",
    review:
      "最愛の家族を失った青年が、一冊の本を手がかりに再生していくミステリー。赤い装丁のように熱を帯びながらも、最後は優しく背中を押してくれます。",
  },
  {
    id: "b3",
    pattern: "dot",
    baseColor: "#ffffff",
    patternColor: "#333333",
    review:
      "点描画のように日々を切り取った短編集。どこにでもあるしあわせが、黒いドットの間からきらりと光ります。通勤時間にもさらりと読める一冊です。",
  },
  {
    id: "b4",
    pattern: "none",
    baseColor: "#f5f5f5",
    review:
      "言葉数は少ないのに、余白に想像が広がるエッセイ。静かなページをめくるたびに、身近な風景が少しだけ違って見えてきます。",
  },
  {
    id: "b5",
    pattern: "stripe",
    baseColor: "#ffffff",
    patternColor: "#ffc857",
    review:
      "旅先で出会った見知らぬ人たちのエピソードを集めたノンフィクション。黄色のストライプのように、朗らかで温かい余韻が続きます。",
  },
  {
    id: "b6",
    pattern: "check",
    baseColor: "#ffffff",
    patternColor: "#6ac48f",
    review:
      "植物学者の父と過ごした季節を振り返る回想記。瑞々しい緑色の市松模様から、草いきれと土の匂いが立ち上ってきます。",
  },
  {
    id: "b7",
    pattern: "dot",
    baseColor: "#ffffff",
    patternColor: "#5555ff",
    review:
      "ラジオ番組を舞台にした青春群像劇。深夜のスタジオで交わされる会話が、青いドットのように夜空へ広がり、読者の記憶にも残ります。",
  },
  {
    id: "b8",
    pattern: "none",
    baseColor: "#f0f0f0",
    review:
      "写真と言葉を組み合わせた静かな作品集。装飾のないページだからこそ、ひとつひとつの瞬間が際立って胸に届きます。",
  },
  {
    id: "b9",
    pattern: "stripe",
    baseColor: "#fdf4ff",
    patternColor: "#d946ef",
    review:
      "不器用な姉妹が小さな菓子店を切り盛りする成長譚。ラベンダー色のストライプが示すように、甘さと切なさがほどよく溶け合っています。",
  },
  {
    id: "b10",
    pattern: "check",
    baseColor: "#fef2f2",
    patternColor: "#fb7185",
    review:
      "歴史の謎を追いながら、自分のルーツも探る冒険小説。ピンクの市松模様みたいに軽やかで、ページをめくる手が止まりません。",
  },
  {
    id: "b11",
    pattern: "stripe",
    baseColor: "#fdf4ff",
    patternColor: "#d946ef",
    review:
      "舞台俳優の母を持つ少女の成長を描いた物語。幕が上がる瞬間の高揚感が、鮮やかなストライプの間からあふれます。",
  },
  {
    id: "b12",
    pattern: "check",
    baseColor: "#fef2f2",
    patternColor: "#fb7185",
    review:
      "旅する料理人が各地で学んだレシピとエッセイ。市松模様のリズムに合わせて、キッチンに立ちたくなるアイデアが次々湧いてきます。",
  },
];
