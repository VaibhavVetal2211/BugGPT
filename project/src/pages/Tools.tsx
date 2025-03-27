import React from 'react';

function Tools() {
  const tools = [
    {
      category: "Reconnaissance",
      items: [
        "Application Fingerprinting",
        "Network Testing",
        "Application Mapping",
        "Component Audit"
      ]
    },
    {
      category: "Authentication & Session",
      items: [
        "Session Management Audit",
        "Authentication Testing",
        "Password Policy Analysis",
        "Multi-factor Authentication Testing"
      ]
    },
    {
      category: "Vulnerability Scanning",
      items: [
        "Cross-Site Scripting (XSS)",
        "SQL Injection",
        "CSRF Token Testing",
        "XML Injection Testing"
      ]
    },
    {
      category: "Advanced Testing",
      items: [
        "Host Header Attacks",
        "Open Redirection",
        "SSRF/LFI Detection",
        "Broken Link Analysis"
      ]
    }
  ];

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Security Testing Tools
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Comprehensive suite of security testing and vulnerability assessment tools
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {tools.map((category, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {category.category}
                </h3>
                <ul className="space-y-3">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-600">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Tools