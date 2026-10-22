"use client";

import { FormEvent, useState } from "react";
import { dispatchStoreEvent } from "@/lib/store-client";

/** Envía credenciales de registro o acceso y comunica errores al usuario. */
export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Unable to complete the request.");
        return;
      }
      setSuccess(mode === "register" ? "Your account has been created. You can now log in." : "You are now logged in.");
      if (mode === "login") {
        dispatchStoreEvent("sauce-cart-updated");
        dispatchStoreEvent("sauce-wishlist-updated");
      }
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : "Unable to complete the request.");
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label htmlFor="email">Email address</label>
      <input id="email" name="email" type="email" autoComplete="email" required maxLength={254} />
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={8} maxLength={100} />
      <button className="button button-dark" type="submit">{mode === "login" ? "Log in" : "Create account"}</button>
      <p role="status" aria-live="polite">{error || success}</p>
    </form>
  );
}
