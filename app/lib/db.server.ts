import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import { dirname } from "path";
import crypto from "crypto";

const DB_PATH = process.env.DATABASE_PATH || "./data/mitrostart.db";
mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','investor','applicant')),
    organization TEXT,
    investmentFocus TEXT,
    investmentMin INTEGER,
    investmentMax INTEGER,
    bio TEXT,
    linkedinUrl TEXT,
    phone TEXT,
    city TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS otp_codes (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expiresAt TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES users(id),
    expiresAt TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS ideas (
    id TEXT PRIMARY KEY,
    applicantId TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    fundingNeeded INTEGER NOT NULL,
    stage TEXT NOT NULL CHECK(stage IN ('concept','prototype','early-revenue','scaling')),
    targetMarket TEXT NOT NULL,
    teamSize INTEGER NOT NULL DEFAULT 1,
    problemSolved TEXT,
    competitiveAdvantage TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','reviewed','contacted','funded','rejected')),
    adminNotes TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS investor_interests (
    id TEXT PRIMARY KEY,
    investorId TEXT NOT NULL REFERENCES users(id),
    ideaId TEXT NOT NULL REFERENCES ideas(id),
    note TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(investorId, ideaId)
  );

  CREATE TABLE IF NOT EXISTS forum_posts (
    id TEXT PRIMARY KEY,
    authorId TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('pitanje','diskusija','resurs','objava')),
    replyCount INTEGER NOT NULL DEFAULT 0,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS forum_replies (
    id TEXT PRIMARY KEY,
    postId TEXT NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
    authorId TEXT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    senderId TEXT NOT NULL REFERENCES users(id),
    receiverId TEXT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    readAt TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS tutorials (
    id TEXT PRIMARY KEY,
    authorId TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    body TEXT,
    type TEXT NOT NULL CHECK(type IN ('blog','video','resource')),
    category TEXT NOT NULL,
    videoUrl TEXT,
    resourceUrl TEXT,
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Seed admin user if ADMIN_EMAIL is set and no admin exists
const adminEmail = process.env.ADMIN_EMAIL;
if (adminEmail) {
  const existingAdmin = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
  if (!existingAdmin) {
    db.prepare(
      "INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, 'admin')"
    ).run(crypto.randomUUID(), adminEmail, "Admin");
    console.log(`[MitroStart] Admin user seeded with email: ${adminEmail}`);
  }
}

// --- User helpers ---

export function getUserByEmail(email: string) {
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
    | import("./types").User
    | undefined;
}

export function getUserById(id: string) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
    | import("./types").User
    | undefined;
}

export function createUser(data: {
  email: string;
  name: string;
  role: string;
  organization?: string;
  investmentFocus?: string;
  investmentMin?: number;
  investmentMax?: number;
  bio?: string;
  linkedinUrl?: string;
  phone?: string;
  city?: string;
}) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO users (id, email, name, role, organization, investmentFocus, investmentMin, investmentMax, bio, linkedinUrl, phone, city)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.email,
    data.name,
    data.role,
    data.organization || null,
    data.investmentFocus || null,
    data.investmentMin || null,
    data.investmentMax || null,
    data.bio || null,
    data.linkedinUrl || null,
    data.phone || null,
    data.city || null
  );
  return id;
}

export function getAllUsers() {
  return db.prepare("SELECT * FROM users ORDER BY createdAt DESC").all() as import("./types").User[];
}

// --- OTP helpers ---

export function createOtp(email: string, code: string) {
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  db.prepare(
    "INSERT INTO otp_codes (id, email, code, expiresAt) VALUES (?, ?, ?, ?)"
  ).run(id, email, code, expiresAt);
  return id;
}

export function verifyOtp(email: string, code: string): boolean {
  const otp = db
    .prepare(
      "SELECT * FROM otp_codes WHERE email = ? AND code = ? AND used = 0 AND expiresAt > datetime('now') ORDER BY createdAt DESC LIMIT 1"
    )
    .get(email, code) as { id: string } | undefined;

  if (!otp) return false;

  db.prepare("UPDATE otp_codes SET used = 1 WHERE id = ?").run(otp.id);
  return true;
}

// --- Session helpers ---

export function createDbSession(userId: string) {
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  db.prepare(
    "INSERT INTO sessions (id, userId, expiresAt) VALUES (?, ?, ?)"
  ).run(id, userId, expiresAt);
  return id;
}

export function getDbSession(sessionId: string) {
  return db
    .prepare(
      "SELECT * FROM sessions WHERE id = ? AND expiresAt > datetime('now')"
    )
    .get(sessionId) as { id: string; userId: string } | undefined;
}

export function deleteDbSession(sessionId: string) {
  db.prepare("DELETE FROM sessions WHERE id = ?").run(sessionId);
}

// --- Idea helpers ---

export function createIdea(data: {
  applicantId: string;
  title: string;
  description: string;
  category: string;
  fundingNeeded: number;
  stage: string;
  targetMarket: string;
  teamSize: number;
  problemSolved?: string;
  competitiveAdvantage?: string;
}) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO ideas (id, applicantId, title, description, category, fundingNeeded, stage, targetMarket, teamSize, problemSolved, competitiveAdvantage)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.applicantId,
    data.title,
    data.description,
    data.category,
    data.fundingNeeded,
    data.stage,
    data.targetMarket,
    data.teamSize,
    data.problemSolved || null,
    data.competitiveAdvantage || null
  );
  return id;
}

