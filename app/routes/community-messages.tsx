import { Link } from "react-router";
import { motion } from "framer-motion";
import type { Route } from "./+types/community-messages";
import { requireUser } from "~/lib/session.server";
import { getConversations, getUnreadMessageCount } from "~/lib/db.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Poruke - MitroStart" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const conversations = getConversations(user.id);
  const unreadCount = getUnreadMessageCount(user.id);
  return { user, conversations, unreadCount };
}

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

export default function CommunityMessages({
  loaderData,
}: Route.ComponentProps) {
  const { user, conversations, unreadCount } = loaderData;

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
            Privatne poruke sa drugim korisnicima
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
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-text-secondary hover:text-text-primary hover:bg-primary/5 border border-transparent hover:border-border-subtle transition-all"
          >
            Forum
          </Link>
          <Link
            to="/community/messages"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary/10 text-text-primary border border-border-subtle relative"
          >
            Poruke
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        </motion.div>

        {/* Conversations */}
        {conversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <div className="text-4xl mb-4">📬</div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Nemate poruke
            </h3>
            <p className="text-text-secondary">
              Pošaljite poruku nekome sa foruma da započnete razgovor
            </p>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv, i) => (
              <motion.div
                key={conv.otherUserId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  to={`/community/messages/${conv.otherUserId}`}
                  className="flex items-center gap-4 glass rounded-xl p-4 hover:bg-primary/5 border border-border-subtle hover:border-primary/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                    {conv.otherUserName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-text-primary group-hover:text-indigo-600 transition-colors">
                        {conv.otherUserName}
                      </span>
                      <span className="text-xs text-text-muted">
                        {roleLabels[conv.otherUserRole]}
                      </span>
                      <span className="text-xs text-text-muted ml-auto shrink-0">
                        {timeAgo(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary truncate mt-0.5">
                      {conv.lastMessage}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
