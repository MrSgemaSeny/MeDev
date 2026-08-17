import React from 'react';

export const TermsOfService: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-white mb-8">Terms of Service</h1>
                
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
                    <p>By accessing or using MeDev, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">2. Subscriptions and Billing</h2>
                    <p>Certain features (e.g., advanced AI parsing, Kaspi Pay/Stripe integrations) require a PRO subscription. Subscriptions are billed in advance and are non-refundable. Your PRO plan will be automatically downgraded to FREE upon expiration if not renewed.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">3. Acceptable Use</h2>
                    <p>You agree not to use the platform for any unlawful purpose, to upload malicious files (e.g., exploiting PDF parsers), or to attempt to bypass our rate limits or security mechanisms.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">4. AI Features Disclaimer</h2>
                    <p>Our AI-powered features (powered by Groq and OpenAI) are provided "as is". We are not responsible for inaccuracies in AI-generated profiles. We take measures to mask Personal Identifiable Information (PII) before processing.</p>
                </section>

                <p className="text-sm text-gray-500 mt-12">Last updated: August 2026</p>
            </div>
        </div>
    );
};