export function getIdeasByApplicant(applicantId: string) {
  return db
    .prepare("SELECT * FROM ideas WHERE applicantId = ? ORDER BY createdAt DESC")
    .all(applicantId) as import("./types").Idea[];
}

export function getAllIdeas() {
  return db
    .prepare(`
      SELECT ideas.*, users.name as applicantName, users.email as applicantEmail
      FROM ideas
      LEFT JOIN users ON ideas.applicantId = users.id
      ORDER BY ideas.createdAt DESC
    `)
    .all() as import("./types").Idea[];
}

export function getIdeaById(id: string) {
  return db
    .prepare(`
      SELECT ideas.*, users.name as applicantName, users.email as applicantEmail
      FROM ideas
      LEFT JOIN users ON ideas.applicantId = users.id
      WHERE ideas.id = ?
    `)
    .get(id) as import("./types").Idea | undefined;
}

export function getIdeasByIds(ids: string[]) {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(", ");
  return db
    .prepare(`
      SELECT ideas.*, users.name as applicantName, users.email as applicantEmail
      FROM ideas
      LEFT JOIN users ON ideas.applicantId = users.id
      WHERE ideas.id IN (${placeholders})
    `)
    .all(...ids) as import("./types").Idea[];
}

export function updateIdeaStatus(id: string, status: string) {
  db.prepare(
    "UPDATE ideas SET status = ?, updatedAt = datetime('now') WHERE id = ?"
  ).run(status, id);
}

// --- Investor interest helpers ---

export function expressInterest(investorId: string, ideaId: string, note?: string) {
  const id = crypto.randomUUID();
  db.prepare(
    "INSERT OR IGNORE INTO investor_interests (id, investorId, ideaId, note) VALUES (?, ?, ?, ?)"
  ).run(id, investorId, ideaId, note || null);
}

export function removeInterest(investorId: string, ideaId: string) {
  db.prepare(
    "DELETE FROM investor_interests WHERE investorId = ? AND ideaId = ?"
  ).run(investorId, ideaId);
}

export function getInvestorInterests(investorId: string) {
  return db
    .prepare(
      "SELECT ideaId FROM investor_interests WHERE investorId = ?"
    )
    .all(investorId) as { ideaId: string }[];
}

export function getIdeaInterestCount(ideaId: string) {
  const row = db
    .prepare("SELECT COUNT(*) as count FROM investor_interests WHERE ideaId = ?")
    .get(ideaId) as { count: number };
  return row.count;
}

export function getStats() {
  const users = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
  const ideas = db.prepare("SELECT COUNT(*) as count FROM ideas").get() as { count: number };
  const pending = db.prepare("SELECT COUNT(*) as count FROM ideas WHERE status = 'pending'").get() as { count: number };
  const funded = db.prepare("SELECT COUNT(*) as count FROM ideas WHERE status = 'funded'").get() as { count: number };
  return {
    totalUsers: users.count,
    totalIdeas: ideas.count,
    pendingIdeas: pending.count,
    fundedIdeas: funded.count,
  };
}

// --- Forum helpers ---

export function createForumPost(data: {
  authorId: string;
  title: string;
  content: string;
  category: string;
}) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO forum_posts (id, authorId, title, content, category)
    VALUES (?, ?, ?, ?, ?)
  `).run(id, data.authorId, data.title, data.content, data.category);
  return id;
}

export function getAllForumPosts() {
  return db.prepare(`
    SELECT forum_posts.*, users.name as authorName, users.role as authorRole
    FROM forum_posts
    LEFT JOIN users ON forum_posts.authorId = users.id
    ORDER BY forum_posts.createdAt DESC
  `).all() as import("./types").ForumPost[];
}

export function getForumPostById(id: string) {
  return db.prepare(`
    SELECT forum_posts.*, users.name as authorName, users.role as authorRole
    FROM forum_posts
    LEFT JOIN users ON forum_posts.authorId = users.id
    WHERE forum_posts.id = ?
  `).get(id) as import("./types").ForumPost | undefined;
}

export function getForumReplies(postId: string) {
  return db.prepare(`
    SELECT forum_replies.*, users.name as authorName, users.role as authorRole
    FROM forum_replies
    LEFT JOIN users ON forum_replies.authorId = users.id
    WHERE forum_replies.postId = ?
    ORDER BY forum_replies.createdAt ASC
  `).all(postId) as import("./types").ForumReply[];
}

const createForumReplyTx = db.transaction((data: {
  postId: string;
  authorId: string;
  content: string;
}) => {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO forum_replies (id, postId, authorId, content)
    VALUES (?, ?, ?, ?)
  `).run(id, data.postId, data.authorId, data.content);
  db.prepare(`
    UPDATE forum_posts SET replyCount = replyCount + 1, updatedAt = datetime('now') WHERE id = ?
  `).run(data.postId);
  return id;
});

