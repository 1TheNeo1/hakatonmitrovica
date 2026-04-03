import { Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import type { Route } from "./+types/edukacija";
import { getAllTutorials } from "~/lib/db.server";
import { getUserFromRequest } from "~/lib/session.server";
import { CATEGORIES, TUTORIAL_TYPES } from "~/lib/constants";
import type { Tutorial } from "~/lib/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Edukacija - MitroStart" },
    {
      name: "description",
      content:
        "Naučite kako da pokrenete biznis u Kosovskoj Mitrovici. Blogovi, video tutorijali i resursi od profesionalaca.",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserFromRequest(request);
  const tutorials = getAllTutorials();
  return { tutorials, user };
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const TYPE_ICONS: Record<string, string> = {
  blog: "📝",
  video: "🎬",
  resource: "🔗",
};

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function Edukacija({ loaderData }: Route.ComponentProps) {
  const { tutorials, user } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "";
  const activeType = searchParams.get("type") || "";

  const canCreate = user && (user.role === "admin" || user.role === "investor");

  const filtered = tutorials.filter((t: Tutorial) => {
    if (activeCategory && t.category !== activeCategory) return false;
    if (activeType && t.type !== activeType) return false;
    return true;
  });

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  }

  return (
    <div
      className="min-h-screen pt-20 pb-16 px-6"
      style={{
        background:
          "linear-gradient(135deg, #f0f0ff 0%, #e8eeff 40%, #f5f0ff 70%, #eef5ff 100%)",
        color: "#1e1b4b",
      }}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Edukacija
          </h1>
          <p className="text-lg" style={{ color: "#4b5563" }}>
            Blogovi, video tutorijali i resursi za buduće preduzetnike
          </p>
          {canCreate && (
            <Link
              to="/edukacija/novo"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
            >
              + Dodaj sadržaj
            </Link>
          )}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-8 space-y-3"
        >
          {/* Type filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("type", "")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                !activeType
                  ? "bg-indigo-600 text-white"
                  : "bg-white/60 text-gray-600 hover:bg-white/80"
              }`}
            >
              Svi tipovi
            </button>
            {TUTORIAL_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilter("type", activeType === t.id ? "" : t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeType === t.id
                    ? "bg-indigo-600 text-white"
                    : "bg-white/60 text-gray-600 hover:bg-white/80"
                }`}
              >
                {TYPE_ICONS[t.id]} {t.label}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("category", "")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                !activeCategory
                  ? "bg-indigo-600 text-white"
                  : "bg-white/60 text-gray-600 hover:bg-white/80"
              }`}
            >
              Sve kategorije
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() =>
                  setFilter("category", activeCategory === c.id ? "" : c.id)
                }
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  activeCategory === c.id
                    ? "bg-indigo-600 text-white"
                    : "bg-white/60 text-gray-600 hover:bg-white/80"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Tutorial grid */}
        {filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-xl" style={{ color: "#6b7280" }}>
              Još nema sadržaja
            </p>
            <p className="text-sm mt-2" style={{ color: "#9ca3af" }}>
              {canCreate
                ? 'Kliknite "Dodaj sadržaj" da kreirate prvi tutorijal.'
                : "Uskoro će biti dostupni edukativni materijali."}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((tutorial: Tutorial, i: number) => (
              <motion.div
                key={tutorial.id}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
              >
                <Link
                  to={`/edukacija/${tutorial.id}`}
                  className="block rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  style={{
                    background: "rgba(255, 255, 255, 0.7)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(99, 102, 241, 0.1)",
                  }}
                >
                  {/* Video thumbnail */}
                  {tutorial.type === "video" && tutorial.videoUrl && (
                    <div className="relative aspect-video bg-gray-100">
                      {extractYouTubeId(tutorial.videoUrl) ? (
                        <img
                          src={`https://img.youtube.com/vi/${extractYouTubeId(tutorial.videoUrl)}/mqdefault.jpg`}
                          alt={tutorial.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🎬
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <span className="text-indigo-600 text-lg ml-0.5">▶</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className="px-2.5 py-0.5 rounded-md text-xs font-semibold"
                        style={{
                          background: "rgba(99, 102, 241, 0.1)",
                          color: "#6366f1",
                        }}
                      >
                        {TYPE_ICONS[tutorial.type]}{" "}
                        {TUTORIAL_TYPES.find((t) => t.id === tutorial.type)?.label}
                      </span>
                      <span
                        className="px-2.5 py-0.5 rounded-md text-xs font-medium"
                        style={{
                          background: "rgba(139, 92, 246, 0.1)",
                          color: "#7c3aed",
                        }}
                      >
                        {CATEGORIES.find((c) => c.id === tutorial.category)?.label ||
                          tutorial.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold mb-2 line-clamp-2" style={{ color: "#1e1b4b" }}>
                      {tutorial.title}
                    </h3>
                    <p
                      className="text-sm line-clamp-3 mb-4"
                      style={{ color: "#4b5563" }}
                    >
                      {tutorial.summary}
                    </p>

                    <div
                      className="flex items-center justify-between text-xs"
                      style={{ color: "#9ca3af" }}
                    >
                      <span>{tutorial.authorName || "Nepoznat autor"}</span>
                      <span>
                        {new Date(tutorial.createdAt).toLocaleDateString("sr-Latn-RS")}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
