import { Link, useLoaderData, useLocation } from "react-router";
import { motion } from "framer-motion";
import type { Route } from "./+types/community";
import { requireUser } from "~/lib/session.server";
import { getAllForumPosts, getUnreadMessageCount } from "~/lib/db.server";
import type { ForumCategory } from "~/lib/types";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Zajednica - MitroStart" },
    { name: "description", content: "Forum i poruke za preduzetnike" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const posts = getAllForumPosts();
  const unreadCount = getUnreadMessageCount(user.id);
  return { user, posts, unreadCount };
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

export default function Community({ loaderData }: Route.ComponentProps) {
  const { user, posts, unreadCount } = loaderData;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">
            <span className="animated-gradient-text">Zajednica</span>
          </h1>
          <p className="text-text-secondary">
            Pitajte, diskutujte i povežite se sa drugim preduzetnicima
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-6"
        >
          <Link
            to="/community"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary/10 text-text-primary border border-border-subtle"
          >
            Forum
          </Link>
          <Link
            to="/community/messages"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-primary/5 border border-transparent hover:border-border-subtle transition-all relative"
          >
            Poruke
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
          <div className="flex-1" />
          <Link
            to="/community/new"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
          >
            + Nova objava
          </Link>
        </motion.div>

        {/* Post list */}
        {posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Još nema objava
            </h3>
            <p className="text-text-secondary mb-6">
              Budite prvi koji će pokrenuti diskusiju!
            </p>
            <Link
              to="/community/new"
              className="inline-block px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
            >
              Napišite prvu objavu
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/community/post/${post.id}`}
                  className="block glass rounded-xl p-5 hover:bg-primary/5 border border-border-subtle hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
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
                      <h3 className="text-base font-semibold text-text-primary group-hover:text-indigo-600 transition-colors truncate">
                        {post.title}
                      </h3>
                      <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-xs text-text-muted">
                        <span>
                          {post.authorName}{" "}
                          <span className="text-text-muted/60">
                            · {roleLabels[post.authorRole || "applicant"]}
                          </span>
                        </span>
                        <span>💬 {post.replyCount}</span>
                      </div>
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
