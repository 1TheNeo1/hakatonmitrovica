import {
  Form,
  useActionData,
  useNavigation,
  useSearchParams,
} from "react-router";
import { motion } from "framer-motion";
import type { Route } from "./+types/login";
import { getUserByEmail, createOtp } from "~/lib/db.server";
import { generateOtp, sendOtp } from "~/lib/auth.server";
import { getUserFromRequest } from "~/lib/session.server";
import { redirect } from "react-router";
import { Button } from "~/components/ui/button";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Prijava - MitroStart" },
    { name: "description", content: "Prijavite se na vaš MitroStart nalog" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserFromRequest(request);
  if (user) throw redirect("/dashboard");
  return null;
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  if (!email) {
    return { error: "Email je obavezan" };
  }

  const user = getUserByEmail(email);
  if (!user) {
    return {
      error: "Nije pronađen nalog sa ovim emailom. Molimo registrujte se.",
    };
  }

  const code = generateOtp();
  createOtp(email, code);
  await sendOtp(email, code);

  throw redirect(
    `/verify?email=${encodeURIComponent(email)}&redirect=${encodeURIComponent(redirectTo)}`,
  );
}

export default function Login({ actionData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const error = actionData?.error as string | undefined;

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full glass text-xs font-medium text-secondary uppercase tracking-widest">
            Prijava
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            Dobrodošli nazad
          </h1>
          <p className="text-text-secondary">
            Unesite email da biste primili kod za prijavu
          </p>
        </div>

        <Form method="post" className="glass rounded-2xl p-6 space-y-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email adresa
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              placeholder="vas@email.com"
              className="w-full rounded-xl bg-white/60 border border-border-subtle px-4 py-3 text-sm placeholder:text-text-secondary/50 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-all"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-300 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="w-full py-4 text-base"
          >
            {isSubmitting ? "Slanje koda..." : "Pošalji kod za prijavu"}
          </Button>

          <p className="text-center text-sm text-text-secondary">
            Nemate nalog?{" "}
            <a
              href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-primary hover:text-primary-light transition-colors font-medium"
            >
              Registrujte se
            </a>
          </p>
        </Form>
      </motion.div>
    </div>
  );
}