export function createForumReply(data: {
  postId: string;
  authorId: string;
  content: string;
}) {
  return createForumReplyTx(data);
}

export function deleteForumPost(id: string, authorId: string) {
  db.prepare("DELETE FROM forum_replies WHERE postId = ?").run(id);
  db.prepare("DELETE FROM forum_posts WHERE id = ? AND authorId = ?").run(id, authorId);
}

// --- Message helpers ---

export function sendMessage(data: {
  senderId: string;
  receiverId: string;
  content: string;
}) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO messages (id, senderId, receiverId, content)
    VALUES (?, ?, ?, ?)
  `).run(id, data.senderId, data.receiverId, data.content);
  return id;
}

export function getConversations(userId: string) {
  return db.prepare(`
    WITH ranked AS (
      SELECT *,
        CASE WHEN senderId = ? THEN receiverId ELSE senderId END as otherUserId,
        ROW_NUMBER() OVER (
          PARTITION BY CASE WHEN senderId = ? THEN receiverId ELSE senderId END
          ORDER BY createdAt DESC
        ) as rn
      FROM messages
      WHERE senderId = ? OR receiverId = ?
    )
    SELECT
      ranked.otherUserId,
      u.name as otherUserName,
      u.role as otherUserRole,
      ranked.content as lastMessage,
      ranked.createdAt as lastMessageAt,
      (SELECT COUNT(*) FROM messages m2
       WHERE m2.senderId = ranked.otherUserId
       AND m2.receiverId = ? AND m2.readAt IS NULL) as unreadCount
    FROM ranked
    JOIN users u ON u.id = ranked.otherUserId
    WHERE ranked.rn = 1
    ORDER BY ranked.createdAt DESC
  `).all(userId, userId, userId, userId, userId) as import("./types").Conversation[];
}

export function getThread(userId: string, otherUserId: string) {
  // Mark unread messages from other user as read
  db.prepare(`
    UPDATE messages SET readAt = datetime('now')
    WHERE senderId = ? AND receiverId = ? AND readAt IS NULL
  `).run(otherUserId, userId);

  return db.prepare(`
    SELECT messages.*, users.name as senderName
    FROM messages
    LEFT JOIN users ON messages.senderId = users.id
    WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
    ORDER BY messages.createdAt ASC
  `).all(userId, otherUserId, otherUserId, userId) as import("./types").Message[];
}

export function getUnreadMessageCount(userId: string) {
  const row = db.prepare(
    "SELECT COUNT(*) as count FROM messages WHERE receiverId = ? AND readAt IS NULL"
  ).get(userId) as { count: number };
  return row.count;
}

// --- Tutorial helpers ---

export function createTutorial(data: {
  authorId: string;
  title: string;
  summary: string;
  body?: string;
  type: string;
  category: string;
  videoUrl?: string;
  resourceUrl?: string;
}) {
  const id = crypto.randomUUID();
  db.prepare(`
    INSERT INTO tutorials (id, authorId, title, summary, body, type, category, videoUrl, resourceUrl)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.authorId,
    data.title,
    data.summary,
    data.body || null,
    data.type,
    data.category,
    data.videoUrl || null,
    data.resourceUrl || null
  );
  return id;
}

export function getAllTutorials() {
  return db
    .prepare(`
      SELECT tutorials.*, users.name as authorName
      FROM tutorials
      LEFT JOIN users ON tutorials.authorId = users.id
      ORDER BY tutorials.createdAt DESC
    `)
    .all() as import("./types").Tutorial[];
}

export function getTutorialById(id: string) {
  return db
    .prepare(`
      SELECT tutorials.*, users.name as authorName
      FROM tutorials
      LEFT JOIN users ON tutorials.authorId = users.id
      WHERE tutorials.id = ?
    `)
    .get(id) as import("./types").Tutorial | undefined;
}

export function deleteTutorial(id: string) {
  db.prepare("DELETE FROM tutorials WHERE id = ?").run(id);
}

export default db;
