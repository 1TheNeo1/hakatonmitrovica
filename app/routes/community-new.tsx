import { Form, redirect, useNavigation } from "react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Route } from "./+types/community-new";
import { requireUser } from "~/lib/session.server";
import { createForumPost } from "~/lib/db.server";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Nova objava - MitroStart" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  return { user };
}

export async function action({ request }: Route.ActionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim();
  const category = formData.get("category") as string;

  if (!title || !content || !category) {
    return { error: "Sva polja su obavezna" };
  }

  if (title.length < 3) {
    return { error: "Naslov mora imati najmanje 3 karaktera" };
  }

  const id = createForumPost({
    authorId: user.id,
    title,
    content,
    category,
  });

  throw redirect(`/community/post/${id}`);
}

const categories = [
  { value: "pitanje", label: "Pitanje", icon: "❓" },
  { value: "diskusija", label: "Diskusija", icon: "💬" },
  { value: "resurs", label: "Resurs", icon: "📚" },
  { value: "objava", label: "Objava", icon: "📢" },
];

export default function CommunityNew({
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [selectedCategory, setSelectedCategory] = useState("pitanje");

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            <span className="animated-gradient-text">Nova objava</span>
          </h1>
          <p className="text-text-secondary">
            Podelite pitanje, ideju ili resurs sa zajednicom
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border border-border-subtle"
        >
          <Form method="post" className="space-y-6">
            {/* Category selector */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-3">
                Kategorija
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <label
                    key={cat.value}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl cursor-pointer border text-sm font-medium transition-all ${
                      selectedCategory === cat.value
                        ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-400"
                        : "bg-white/[0.03] border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={cat.value}
                      checked={selectedCategory === cat.value}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="hidden"
                    />
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Naslov
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Npr. Kako pokrenuti biznis u Mitrovici?"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-border-subtle focus:border-indigo-500/50 focus:outline-none text-text-primary placeholder-text-muted transition-colors"
              />
            </div>

            {/* Content */}
            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Sadržaj
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={8}
                placeholder="Opišite detaljno šta želite da podelite ili pitajte..."
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-border-subtle focus:border-indigo-500/50 focus:outline-none text-text-primary placeholder-text-muted transition-colors resize-none"
              />
            </div>

            {actionData?.error && (
              <p className="text-red-400 text-sm">{actionData.error}</p>
            )}

            <div className="flex items-center gap-3 pt-2">
              <Button variant="primary" type="submit" isLoading={isSubmitting}>
                Objavi
              </Button>
              <a
                href="/community"
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
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
