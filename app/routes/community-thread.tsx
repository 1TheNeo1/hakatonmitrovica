import { Link, useFetcher } from "react-router";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import type { Route } from "./+types/community-thread";
import { requireUser } from "~/lib/session.server";
import { getThread, getUserById, sendMessage } from "~/lib/db.server";

export function meta({ data }: Route.MetaArgs) {
  const name = data?.otherUser?.name || "Poruke";
  return [{ title: `${name} - Poruke - MitroStart` }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await requireUser(request);
  const otherUser = getUserById(params.userId);
  if (!otherUser) throw new Response("Korisnik nije pronađen", { status: 404 });
  const messages = getThread(user.id, params.userId);
  return { user, otherUser, messages };
}

export async function action({ request, params }: Route.ActionArgs) {
  const user = await requireUser(request);
  const formData = await request.formData();
  const content = (formData.get("content") as string)?.trim();
  if (!content) return { error: "Poruka ne može biti prazna" };
  sendMessage({ senderId: user.id, receiverId: params.userId, content });
  return { error: null };
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

export default function CommunityThread({
  loaderData,
}: Route.ComponentProps) {
  const { user, otherUser, messages } = loaderData;
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Clear form after successful submission
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !fetcher.data.error) {
      formRef.current?.reset();
    }
  }, [fetcher.state, fetcher.data]);

  // Scroll to bottom on load and new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-3xl mx-auto flex flex-col" style={{ height: "calc(100vh - 10rem)" }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6 shrink-0"
        >
          <Link
            to="/community/messages"
            className="text-text-muted hover:text-text-secondary transition-colors"
          >
            ←
          </Link>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
            {otherUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {otherUser.name}
            </h2>
            <span className="text-xs text-text-muted">
              {roleLabels[otherUser.role]}
            </span>
          </div>
        </motion.div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto glass rounded-2xl border border-border-subtle p-4 mb-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-text-muted text-sm">
              Započnite razgovor sa {otherUser.name}
            </div>
          ) : (
            messages.map((msg, i) => {
              const isSent = msg.senderId === user.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.5) }}
                  className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isSent
                        ? "bg-indigo-100 border border-indigo-200 text-text-primary"
                        : "bg-white/70 border border-border-subtle text-text-secondary"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isSent ? "text-indigo-400/70" : "text-text-muted/50"
                      }`}
                    >
                      {timeAgo(msg.createdAt)}
                    </p>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send form */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="shrink-0"
        >
          <fetcher.Form
            method="post"
            ref={formRef}
            className="flex items-center gap-3"
          >
            <input
              name="content"
              required
              placeholder="Napišite poruku..."
              autoComplete="off"
              className="flex-1 px-4 py-3 rounded-xl bg-white/60 border border-border-subtle focus:border-indigo-400/50 focus:outline-none text-text-primary placeholder-text-muted text-sm transition-colors"
            />
            <button
              type="submit"
              disabled={fetcher.state === "submitting"}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {fetcher.state === "submitting" ? "..." : "Pošalji"}
            </button>
          </fetcher.Form>
        </motion.div>
      </div>
    </div>
  );
}
