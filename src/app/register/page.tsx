import Link from "next/link";
import { AuthForm } from "@/components/AuthForm";

export default function RegisterPage() {
  return <section className="auth-page"><p className="eyebrow">JOIN THE COMMUNITY</p><h1>Create account</h1><AuthForm mode="register" /><p>Already have an account? <Link href="/login">Log in</Link></p></section>;
}
