import { Form, useActionData, useNavigation } from "react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { redirect } from "react-router";
import type { Route } from "./+types/edukacija-novo";
import { requireUser } from "~/lib/session.server";
import { createTutorial } from "~/lib/db.server";
import { CATEGORIES, TUTORIAL_TYPES } from "~/lib/constants";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dodaj sadržaj - Edukacija - MitroStart" },
    {
      name: "description",
      content: "Kreirajte novi edukativni sadržaj za preduzetnike",
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  if (user.role !== "admin" && user.role !== "investor") {
    throw redirect("/edukacija");
  }
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  if (user.role !== "admin" && user.role !== "investor") {
    throw redirect("/edukacija");
  }

  const formData = await request.formData();
  const title = (formData.get("title") as string)?.trim();
  const summary = (formData.get("summary") as string)?.trim();
  const type = formData.get("type") as string;
  const category = formData.get("category") as string;
  const body = (formData.get("body") as string)?.trim() || undefined;
  const videoUrl = (formData.get("videoUrl") as string)?.trim() || undefined;
  const resourceUrl =
    (formData.get("resourceUrl") as string)?.trim() || undefined;

  if (!title) return { error: "Naslov je obavezan." };
  if (!summary) return { error: "Kratak opis je obavezan." };
  if (!type) return { error: "Izaberite tip sadržaja." };
  if (!category) return { error: "Izaberite kategoriju." };
  if (type === "video" && !videoUrl)
    return { error: "Video link je obavezan za video sadržaj." };
  if (type === "resource" && !resourceUrl)
    return { error: "Link ka resursu je obavezan." };

  const id = createTutorial({
    authorId: user.id,
    title,
    summary,
    body,
    type,
    category,
    videoUrl,
    resourceUrl,
  });

  return redirect(`/edukacija/${id}`);
}

export default function EdukacijaNovo({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const error = actionData?.error as string | undefined;
  const [type, setType] = useState("blog");

  return (
    <div
      className="min-h-screen pt-20 pb-16 px-6"
      style={{
        background:
          "linear-gradient(135deg, #f0f0ff 0%, #e8eeff 40%, #f5f0ff 70%, #eef5ff 100%)",
        color: "#1e1b4b",
      }}
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Dodaj sadržaj
          </h1>
          <p className="text-base" style={{ color: "#6b7280" }}>
            Kreirajte blog, video tutorijal ili podelite koristan resurs
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="rounded-2xl p-8"
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(99, 102, 241, 0.1)",
          }}
        >
          {error && (
            <div
              className="mb-6 p-4 rounded-xl text-sm font-medium"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "#dc2626",
                border: "1px solid rgba(239, 68, 68, 0.2)",
              }}
            >
              {error}
            </div>
          )}

          <Form method="post" className="space-y-6">
            {/* Type */}
            <div>
              <label
                className="block text-sm font-semibold mb-2"
                style={{ color: "#1e1b4b" }}
              >
                Tip sadržaja
              </label>
              <div className="flex gap-3">
                {TUTORIAL_TYPES.map((t) => (
                  <label
                    key={t.id}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 ${
                      type === t.id
                        ? "ring-2 ring-indigo-500 bg-indigo-50 text-indigo-700"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={t.id}
                      checked={type === t.id}
                      onChange={() => setType(t.id)}
                      className="sr-only"
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#1e1b4b" }}
              >
                Naslov
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                maxLength={200}
                placeholder="npr. Kako napisati biznis plan"
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                style={{
                  background: "rgba(249, 250, 251, 1)",
                  border: "1px solid rgba(99, 102, 241, 0.15)",
                  color: "#1e1b4b",
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#1e1b4b" }}
              >
                Kategorija
              </label>
              <select
                id="category"
                name="category"
                required
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none cursor-pointer"
                style={{
                  background: "rgba(249, 250, 251, 1)",
                  border: "1px solid rgba(99, 102, 241, 0.15)",
                  color: "#1e1b4b",
                }}
              >
                <option value="">Izaberite kategoriju...</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Summary */}
            <div>
              <label
                htmlFor="summary"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#1e1b4b" }}
              >
                Kratak opis
              </label>
              <textarea
                id="summary"
                name="summary"
                required
                rows={2}
                maxLength={500}
                placeholder="Kratak opis koji će se prikazati na kartici..."
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none resize-none"
                style={{
                  background: "rgba(249, 250, 251, 1)",
                  border: "1px solid rgba(99, 102, 241, 0.15)",
                  color: "#1e1b4b",
                }}
              />
            </div>

            {/* Video URL - conditional */}
            {type === "video" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label
                  htmlFor="videoUrl"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#1e1b4b" }}
                >
                  Video link (YouTube)
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                  style={{
                    background: "rgba(249, 250, 251, 1)",
                    border: "1px solid rgba(99, 102, 241, 0.15)",
                    color: "#1e1b4b",
                  }}
                />
              </motion.div>
            )}

            {/* Resource URL - conditional */}
            {type === "resource" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label
                  htmlFor="resourceUrl"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: "#1e1b4b" }}
                >
                  Link ka resursu
                </label>
                <input
                  type="url"
                  id="resourceUrl"
                  name="resourceUrl"
                  required
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none"
                  style={{
                    background: "rgba(249, 250, 251, 1)",
                    border: "1px solid rgba(99, 102, 241, 0.15)",
                    color: "#1e1b4b",
                  }}
                />
              </motion.div>
            )}

            {/* Body */}
            <div>
              <label
                htmlFor="body"
                className="block text-sm font-semibold mb-2"
                style={{ color: "#1e1b4b" }}
              >
                Sadržaj{" "}
                {type !== "blog" && (
                  <span className="font-normal" style={{ color: "#9ca3af" }}>
                    (opciono)
                  </span>
                )}
              </label>
              <textarea
                id="body"
                name="body"
                rows={type === "blog" ? 12 : 5}
                required={type === "blog"}
                placeholder={
                  type === "blog"
                    ? "Napišite svoj blog post ovde...\n\nKoristite prazan red za novi paragraf."
                    : "Dodatni opis ili napomene..."
                }
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 outline-none resize-none"
                style={{
                  background: "rgba(249, 250, 251, 1)",
                  border: "1px solid rgba(99, 102, 241, 0.15)",
                  color: "#1e1b4b",
                }}
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-2">
              <Button type="submit" variant="primary" isLoading={isSubmitting}>
                Objavi
              </Button>
              <a
                href="/edukacija"
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: "#6b7280" }}
              >
                Otkaži
              </a>
            </div>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
