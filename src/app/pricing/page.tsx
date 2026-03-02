import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — AuditMyPage",
  description:
    "Free SEO audit tool. AI privacy policy generator — free during launch (normally $19). No subscriptions, no lock-in.",
};

export default function PricingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold text-center">Simple pricing</h1>
      <p className="text-gray-400 text-center mt-2">
        No subscriptions. No hidden fees. Pay once, own it forever.
      </p>

      <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-3xl mx-auto">
        {/* Free Tier */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold">SEO Audit</h2>
          <p className="text-3xl font-bold mt-2">
            Free<span className="text-sm font-normal text-gray-400"> forever</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-green-400">✓</span> SEO score (0-100)
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span> 15+ checks (title, meta, OG, etc.)
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span> Social media previews
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span> Shareable result URLs
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span> No signup required
            </li>
          </ul>
          <a
            href="/"
            className="block mt-6 text-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
          >
            Start auditing
          </a>
        </div>

        {/* Privacy Policy */}
        <div className="bg-gray-900 border border-green-800 rounded-xl p-6 relative">
          <div className="absolute -top-3 right-4 px-2 py-0.5 bg-green-600 text-xs font-medium rounded-full">
            Launch promotion
          </div>
          <h2 className="text-xl font-semibold">Privacy Policy</h2>
          <p className="text-3xl font-bold mt-2">
            Free <span className="text-sm font-normal text-gray-500 line-through">$19</span>
          </p>
          <ul className="mt-6 space-y-3 text-sm text-gray-300">
            <li className="flex gap-2">
              <span className="text-green-400">✓</span> AI-generated (not template)
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span> GDPR, CCPA, UK GDPR, COPPA
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span> Names your specific services
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span> HTML + Markdown + plain text
            </li>
            <li className="flex gap-2">
              <span className="text-green-400">✓</span> No subscription, no lock-in
            </li>
          </ul>
          <a
            href="/privacy-policy-generator"
            className="block mt-6 text-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm font-medium"
          >
            Generate now — Free
          </a>
        </div>
      </div>

      {/* Comparison */}
      <div className="mt-16 max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold text-center mb-6">
          vs. the competition
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left py-3 pr-4">Feature</th>
                <th className="text-center py-3 px-4">AuditMyPage</th>
                <th className="text-center py-3 px-4">Termly</th>
                <th className="text-center py-3 px-4">TermsFeed</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4">Price</td>
                <td className="text-center py-3 px-4 text-green-400 font-medium">
                  <span className="line-through text-gray-500">$19</span> Free
                </td>
                <td className="text-center py-3 px-4">$168-240/yr</td>
                <td className="text-center py-3 px-4">$56-140</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4">AI-generated</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">❌ Template</td>
                <td className="text-center py-3 px-4">❌ Template</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4">Subscription</td>
                <td className="text-center py-3 px-4 text-green-400">No</td>
                <td className="text-center py-3 px-4 text-red-400">Yes</td>
                <td className="text-center py-3 px-4">No</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4">SEO audit included</td>
                <td className="text-center py-3 px-4">✅ Free</td>
                <td className="text-center py-3 px-4">❌</td>
                <td className="text-center py-3 px-4">❌</td>
              </tr>
              <tr className="border-b border-gray-800/50">
                <td className="py-3 pr-4">Flat pricing</td>
                <td className="text-center py-3 px-4">✅</td>
                <td className="text-center py-3 px-4">❌ Per site</td>
                <td className="text-center py-3 px-4">❌ Per clause</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
