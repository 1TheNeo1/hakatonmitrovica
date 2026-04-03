import {
  Form,
  useActionData,
  useNavigation,
  useSearchParams,
} from "react-router";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import type { Route } from "./+types/verify";
import { verifyOtp, getUserByEmail, createOtp } from "~/lib/db.server";
import { getUserFromRequest, createUserSession } from "~/lib/session.server";
import { generateOtp, sendOtp } from "~/lib/auth.server";
import { redirect } from "react-router";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Verify Code - MitroStart" },
    { name: "description", content: "Enter your verification code" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserFromRequest(request);
  if (user) throw redirect("/dashboard");

  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  if (!email) throw redirect("/login");

  return { email };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  if (!email) {
    return { error: "Email is required" };
  }

  // Resend OTP
  if (intent === "resend") {
    const code = generateOtp();
    createOtp(email, code);
    await sendOtp(email, code);
    return { error: null, resent: true };
  }

  // Verify OTP
  const code = (formData.get("code") as string)?.trim();
  if (!code || code.length !== 6) {
    return { error: "Please enter a valid 6-digit code" };
  }

  const valid = verifyOtp(email, code);
  if (!valid) {
    return { error: "Invalid or expired code. Please try again." };
  }

  const user = getUserByEmail(email);
  if (!user) {
    return { error: "User not found. Please register first." };
  }

  return createUserSession(user.id, redirectTo);
}

export default function Verify({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const email = loaderData.email;
  const error = actionData?.error as string | undefined;
  const resent = (actionData as { resent?: boolean })?.resent;

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || "";
    }
    setDigits(newDigits);
    const nextEmpty = newDigits.findIndex((d) => !d);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const code = digits.join("");

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass text-xs font-medium text-secondary uppercase tracking-widest">
            Verification
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Check Your Email
          </h1>
          <p className="text-text-secondary">
            We sent a 6-digit code to{" "}
            <span className="text-text-primary font-medium">{email}</span>
          </p>
        </div>

        <Form method="post" className="glass rounded-2xl p-6 space-y-5">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <input type="hidden" name="code" value={code} />

          {/* OTP Input Grid */}
          <div className="flex gap-3 justify-center" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-white/5 border border-border-subtle focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
              />
            ))}
          </div>

          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {resent && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-400">
              A new code has been sent to your email.
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            disabled={code.length !== 6}
            className="w-full py-4 text-base"
          >
            {isSubmitting ? "Verifying..." : "Verify Code"}
          </Button>

          {/* Resend button */}
          <div className="text-center">
            <button
              type="submit"
              name="intent"
              value="resend"
              className="text-sm text-text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              Didn't receive a code?{" "}
              <span className="font-medium text-primary">Resend</span>
            </button>
          </div>
        </Form>
      </motion.div>
    </div>
  );
}
