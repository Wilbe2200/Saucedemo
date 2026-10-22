"use client";

import { useEffect, useRef, useState } from "react";
import { ensureStoreSession } from "@/lib/store-client";

interface ReferralInfo {
  code: string;
  url: string;
}

export function ReferralShare() {
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    async function loadReferral(): Promise<void> {
      try {
        await ensureStoreSession();
        const response = await fetch("/api/referrals", { cache: "no-store" });
        if (!response.ok) throw new Error("Could not load your referral link.");
        const info = await response.json() as ReferralInfo;
        if (active) setReferral(info);
      } catch (cause: unknown) {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load your referral link.");
      }
    }

    void loadReferral();
    return () => {
      active = false;
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  function showToast(message: string): void {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(""), 2800);
  }

  async function copyReferralLink(): Promise<void> {
    if (!referral) return;
    try {
      await navigator.clipboard.writeText(referral.url);
      showToast("Referral link copied.");
    } catch {
      showToast("Could not copy automatically. Select and copy the link above.");
    }
  }

  if (error) return <p role="alert">{error}</p>;
  if (!referral) return <p role="status">Preparing your referral link…</p>;

  const shareText = `Discover Sauce Demo with my referral code ${referral.code}`;
  const encodedUrl = encodeURIComponent(referral.url);
  const encodedText = encodeURIComponent(shareText);

  return (
    <div className="referral-panel">
      <p className="eyebrow">YOUR REFERRAL CODE</p>
      <p className="referral-code" aria-label={`Referral code ${referral.code}`}>{referral.code}</p>
      <label className="referral-link-label" htmlFor="referral-url">Your shareable link</label>
      <div className="referral-copy-row">
        <input id="referral-url" value={referral.url} readOnly onFocus={(event) => event.currentTarget.select()} />
        <button className="button button-dark" type="button" onClick={() => void copyReferralLink()}>Copy link</button>
      </div>
      <div className="referral-socials" aria-label="Share your referral">
        <a className="button button-outline" href={`https://wa.me/?text=${encodedText}%20${encodedUrl}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a className="button button-outline" href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer">Facebook</a>
        <a className="button button-outline" href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`} target="_blank" rel="noopener noreferrer">X / Twitter</a>
        <a className="button button-outline" href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`} target="_blank" rel="noopener noreferrer">Telegram</a>
      </div>
      <p className="referral-toast" role="status" aria-live="polite">{toast}</p>
    </div>
  );
}
