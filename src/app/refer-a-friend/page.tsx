import { ReferralShare } from "@/components/ReferralShare";

export default function ReferPage() {
  return (
    <article className="text-page referral-page">
      <p className="eyebrow">SHARE THE SAUCE</p>
      <h1>Refer a friend</h1>
      <p>Good finds are better when shared. Send your personal link to a friend and discover the collection together.</p>
      <ReferralShare />
    </article>
  );
}
