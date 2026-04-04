import { Form, Link, redirect, useNavigation } from "react-router";
import { motion } from "framer-motion";
import type { Route } from "./+types/community-post";
import { requireUser } from "~/lib/session.server";
import {
  getForumPostById,
  getForumReplies,
  createForumReply,
  deleteForumPost,
} from "~/lib/db.server";
import { Button } from "~/components/ui/button";
import type { ForumCategory } from "~/lib/types";

export function meta({ data }: Route.MetaArgs) {
  const title = data?.post?.title || "Objava";
  return [{ title: `${title} - MitroStart` }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const post = getForumPostById(params.id);
  if (!post) throw new Response("Objava nije pronađena", { status: 404 });
  const replies = getForumReplies(params.id);
  return { user, post, replies };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const intent = formData.get("intent") as string;

  if (intent === "reply") {
    const content = (formData.get("content") as string)?.trim();
    if (!content) return { error: "Odgovor ne može biti prazan" };
    createForumReply({ postId: params.id, authorId: user.id, content });
    return { error: null };
  }

  if (intent === "delete") {
    deleteForumPost(params.id, user.id);
    throw redirect("/community");
  }

  return { error: null };
}

const categoryLabels: Record<ForumCategory, string> = {
  pitanje: "Pitanje",
  diskusija: "Diskusija",
  resurs: "Resurs",
  objava: "Objava",
};

const categoryColors: Record<ForumCategory, string> = {
  pitanje: "bg-cyan-100 text-cyan-700 border-cyan-300",
  diskusija: "bg-indigo-100 text-indigo-700 border-indigo-300",
  resurs: "bg-amber-100 text-amber-700 border-amber-300",
  objava: "bg-emerald-100 text-emerald-700 border-emerald-300",
};

const roleLabels: Record<string, string> = {
  admin: "Admin",
  investor: "Investitor",
  applicant: "Preduzetnik",
};

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr + "Z");
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "upravo sada";
  if (diff < 3600) return `pre ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `pre ${Math.floor(diff / 3600)}h`;
  return `pre ${Math.floor(diff / 86400)}d`;
}

export default function CommunityPost({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { user, post, replies } = loaderData;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <Link
            to="/community"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            ← Nazad na forum
          </Link>
        </motion.div>

        {/* Post */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-border-subtle mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                categoryColors[post.category as ForumCategory]
              }`}
            >
              {categoryLabels[post.category as ForumCategory]}
            </span>
            <span className="text-xs text-text-muted">
              {timeAgo(post.createdAt)}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {post.title}
          </h1>

          <div className="text-text-secondary leading-relaxed whitespace-pre-wrap mb-6">
            {post.content}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
                {post.authorName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-sm font-medium text-text-primary">
                  {post.authorName}
                </span>
                <span className="text-xs text-text-muted ml-2">
                  {roleLabels[post.authorRole || "applicant"]}
                </span>
              </div>
              {post.authorId !== user.id && (
                <Link
                  to={`/community/messages/${post.authorId}`}
                  className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors ml-2"
                >
                  Pošalji poruku
                </Link>
              )}
            </div>
            {post.authorId === user.id && (
              <Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <button
                  type="submit"
                  className="text-xs text-red-500/70 hover:text-red-600 transition-colors cursor-pointer"
                  onClick={(e) => {
                    if (!confirm("Da li ste sigurni da želite da obrišete ovu objavu?"))
                      e.preventDefault();
                  }}
                >
                  Obriši
                </button>
              </Form>
            )}
          </div>
        </motion.div>

        {/* Replies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            Odgovori ({replies.length})
          </h2>

          {replies.length === 0 ? (
            <div className="glass rounded-xl p-6 text-center text-text-muted text-sm">
              Još nema odgovora. Budite prvi!
            </div>
          ) : (
            <div className="space-y-3">
              {replies.map((reply, i) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.04 }}
                  className="glass rounded-xl p-4 border border-border-subtle"
                >
                  <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap mb-3">
                    {reply.content}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                      {reply.authorName?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-text-secondary">
                      {reply.authorName}
                    </span>
                    <span>·</span>
                    <span>{roleLabels[reply.authorRole || "applicant"]}</span>
                    <span>·</span>
                    <span>{timeAgo(reply.createdAt)}</span>
                    {reply.authorId !== user.id && (
                      <>
                        <span>·</span>
                        <Link
                          to={`/community/messages/${reply.authorId}`}
                          className="text-indigo-600 hover:text-indigo-700 transition-colors"
                        >
                          Poruka
                        </Link>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Reply form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-border-subtle"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Napišite odgovor
          </h3>
          <Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="reply" />
            <textarea
              name="content"
              required
              rows={4}
              placeholder="Vaš odgovor..."
              className="w-full px-4 py-3 rounded-xl bg-white/70 border border-border-subtle focus:border-indigo-400/50 focus:outline-none text-text-primary placeholder-text-muted transition-colors resize-none text-sm"
            />
            {actionData?.error && (
              <p className="text-red-600 text-sm">{actionData.error}</p>
            )}
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              Odgovori
            </Button>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
