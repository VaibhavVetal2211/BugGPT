import React from "react";
import { misconfigurations, vulnerabilities } from "./ReportTable";

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

const ReportSummary = ({ results, scanCompleted }: Props) => {
  if (!scanCompleted) return null;

  const countSeverity = (data: Record<string, string[]>, level: string) =>
    data[level]?.length || 0;

  const totalVulns =
    Object.values(vulnerabilities).reduce(
      (acc, curr) => acc + curr.length,
      0
    ) || 0;
  const totalMisconfigs =
    Object.values(misconfigurations).reduce(
      (acc, curr) => acc + curr.length,
      0
    ) || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
        <h4 className="font-bold text-red-700">Critical Vulnerabilities</h4>
        <p className="text-2xl font-bold">
          {countSeverity(vulnerabilities, "severe")}
        </p>
      </div>
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <h4 className="font-bold text-orange-700">Total Issues</h4>
        <p className="text-2xl font-bold">{totalVulns + totalMisconfigs}</p>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-bold text-blue-700">Open Ports</h4>
        <p className="text-2xl font-bold">{results?.open_ports?.length || 0}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-bold text-green-700">Subdomains</h4>
        <p className="text-2xl font-bold">{results?.subdomains?.length || 0}</p>
      </div>
    </div>
  );
};

export default ReportSummary;
