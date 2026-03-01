import { PolicyWizard } from "@/components/PolicyWizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Privacy Policy Generator — $19, No Subscription | AuditMyPage",
  description:
    "Generate a custom AI-written privacy policy in 2 minutes. Covers GDPR, CCPA, and more. $19 one-time — no subscription, no lock-in. 10x cheaper than Termly.",
};

export default function PrivacyPolicyGeneratorPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">AI Privacy Policy Generator</h1>
        <p className="mt-2 text-gray-400">
          Answer a few questions, get a custom privacy policy. AI-generated, not
          template fill-in-the-blank.
        </p>
        <p className="mt-1 text-sm text-gray-500">
          $19 one-time — no subscription. Covers GDPR, CCPA, and more.
        </p>
      </div>
      <PolicyWizard />
    </div>
  );
}
