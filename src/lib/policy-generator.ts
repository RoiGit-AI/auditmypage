import Anthropic from "@anthropic-ai/sdk";

export interface PolicyFormData {
  // Step 1: Business
  businessName: string;
  websiteUrl: string;
  businessType: string;
  country: string;
  contactEmail: string;
  // Step 2: Platform
  platforms: string[];
  mobileOs?: string[];
  // Step 3: Data collection
  dataTypes: string[];
  collectionMethods: string[];
  purposes: string[];
  // Step 4: Third parties
  analytics: string[];
  paymentProcessors: string[];
  emailMarketing: string[];
  advertising: string[];
  socialLogin: string[];
  hosting: string[];
  // Step 5: Compliance
  servesEu: boolean;
  servesCalifornia: boolean;
  servesUk: boolean;
  servesChildren: boolean;
  sellsData: boolean;
  allowsDeletion: boolean;
  changeNotification: string;
}

let _client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_client) _client = new Anthropic();
  return _client;
}

export async function generatePolicy(formData: PolicyFormData): Promise<{ markdown: string; html: string }> {
  const prompt = buildPrompt(formData);

  const message = await getClient().messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
  });

  const markdown =
    message.content[0].type === "text" ? message.content[0].text : "";

  const html = markdownToHtml(markdown);

  return { markdown, html };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function generatePreview(formData: PolicyFormData): string {
  const name = escapeHtml(formData.businessName || "Your Company");
  const url = escapeHtml(formData.websiteUrl || "your-website.com");

  return `# Privacy Policy for ${name}

**Effective Date:** ${new Date().toISOString().split("T")[0]}

**Website:** ${url}

This Privacy Policy describes how ${name} ("we," "us," or "our") collects, uses, and shares your personal information when you visit or use our services at ${url}.

We are committed to protecting your privacy and handling your data with transparency and care. This policy explains what data we collect, why we collect it, and your rights regarding your personal information.

---

*This is a preview. Claim the full privacy policy (free during launch) to see all sections including data collection details, third-party disclosures, ${formData.servesEu ? "GDPR compliance, " : ""}${formData.servesCalifornia ? "CCPA/CPRA rights, " : ""}user rights, and more.*`;
}

function buildPrompt(formData: PolicyFormData): string {
  const jurisdictions: string[] = [];
  if (formData.servesEu) jurisdictions.push("GDPR (EU/EEA)");
  if (formData.servesCalifornia) jurisdictions.push("CCPA/CPRA (California)");
  if (formData.servesUk) jurisdictions.push("UK GDPR");
  if (formData.servesChildren) jurisdictions.push("COPPA (children under 13)");

  return `Generate a professional Privacy Policy in Markdown format for the following business. Write in clear, professional language — not dense legalese, but legally sound. Include all relevant sections based on the data provided.

## Business Details
- Business name: ${formData.businessName}
- Website: ${formData.websiteUrl}
- Business type: ${formData.businessType}
- Country: ${formData.country}
- Contact email: ${formData.contactEmail}

## Platforms
${formData.platforms.join(", ")}${formData.mobileOs?.length ? ` (Mobile: ${formData.mobileOs.join(", ")})` : ""}

## Personal Data Collected
${formData.dataTypes.join(", ")}

## How Data Is Collected
${formData.collectionMethods.join(", ")}

## Purposes of Data Collection
${formData.purposes.join(", ")}

## Third-Party Services Used
- Analytics: ${formData.analytics.join(", ") || "None"}
- Payment processors: ${formData.paymentProcessors.join(", ") || "None"}
- Email marketing: ${formData.emailMarketing.join(", ") || "None"}
- Advertising: ${formData.advertising.join(", ") || "None"}
- Social login: ${formData.socialLogin.join(", ") || "None"}
- Hosting: ${formData.hosting.join(", ") || "None"}

## Applicable Jurisdictions
${jurisdictions.join(", ") || "General (no specific jurisdiction selected)"}

## Additional Details
- Sells personal data: ${formData.sellsData ? "Yes" : "No"}
- Users can request data deletion: ${formData.allowsDeletion ? "Yes" : "No"}
- Policy change notification method: ${formData.changeNotification}

## Requirements
1. Start with a clear "Privacy Policy" heading and effective date
2. Include a table of contents
3. Name specific third-party services (e.g., "Google Analytics" not "analytics providers")
4. ${formData.servesEu ? "Include a full GDPR section covering lawful basis, data subject rights (access, rectification, erasure, portability, objection), DPO contact if applicable, and international transfer mechanisms" : ""}
5. ${formData.servesCalifornia ? "Include a full CCPA/CPRA section covering categories of personal information, right to know, right to delete, right to opt-out of sale, non-discrimination, and how to exercise rights" : ""}
6. ${formData.servesChildren ? "Include COPPA compliance section" : ""}
7. Include sections for: data retention, data security measures, cookies and tracking, user rights and choices, contact information
8. End with this disclaimer: "This privacy policy was generated using AI-powered tools and is provided for informational purposes only. It does not constitute legal advice. We recommend consulting a qualified attorney to ensure your privacy policy meets all applicable legal requirements for your specific jurisdiction and business practices."
9. Use today's date as the effective date: ${new Date().toISOString().split("T")[0]}

Output only the Markdown content, nothing else.`;
}

export function generatePolicyStream(formData: PolicyFormData): ReadableStream<string> {
  const prompt = buildPrompt(formData);

  return new ReadableStream<string>({
    async start(controller) {
      try {
        const stream = getClient().messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 4000,
          messages: [{ role: "user", content: prompt }],
        });

        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(event.delta.text);
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

export function markdownToHtml(md: string): string {
  // Basic markdown to HTML conversion for the policy document
  let html = md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/^(\d+)\. (.+)$/gm, "<li>$2</li>")
    .replace(/\n{2,}/g, "\n</p>\n<p>\n")
    .replace(/^(?!<[hluop])/gm, "");

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; color: #1a1a1a; }
    h1 { font-size: 1.8rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }
    h2 { font-size: 1.4rem; margin-top: 2rem; }
    h3 { font-size: 1.1rem; margin-top: 1.5rem; }
    ul { padding-left: 1.5rem; }
    li { margin-bottom: 0.25rem; }
    blockquote { border-left: 3px solid #d1d5db; padding-left: 1rem; color: #6b7280; font-style: italic; }
  </style>
</head>
<body>
${html}
</body>
</html>`;
}
