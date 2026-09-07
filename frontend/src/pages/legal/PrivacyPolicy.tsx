import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#58a6ff] hover:underline mb-2 focus-visible:ring-2 focus-visible:ring-[#2ea043] focus-visible:outline-none rounded"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Вернуться на главную</span>
        </Link>

        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-[#2ea043]" aria-hidden="true" />
          <h1 className="text-3xl font-extrabold text-[#f0f6fc]">Privacy Policy</h1>
        </div>
        <div className="text-xs text-[#8b949e]">Last updated: September 7, 2026</div>

        <div className="space-y-6 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">1. Data Controller and Scope</h2>
            <p>
              This Privacy Policy applies to the MeDev platform, operated by Individual Entrepreneur Murat Orynbasar (ИП Орынбасар М., Almaty, Republic of Kazakhstan). We strictly comply with Law of the Republic of Kazakhstan No. 94-V "On Personal Data and its Protection" and the principles of the General Data Protection Regulation (GDPR).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">2. Data Collection and Usage</h2>
            <p>
              We collect information you directly provide when you authenticate via GitHub OAuth, build a portfolio, or upload a resume. This includes your GitHub username, email address, avatar, public repositories, commit history, and the professional experience stated in your CV. We do not access or request private repositories.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">3. Principle of Data Minimization</h2>
            <p>
              Under GDPR Article 5(1)(c) and KZ Law No. 94-V, we collect and process only the minimal data strictly necessary for resume generation and job application tracking.
            </p>
            <p><strong>We never collect, request, or store:</strong></p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-[#c9d1d9]">
              <li>National identification numbers (IIN, passport numbers, national IDs).</li>
              <li>Exact home addresses (city and country are sufficient).</li>
              <li>Sensitive categories (health data, biometrics, religious/political beliefs).</li>
              <li>Access tokens or code from private GitHub repositories.</li>
              <li>Full credit/debit card numbers or security CVV/CVC codes.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">4. AI Processing (Groq API) & PII Protection</h2>
            <p>
              When tailoring resume descriptions or generating cover letters, we utilize Groq Cloud API (model <code>openai/gpt-oss-20b</code>). Highly sensitive personal identifiers (such as phone numbers and private addresses) are masked before transmission. <strong>User data is never retained or utilized to train external LLM models.</strong>
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">5. Payment Processing (Kaspi Pay & Stripe)</h2>
            <p>
              All payments for the PRO subscription are processed directly by certified payment gateways Kaspi Pay and Stripe. MeDev does not process or store credit card numbers or CVV codes on our servers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">6. Cookies and Telemetry</h2>
            <p>
              We utilize strictly necessary session cookies (such as <code>refresh_token</code> for secure authentication) and local storage preferences (theme selection). We use cookieless, privacy-preserving Vercel Web Analytics for aggregate system performance monitoring. No cross-site advertising trackers are deployed.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">7. User Rights & Data Deletion</h2>
            <p>
              You have the right to export your data or request complete account and data erasure at any time by contacting us at{' '}
              <a href="mailto:support@medev.mrsgemaseny.com" className="text-[#58a6ff] hover:underline">
                support@medev.mrsgemaseny.com
              </a>
              . Account deletion requests are fulfilled within 48 hours.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">8. Business Entity & Contacts</h2>
            <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-2 text-xs">
              <div><strong>Data Controller:</strong> Individual Entrepreneur Murat Orynbasar (ИП Орынбасар М.)</div>
              <div><strong>Jurisdiction:</strong> Almaty, Republic of Kazakhstan</div>
              <div><strong>Support Email:</strong> <a href="mailto:support@medev.mrsgemaseny.com" className="text-[#58a6ff] hover:underline">support@medev.mrsgemaseny.com</a></div>
              <div><strong>Privacy Inquiries:</strong> <a href="mailto:privacy@medev.mrsgemaseny.com" className="text-[#58a6ff] hover:underline">privacy@medev.mrsgemaseny.com</a></div>
              <div><strong>Telegram:</strong> <a href="https://t.me/MrSgemaSeny" target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline">@MrSgemaSeny</a></div>
              <div><strong>Support Response SLA:</strong> 24 to 48 hours</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
