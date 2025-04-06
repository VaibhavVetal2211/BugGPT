// these need to be further updated

const vulnerabilities = {
  severe: ["Remote Code Execution"],
  medium: ["Cross-Site Scripting (XSS)"],
  low: ["SQL Injection"],
};

const misconfigurations = {
  severe: ["Unrestricted File Upload"],
  medium: ["Open Ports"],
  low: ["Default Credentials"],
};

const misconfigurationsToColorMapping = {
  severe: "red-500",
  medium: "orange-500",
  low: "yellow-500",
};

export type ScanResult = {
  id: string;
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
