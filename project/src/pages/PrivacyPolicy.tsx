import React from 'react';

function PrivacyPolicy() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="prose prose-lg mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">
          Privacy Policy
        </h1>

        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-gray-900">Introduction</h2>
            <p className="text-gray-600">
              At Astraeus Next Gen, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Bug GPT security scanning service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
            <p className="text-gray-600">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Domain names submitted for scanning</li>
              <li>Scan results and reports</li>
              <li>Technical information about scanned systems</li>
              <li>Account information (if applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
            <p className="text-gray-600">
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 text-gray-600">
              <li>Perform security scans and vulnerability assessments</li>
              <li>Generate security reports</li>
              <li>Improve our scanning engine and detection capabilities</li>
              <li>Provide customer support</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at privacy@astraeusnextgen.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy