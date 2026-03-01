"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface FormState {
  businessName: string;
  websiteUrl: string;
  businessType: string;
  country: string;
  contactEmail: string;
  platforms: string[];
  mobileOs: string[];
  dataTypes: string[];
  collectionMethods: string[];
  purposes: string[];
  analytics: string[];
  paymentProcessors: string[];
  emailMarketing: string[];
  advertising: string[];
  socialLogin: string[];
  hosting: string[];
  servesEu: boolean;
  servesCalifornia: boolean;
  servesUk: boolean;
  servesChildren: boolean;
  sellsData: boolean;
  allowsDeletion: boolean;
  changeNotification: string;
}

const initialState: FormState = {
  businessName: "",
  websiteUrl: "",
  businessType: "",
  country: "",
  contactEmail: "",
  platforms: [],
  mobileOs: [],
  dataTypes: [],
  collectionMethods: [],
  purposes: [],
  analytics: [],
  paymentProcessors: [],
  emailMarketing: [],
  advertising: [],
  socialLogin: [],
  hosting: [],
  servesEu: false,
  servesCalifornia: false,
  servesUk: false,
  servesChildren: false,
  sellsData: false,
  allowsDeletion: true,
  changeNotification: "Both",
};

export function PolicyWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const totalSteps = 5;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayItem(key: keyof FormState, item: string) {
    setForm((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(item)
          ? arr.filter((i) => i !== item)
          : [...arr, item],
      };
    });
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate-policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/privacy-policy/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex gap-1 mb-8">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < step ? "bg-blue-500" : "bg-gray-800"
            }`}
          />
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        {step === 1 && (
          <StepBusiness form={form} updateField={updateField} />
        )}
        {step === 2 && (
          <StepPlatform
            form={form}
            toggleArrayItem={toggleArrayItem}
          />
        )}
        {step === 3 && (
          <StepData
            form={form}
            toggleArrayItem={toggleArrayItem}
          />
        )}
        {step === 4 && (
          <StepThirdParties
            form={form}
            toggleArrayItem={toggleArrayItem}
          />
        )}
        {step === 5 && (
          <StepCompliance form={form} updateField={updateField} />
        )}

        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            ← Back
          </button>
          {step < totalSteps ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 transition-colors"
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || !form.businessName || !form.websiteUrl}
              className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
            >
              {loading ? "Generating..." : "Generate Preview"}
            </button>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-600 mt-4">
        Step {step} of {totalSteps}
      </p>
    </div>
  );
}

/* ----- Step Components ----- */

function StepBusiness({
  form,
  updateField,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Business</h2>
      <Input
        label="Business name"
        value={form.businessName}
        onChange={(v) => updateField("businessName", v)}
        placeholder="Acme Inc."
      />
      <Input
        label="Website URL"
        value={form.websiteUrl}
        onChange={(v) => updateField("websiteUrl", v)}
        placeholder="https://example.com"
      />
      <Select
        label="Business type"
        value={form.businessType}
        onChange={(v) => updateField("businessType", v)}
        options={[
          "Individual / Sole Proprietor",
          "LLC",
          "Corporation",
          "Non-profit",
          "Other",
        ]}
      />
      <Select
        label="Country"
        value={form.country}
        onChange={(v) => updateField("country", v)}
        options={[
          "United States",
          "United Kingdom",
          "Germany",
          "France",
          "Canada",
          "Australia",
          "Netherlands",
          "Spain",
          "Italy",
          "Brazil",
          "India",
          "Other",
        ]}
      />
      <Input
        label="Privacy contact email"
        value={form.contactEmail}
        onChange={(v) => updateField("contactEmail", v)}
        placeholder="privacy@example.com"
      />
    </div>
  );
}

function StepPlatform({
  form,
  toggleArrayItem,
}: {
  form: FormState;
  toggleArrayItem: (k: keyof FormState, v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Platform</h2>
      <p className="text-sm text-gray-400">
        Where will this privacy policy apply?
      </p>
      <CheckboxGroup
        items={["Website", "Mobile App", "Desktop App", "SaaS / Web App"]}
        selected={form.platforms}
        onToggle={(v) => toggleArrayItem("platforms", v)}
      />
      {form.platforms.includes("Mobile App") && (
        <>
          <p className="text-sm text-gray-400 mt-4">Which mobile platforms?</p>
          <CheckboxGroup
            items={["iOS", "Android"]}
            selected={form.mobileOs}
            onToggle={(v) => toggleArrayItem("mobileOs", v)}
          />
        </>
      )}
    </div>
  );
}

function StepData({
  form,
  toggleArrayItem,
}: {
  form: FormState;
  toggleArrayItem: (k: keyof FormState, v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Data You Collect</h2>
        <p className="text-sm text-gray-400 mt-1">
          What personal data does your service collect?
        </p>
        <CheckboxGroup
          items={[
            "Name",
            "Email address",
            "Phone number",
            "Mailing address",
            "Payment / billing info",
            "IP address / device info",
            "Location data",
            "Cookies / tracking data",
            "User-generated content",
            "Account credentials",
          ]}
          selected={form.dataTypes}
          onToggle={(v) => toggleArrayItem("dataTypes", v)}
        />
      </div>
      <div>
        <p className="text-sm text-gray-400">How is data collected?</p>
        <CheckboxGroup
          items={[
            "User-submitted forms",
            "Automatically via cookies/scripts",
            "Third-party integrations",
          ]}
          selected={form.collectionMethods}
          onToggle={(v) => toggleArrayItem("collectionMethods", v)}
        />
      </div>
      <div>
        <p className="text-sm text-gray-400">Why do you collect this data?</p>
        <CheckboxGroup
          items={[
            "Provide the service",
            "Process payments",
            "Marketing emails",
            "Analytics & improvement",
            "Personalization",
            "Legal compliance",
            "Advertising / retargeting",
          ]}
          selected={form.purposes}
          onToggle={(v) => toggleArrayItem("purposes", v)}
        />
      </div>
    </div>
  );
}

function StepThirdParties({
  form,
  toggleArrayItem,
}: {
  form: FormState;
  toggleArrayItem: (k: keyof FormState, v: string) => void;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Third-Party Services</h2>
      <div>
        <p className="text-sm text-gray-400">Analytics</p>
        <CheckboxGroup
          items={["Google Analytics", "Plausible", "Mixpanel", "PostHog", "Other"]}
          selected={form.analytics}
          onToggle={(v) => toggleArrayItem("analytics", v)}
        />
      </div>
      <div>
        <p className="text-sm text-gray-400">Payment processors</p>
        <CheckboxGroup
          items={["Stripe", "PayPal", "Square", "Other"]}
          selected={form.paymentProcessors}
          onToggle={(v) => toggleArrayItem("paymentProcessors", v)}
        />
      </div>
      <div>
        <p className="text-sm text-gray-400">Email marketing</p>
        <CheckboxGroup
          items={["Mailchimp", "ConvertKit", "SendGrid", "Other"]}
          selected={form.emailMarketing}
          onToggle={(v) => toggleArrayItem("emailMarketing", v)}
        />
      </div>
      <div>
        <p className="text-sm text-gray-400">Advertising</p>
        <CheckboxGroup
          items={["Google Ads", "Facebook Pixel", "TikTok Pixel", "Other"]}
          selected={form.advertising}
          onToggle={(v) => toggleArrayItem("advertising", v)}
        />
      </div>
      <div>
        <p className="text-sm text-gray-400">Social login</p>
        <CheckboxGroup
          items={["Google", "Facebook / Meta", "Apple", "GitHub", "Other"]}
          selected={form.socialLogin}
          onToggle={(v) => toggleArrayItem("socialLogin", v)}
        />
      </div>
      <div>
        <p className="text-sm text-gray-400">Hosting</p>
        <CheckboxGroup
          items={["AWS", "Vercel", "Netlify", "Cloudflare", "Hetzner", "Other"]}
          selected={form.hosting}
          onToggle={(v) => toggleArrayItem("hosting", v)}
        />
      </div>
    </div>
  );
}

function StepCompliance({
  form,
  updateField,
}: {
  form: FormState;
  updateField: <K extends keyof FormState>(k: K, v: FormState[K]) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Compliance & Rights</h2>
      <Toggle
        label="Do you serve users in the EU/EEA?"
        sublabel="Triggers GDPR sections"
        value={form.servesEu}
        onChange={(v) => updateField("servesEu", v)}
      />
      <Toggle
        label="Do you serve users in California?"
        sublabel="Triggers CCPA/CPRA sections"
        value={form.servesCalifornia}
        onChange={(v) => updateField("servesCalifornia", v)}
      />
      <Toggle
        label="Do you serve users in the UK?"
        sublabel="Triggers UK GDPR sections"
        value={form.servesUk}
        onChange={(v) => updateField("servesUk", v)}
      />
      <Toggle
        label="Do you serve children under 13?"
        sublabel="Triggers COPPA compliance"
        value={form.servesChildren}
        onChange={(v) => updateField("servesChildren", v)}
      />
      <Toggle
        label="Do you sell personal data?"
        sublabel="Affects CCPA opt-out section"
        value={form.sellsData}
        onChange={(v) => updateField("sellsData", v)}
      />
      <Toggle
        label="Can users request data deletion?"
        value={form.allowsDeletion}
        onChange={(v) => updateField("allowsDeletion", v)}
      />
      <Select
        label="How do you notify of policy changes?"
        value={form.changeNotification}
        onChange={(v) => updateField("changeNotification", v)}
        options={["Email", "Website banner", "Both"]}
      />
    </div>
  );
}

/* ----- Reusable Inputs ----- */

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm text-gray-300">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-sm text-gray-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm"
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckboxGroup({
  items,
  selected,
  onToggle,
}: {
  items: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onToggle(item)}
          className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
            selected.includes(item)
              ? "bg-blue-600/20 border-blue-500 text-blue-300"
              : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
      <div>
        <span className="text-sm text-gray-200">{label}</span>
        {sublabel && (
          <span className="block text-xs text-gray-500">{sublabel}</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-10 h-6 rounded-full transition-colors ${
          value ? "bg-blue-600" : "bg-gray-600"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
            value ? "translate-x-4" : ""
          }`}
        />
      </button>
    </label>
  );
}
