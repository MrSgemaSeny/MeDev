import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export const TermsOfService: React.FC = () => {
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
          <FileText className="h-8 w-8 text-[#2ea043]" aria-hidden="true" />
          <h1 className="text-3xl font-extrabold text-[#f0f6fc]">Terms of Service</h1>
        </div>
        <div className="text-xs text-[#8b949e]">Last updated: September 7, 2026</div>

        <div className="space-y-6 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the MeDev platform (operated by Individual Entrepreneur Murat Orynbasar / ИП Орынбасар М., Almaty, Republic of Kazakhstan), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may discontinue use of the service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">2. Subscriptions, Billing & Refund Guarantee</h2>
            <p>
              MeDev offers free developer accounts and a premium PRO subscription. PRO features are billed in advance via Kaspi Pay or Stripe.
            </p>
            <p>
              We provide a <strong>14-day money-back guarantee</strong> for first-time subscribers. Subscriptions can be canceled at any time in account settings. Please review our full{' '}
              <Link to="/refund" className="text-[#58a6ff] hover:underline font-medium">
                Refund Policy
              </Link>{' '}
              for eligibility and turnaround procedures.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">3. Intellectual Property</h2>
            <p>
              You retain full ownership of your code, repository commits, and resume content. MeDev does not claim any copyright or proprietary rights over your career data or source code.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">4. Acceptable Use and Security</h2>
            <p>
              You agree not to exploit the platform for unlawful activities, attempt to bypass rate limits, or upload malicious payloads via PDF parsers.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">5. Governing Law and Disputes</h2>
            <p>
              These terms are governed by the laws of the Republic of Kazakhstan. Disputes will be resolved through good-faith pre-trial negotiation, and if necessary, in the competent courts of the Republic of Kazakhstan.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#f0f6fc]">6. Business Entity & Contacts</h2>
            <div className="rounded-xl border border-[#30363d] bg-[#161b22] p-5 space-y-2 text-xs">
              <div><strong>Service Operator:</strong> Individual Entrepreneur Murat Orynbasar (ИП Орынбасар М.)</div>
              <div><strong>Registration Jurisdiction:</strong> Almaty, Republic of Kazakhstan</div>
              <div><strong>Customer Support:</strong> <a href="mailto:support@medev.mrsgemaseny.com" className="text-[#58a6ff] hover:underline">support@medev.mrsgemaseny.com</a></div>
              <div><strong>Legal & Privacy:</strong> <a href="mailto:privacy@medev.mrsgemaseny.com" className="text-[#58a6ff] hover:underline">privacy@medev.mrsgemaseny.com</a></div>
              <div><strong>Telegram:</strong> <a href="https://t.me/MrSgemaSeny" target="_blank" rel="noreferrer" className="text-[#58a6ff] hover:underline">@MrSgemaSeny</a></div>
              <div><strong>Support Response SLA:</strong> 24 to 48 hours</div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
