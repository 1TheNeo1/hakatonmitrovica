import { Link, Form, useNavigation } from "react-router";
import { motion } from "framer-motion";
import { redirect } from "react-router";
import type { Route } from "./+types/edukacija-detalj";
import { getTutorialById, deleteTutorial } from "~/lib/db.server";
import { getUserFromRequest } from "~/lib/session.server";
import { CATEGORIES, TUTORIAL_TYPES } from "~/lib/constants";
import { Button } from "~/components/ui/button";

export function meta({ data }: Route.MetaArgs) {
  const title = data?.tutorial?.title || "Tutorijal";
  return [{ title: `${title} - Edukacija - MitroStart` }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const tutorial = getTutorialById(params.id);
  if (!tutorial) {
    throw new Response("Not Found", { status: 404 });
  }
  const user = await getUserFromRequest(request);
  return { tutorial, user };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    deleteTutorial(params.id);
    return redirect("/edukacija");
  }

  return null;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function EdukacijaDetalj({ loaderData }: Route.ComponentProps) {
  const { tutorial, user } = loaderData;
  const navigation = useNavigation();
  const isDeleting =
    navigation.state === "submitting" &&
    navigation.formData?.get("intent") === "delete";

  const isAdmin = user?.role === "admin";
  const typeLabel =
    TUTORIAL_TYPES.find((t) => t.id === tutorial.type)?.label || tutorial.type;
  const categoryLabel =
    CATEGORIES.find((c) => c.id === tutorial.category)?.label ||
    tutorial.category;

  const youtubeId =
    tutorial.type === "video" && tutorial.videoUrl
      ? extractYouTubeId(tutorial.videoUrl)
      : null;

  return (
    <div
      className="min-h-screen pt-20 pb-16 px-6"
      style={{
        background:
          "linear-gradient(135deg, #f0f0ff 0%, #e8eeff 40%, #f5f0ff 70%, #eef5ff 100%)",
        color: "#1e1b4b",
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            to="/edukacija"
            className="inline-flex items-center gap-1 text-sm font-medium mb-6 transition-colors duration-200"
            style={{ color: "#6366f1" }}
          >
            ← Nazad na edukaciju
          </Link>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(99, 102, 241, 0.1)",
          }}
        >
          {/* Video embed */}
          {tutorial.type === "video" && youtubeId && (
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
                title={tutorial.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="p-8">
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-3 py-1 rounded-md text-xs font-semibold"
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "#6366f1",
                }}
              >
                {typeLabel}
              </span>
              <span
                className="px-3 py-1 rounded-md text-xs font-medium"
                style={{
                  background: "rgba(139, 92, 246, 0.1)",
                  color: "#7c3aed",
                }}
              >
                {categoryLabel}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold mb-4" style={{ color: "#1e1b4b" }}>
              {tutorial.title}
            </h1>

            {/* Author & date */}
            <div
              className="flex items-center gap-4 mb-6 pb-6 text-sm"
              style={{
                color: "#6b7280",
                borderBottom: "1px solid rgba(99, 102, 241, 0.1)",
              }}
            >
              <span>{tutorial.authorName || "Nepoznat autor"}</span>
              <span>
                {new Date(tutorial.createdAt).toLocaleDateString("sr-Latn-RS", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {/* Resource link */}
            {tutorial.type === "resource" && tutorial.resourceUrl && (
              <a
                href={tutorial.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mb-6 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                }}
              >
                🔗 Otvori resurs →
              </a>
            )}

            {/* Summary */}
            <p
              className="text-base leading-relaxed mb-6 font-medium"
              style={{ color: "#374151" }}
            >
              {tutorial.summary}
            </p>

            {/* Body */}
            {tutorial.body && (
              <div className="prose prose-gray max-w-none">
                {tutorial.body.split("\n\n").map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-base leading-relaxed mb-4"
                    style={{ color: "#4b5563" }}
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {/* Video link for non-embedded */}
            {tutorial.type === "video" && tutorial.videoUrl && !youtubeId && (
              <a
                href={tutorial.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 px-5 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                }}
              >
                🎬 Pogledaj video →
              </a>
            )}

            {/* Admin delete */}
            {isAdmin && (
              <div
                className="mt-8 pt-6"
                style={{ borderTop: "1px solid rgba(239, 68, 68, 0.2)" }}
              >
                <Form method="post">
                  <input type="hidden" name="intent" value="delete" />
                  <Button
                    type="submit"
                    variant="ghost"
                    isLoading={isDeleting}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    Obriši tutorijal
                  </Button>
                </Form>
              </div>
            )}
          </div>
        </motion.article>
      </div>
    </div>
  );
}
