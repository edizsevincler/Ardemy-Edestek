import Link from "next/link";
import { CopyLinkButton } from "@/components/CopyLinkButton";
import { SITE_URL } from "@/lib/site";
import { getSocialQuestion, SOCIAL_LANGUAGES } from "@/lib/social-question";

const SLUGS: Record<string, string> = { Rusça: "rusca", İngilizce: "ingilizce" };
const HASHTAGS: Record<string, string> = {
  Rusça: "#rusça #rusçaöğreniyorum #dilöğrenme #ardemyacademy",
  İngilizce: "#ingilizce #ingilizceöğreniyorum #dilöğrenme #ardemyacademy",
};

export default async function AdminSocialPage({
  searchParams,
}: {
  searchParams: Promise<{ language?: string; n?: string }>;
}) {
  const params = await searchParams;
  const language = (SOCIAL_LANGUAGES as readonly string[]).includes(
    params.language ?? ""
  )
    ? (params.language as string)
    : SOCIAL_LANGUAGES[0];
  const n = Math.max(0, Number(params.n ?? "0") || 0);

  const { question, total } = await getSocialQuestion(language, n);

  const query = (extra: string) =>
    `/api/admin/social/question?language=${encodeURIComponent(language)}&n=${n}${extra}`;

  const caption = question
    ? [
        `📅 Günün ${language} sorusu!`,
        "",
        question.prompt,
        ...question.options.map((o, i) => `${"ABCD"[i]}) ${o}`),
        "",
        "Cevabını yorumlara yaz 👇 Doğru cevap hikayemizde!",
        "",
        `🎁 Ücretsiz dene: ${SITE_URL}/dene/${SLUGS[language]}`,
        "",
        HASHTAGS[language],
      ].join("\n")
    : "";

  const images = [
    { title: "Soru — kare (feed)", extra: "&format=square", file: "soru-kare" },
    { title: "Cevap — kare (feed)", extra: "&format=square&reveal=1", file: "cevap-kare" },
    { title: "Soru — hikaye", extra: "&format=story", file: "soru-hikaye" },
    { title: "Cevap — hikaye", extra: "&format=story&reveal=1", file: "cevap-hikaye" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          📣 Sosyal Medya İçeriği
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Her gün için hazır &quot;Günün Sorusu&quot; görselleri. Soru görselini
          paylaş, cevap görselini hikâyeye veya ertesi güne koy.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {SOCIAL_LANGUAGES.map((l) => (
          <Link
            key={l}
            href={`/admin/social?language=${encodeURIComponent(l)}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              l === language
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {l}
          </Link>
        ))}
        <span className="mx-2 text-slate-300">|</span>
        <Link
          href={`/admin/social?language=${encodeURIComponent(language)}&n=${n + 1}`}
          className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          🔄 Başka soru
        </Link>
        {n > 0 && (
          <Link
            href={`/admin/social?language=${encodeURIComponent(language)}&n=${n - 1}`}
            className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            ← Önceki
          </Link>
        )}
      </div>

      {!question ? (
        <p className="text-sm text-slate-500">
          Bu dilde görsele uygun (kısa) soru bulunamadı.
        </p>
      ) : (
        <>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">
              {question.subject} · {total} uygun soru arasından
            </p>
            <p className="mt-1 font-medium text-slate-900">{question.prompt}</p>
            <p className="mt-1 text-sm text-slate-500">
              Doğru cevap: {"ABCD"[question.correct]}){" "}
              {question.options[question.correct]}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {images.map((img) => (
              <div
                key={img.file}
                className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <p className="text-sm font-medium text-slate-700">{img.title}</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={query(img.extra)}
                  alt={img.title}
                  loading="lazy"
                  className="mx-auto max-h-96 w-auto rounded-lg border border-slate-100"
                />
                <a
                  href={query(`${img.extra}&download=1`)}
                  className="block rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-center text-sm font-medium text-white"
                >
                  ⬇️ İndir
                </a>
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-700">Önerilen açıklama</p>
            <textarea
              readOnly
              value={caption}
              rows={12}
              className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-700"
            />
            <CopyLinkButton text={caption} label="Açıklamayı Kopyala" />
          </div>
        </>
      )}
    </div>
  );
}
