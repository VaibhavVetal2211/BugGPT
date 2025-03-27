import React from 'react';

function Home() {
  const features = [
    {
      title: "Comprehensive Security Scanning",
      description: "Advanced scanning capabilities covering OWASP Top 10 vulnerabilities and beyond."
    },
    {
      title: "Application Fingerprinting",
      description: "Detailed technology stack analysis and version identification."
    },
    {
      title: "Network Security Testing",
      description: "In-depth analysis of network configurations and potential vulnerabilities."
    },
    {
      title: "Authentication Testing",
      description: "Thorough assessment of login mechanisms, session management, and access controls."
    },
    {
      title: "Vulnerability Assessment",
      description: "Detection of XSS, SQL Injection, CSRF, and other critical security issues."
    },
    {
      title: "Detailed Reporting",
      description: "Comprehensive reports with visualizations and actionable recommendations."
    }
  ];

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Features and Capabilities
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Advanced security scanning and vulnerability assessment platform
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="pt-6"
              >
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">
                      {feature.title}
                    </h3>
                    <p className="mt-5 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home