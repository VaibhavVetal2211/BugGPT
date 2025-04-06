import React from "react";

type Props = {
  scanCompleted: boolean;

  results: {
    fingerprint: {
      web_server: string;
      framework: string;
      language: string;
    };
    network: string;
    dns: string[];
    whois: {
      domain_name: string;
      registrar: string;
      registrar_url: string;
      reseller: string | null;
      whois_server: string;
      referral_url: string | null;
      updated_date: string[];
      creation_date: string[];
      expiration_date: string[];
      name_servers: string[];
      status: string[];
      emails: string[];
      dnssec: string;
      name: string | null;
      org: string;
      address: string | null;
      city: string | null;
      state: string;
      registrant_postal_code: string | null;
      country: string;
    };
    ssl_tls: {
      cipher: [string, string, number];
      version: string;
      peer_cert: {
        subject: [[["commonName", string]]];
        issuer: [
          [["countryName", string]],
          [["organizationName", string]],
          [["commonName", string]]
        ];
        version: number;
        serialNumber: string;
        notBefore: string;
        notAfter: string;
        subjectAltName: ["DNS", string][];
        OCSP: string[];
        caIssuers: string[];
        crlDistributionPoints: string[];
      };
    };
    vulnerabilities: string[];
    components: string[];
    session_management: string | null;
    authentication: string | null;
    error_codes: string[];
    xss: string[];
    sql_injection: string[];
    csrf: string | null;
    headers: string | null;
    open_ports: number[];
    subdomains: string[];
    cookies: string | null;
    api_endpoints: string[];
    file_exposure: string[];
    server_info: string | null;
    outdated_components: string[];
    security_misconfigs: string[];
  };
};

const ReportTable = ({ scanCompleted, results }: Props) => {
  console.log(results);

  if (!scanCompleted) {
    return null;
  }

  if (!results || typeof results !== "object") {
    return (
      <p className="text-red-500">
        Error: Scan results are not in the expected format.
      </p>
    );
  }

  // Extract relevant data for the table
  const tableData = [
    { field: "Domain", value: results?.whois?.domain_name },
    {
      field: "Web Server",
      value: results?.fingerprint?.web_server || "N/A",
    },
    {
      field: "Framework",
      value: results?.fingerprint?.framework || "N/A",
    },
    {
      field: "Programming Language",
      value: results?.fingerprint?.language || "N/A",
    },
    { field: "IP Address", value: results?.dns?.join(", ") || "N/A" },
    {
      field: "Vulnerabilities Found",
      value: results?.vulnerabilities?.length || 0,
    },
    {
      field: "Security Misconfigurations",
      value: results?.security_misconfigs?.length || 0,
    },
    {
      field: "Open Ports",
      value: results?.open_ports?.join(", ") || "N/A",
    },
    {
      field: "Subdomains Found",
      value: results?.subdomains?.length || 0,
    },
  ];

  return (
    <div className="mt-8">
      <h3 className="text-lg font-bold mb-4">Scan Summary</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg my-6">
          <thead>
            <tr>
              <th className="px-4 py-2 border">Field</th>
              <th className="px-4 py-2 border">Value</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border font-bold">{row.field}</td>
                <td className="px-4 py-2 border">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detailed Findings Section */}
      <div className="mt-8">
        <div className="mt-8">
          <h3 className="text-lg font-bold mb-4">Security Findings</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg my-9">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Severity</th>
                  <th className="px-4 py-2 border">Description</th>
                </tr>
              </thead>
              <tbody>
                {combinedFindings.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 border">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          severityColorMapForTable[item.severity]
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2 border">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTable;

export const vulnerabilities = {
  severe: ["Remote Code Execution"],
  medium: ["Cross-Site Scripting (XSS)"],
  low: ["SQL Injection"],
};

export const misconfigurations = {
  severe: ["Unrestricted File Upload"],
  medium: ["Open Ports"],
  low: ["Default Credentials"],
};

export const severityColorMap: Record<string, string> = {
  severe: "#EF4444", // red-500
  medium: "#F97316", // orange-500
  low: "#FACC15", // yellow-400
};

export const severityColorMapForTable: Record<string, string> = {
  severe: "bg-red-500 text-white",
  medium: "bg-orange-500 text-white",
  low: "bg-yellow-400 text-black",
};

const combinedFindings = [
  ...Object.entries(vulnerabilities).flatMap(([severity, items]) =>
    items.map((item) => ({
      type: "Vulnerability",
      severity,
      description: item,
    }))
  ),
  ...Object.entries(misconfigurations).flatMap(([severity, items]) =>
    items.map((item) => ({
      type: "Misconfiguration",
      severity,
      description: item,
    }))
  ),
];
