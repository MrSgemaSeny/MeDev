import React from 'react';

export const PrivacyPolicy: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-3xl font-bold text-white mb-8">Privacy Policy</h1>
                
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">1. Data Collection and Usage</h2>
                    <p>We collect information you provide directly to us when you create an account, build a portfolio, or upload a resume. This may include your name, email address, phone number, professional experience, and other details present in your CV.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">2. AI Processing (Groq & OpenAI)</h2>
                    <p>When you upload a resume for parsing, we use third-party AI services (such as Groq API) to extract and format your professional experience. <strong>Important:</strong> We implement data anonymization to mask highly sensitive PII (like your exact phone number and email) before sending data to these LLM providers. By using this feature, you consent to this processing.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">3. Third-Party Services (Stripe & Kaspi Pay)</h2>
                    <p>We use Stripe and Kaspi Pay for payment processing. We do not store your full credit card details. These payment processors have their own privacy policies regarding the handling of your financial data.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-white">4. Data Security</h2>
                    <p>We implement industry-standard security measures, including AES-GCM encryption for stored tokens, stateless JWT authentication, and robust infrastructure configurations to protect your personal data from unauthorized access.</p>
                </section>

                <p className="text-sm text-gray-500 mt-12">Last updated: August 2026</p>
            </div>
        </div>
    );
};
