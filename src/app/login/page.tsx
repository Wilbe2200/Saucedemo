import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function LoginPage() {
  return <section className="auth-page"><p className="eyebrow">WELCOME BACK</p><h1>Log in</h1><AuthForm mode="login" /><p>New here? <Link href="/register">Create an account</Link></p></section>;
}
