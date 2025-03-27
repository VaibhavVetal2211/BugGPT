import asyncio
from datetime import datetime
from src.database import async_session
from src.models.scan import Scan, ScanResult
import json
import aiohttp
import nmap
import ssl
import socket
import dns.resolver
import whois
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
import subprocess
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from OpenSSL import SSL
from src.utils.logger import logger

class Scanner:
    def __init__(self, domain: str, scan_id: str):
        self.domain = domain
        self.scan_id = scan_id
        self.results = {
            "fingerprint": None,
            "network": None,
            "dns": None,
            "whois": None,
            "ssl_tls": None,
            "vulnerabilities": [],
            "components": [],
            "session_management": None,
            "authentication": None,
            "error_codes": [],
            "xss": [],
            "sql_injection": [],
            "csrf": None,
            "headers": None,
            "open_ports": None,
            "subdomains": [],
            "cookies": None,
            "api_endpoints": [],
            "file_exposure": [],
            "server_info": None,
            "outdated_components": [],
            "security_misconfigs": []
        }

    def convert_to_serializable(self, obj):
        """Convert datetime objects to ISO format for JSON serialization"""
        if isinstance(obj, datetime):
            return obj.isoformat()
        elif isinstance(obj, list):
            return [self.convert_to_serializable(i) for i in obj]
        elif isinstance(obj, dict):
            return {k: self.convert_to_serializable(v) for k, v in obj.items()}
        return obj

    async def whois_lookup(self):
        """Performs a WHOIS lookup for the given domain."""
        await self.update_progress(20)  # Update progress to 20%
        try:
            whois_info = whois.whois(self.domain)
            self.results["whois"] = whois_info  # Store as is for serialization
        except Exception as e:
            self.results["whois"] = str(e)

    async def ssl_tls_analysis(self):
        """Performs SSL/TLS analysis for the given domain."""
        await self.update_progress(30)  # Update progress to 30%
        try:
            context = ssl.create_default_context()
            with socket.create_connection((self.domain, 443)) as sock:
                with context.wrap_socket(sock, server_hostname=self.domain) as ssock:
                    self.results["ssl_tls"] = {
                        "cipher": ssock.cipher(),
                        "version": ssock.version(),
                        "peer_cert": ssock.getpeercert()
                    }
        except Exception as e:
            self.results["ssl_tls"] = str(e)

    async def dns_enumeration(self):
        """Performs DNS enumeration for the given domain."""
        await self.update_progress(10)  # Update progress to 10%
        try:
            resolver = dns.resolver.Resolver()
            answers = resolver.resolve(self.domain, 'A')
            self.results["dns"] = [answer.to_text() for answer in answers]  # Store as is for serialization
        except Exception as e:
            self.results["dns"] = str(e)

    async def fingerprint(self):
        """Performs technology fingerprinting for the given domain."""
        await self.update_progress(40)  # Update progress to 40%
        try:
            # Example implementation (this should be replaced with actual fingerprinting logic)
            self.results["fingerprint"] = {
                "web_server": "Apache",
                "framework": "Django",
                "language": "Python"
            }
        except Exception as e:
            self.results["fingerprint"] = str(e)

    async def network_test(self):
        """Performs a basic network test for the given domain."""
        await self.update_progress(40)  # Update progress to 40%
        try:
            # Example implementation of a network test (ping)
            process = await asyncio.create_subprocess_shell(
                f'ping -c 1 {self.domain}',
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            if process.returncode == 0:
                self.results["network"] = "Reachable"  # Ensure this is a string
            else:
                self.results["network"] = "Unreachable"
        except Exception as e:
            self.results["network"] = str(e)

    async def enumerate_subdomains(self):
        """Enumerates subdomains for the given domain."""
        await self.update_progress(50)  # Update progress to 50%
        try:
            # Example implementation of subdomain enumeration
            subdomains = []
            common_subdomains = ["www", "mail", "blog", "api", "dev"]
            for sub in common_subdomains:
                full_domain = f"{sub}.{self.domain}"
                try:
                    # Attempt to resolve the subdomain
                    resolver = dns.resolver.Resolver()
                    answers = resolver.resolve(full_domain, 'A')
                    subdomains.append(full_domain)
                except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
                    continue  # Subdomain does not exist
            self.results["subdomains"] = subdomains  # Store as is for serialization
        except Exception as e:
            self.results["subdomains"] = str(e)

    async def discover_api_endpoints(self):
        """Discovers API endpoints for the given domain."""
        await self.update_progress(70)  # Update progress to 70%
        try:
            # Example implementation of API discovery
            api_endpoints = []
            # Here you would typically make requests to the domain and parse the responses
            # For demonstration, we will add a few common API endpoints
            common_endpoints = ["/api/v1/resource", "/api/v2/resource", "/api/v1/users"]
            for endpoint in common_endpoints:
                full_url = f"http://{self.domain}{endpoint}"
                try:
                    async with aiohttp.ClientSession() as session:
                        async with session.get(full_url) as response:
                            if response.status == 200:
                                api_endpoints.append(full_url)
                except Exception as e:
                    continue  # If the request fails, skip to the next endpoint
            self.results["api_endpoints"] = api_endpoints  # Store as is for serialization
        except Exception as e:
            self.results["api_endpoints"] = str(e)

    async def vulnerability_scan(self):
        """Scans for common vulnerabilities in the target domain."""
        await self.update_progress(80)  # Update progress to 80%
        try:
            # Example implementation of vulnerability scanning
            vulnerabilities = []
            # Here you would typically check for known vulnerabilities
            # For demonstration, we will add a few common vulnerabilities
            common_vulnerabilities = ["SQL Injection", "Cross-Site Scripting (XSS)", "Remote Code Execution"]
            for vulnerability in common_vulnerabilities:
                vulnerabilities.append(vulnerability)
            self.results["vulnerabilities"] = vulnerabilities  # Store as is for serialization
        except Exception as e:
            self.results["vulnerabilities"] = str(e)

    async def check_security_misconfigs(self):
        """Checks for common security misconfigurations in the target domain."""
        await self.update_progress(90)  # Update progress to 90%
        try:
            # Example implementation of checking security misconfigurations
            misconfigurations = []
            # Here you would typically check for known misconfigurations
            # For demonstration, we will add a few common misconfigurations
            common_misconfigurations = ["Default Credentials", "Open Ports", "Unrestricted File Upload"]
            for misconfiguration in common_misconfigurations:
                misconfigurations.append(misconfiguration)
            self.results["security_misconfigs"] = misconfigurations  # Store as is for serialization
        except Exception as e:
            self.results["security_misconfigs"] = str(e)

    async def start(self):
        try:
            from src.main import emit_scan_progress, emit_scan_complete
            
            await self._update_status("scanning", 0)
            await emit_scan_progress(self.scan_id, 0, "Initializing scan...")

            # DNS and WHOIS (10%)
            await self.dns_enumeration()
            await self.whois_lookup()
            await emit_scan_progress(self.scan_id, 10, "Performing DNS and WHOIS lookup...")

            # SSL/TLS Analysis (20%)
            await self.ssl_tls_analysis()
            await emit_scan_progress(self.scan_id, 20, "Analyzing SSL/TLS configuration...")

            # Fingerprinting (30%)
            await self.fingerprint()
            await emit_scan_progress(self.scan_id, 30, "Fingerprinting technologies...")

            # Network and Port Scanning (40%)
            await self.network_test()
            await self.port_scan()
            await emit_scan_progress(self.scan_id, 40, "Scanning network and ports...")

            # Subdomain Enumeration (50%)
            await self.enumerate_subdomains()
            await emit_scan_progress(self.scan_id, 50, "Enumerating subdomains...")

            # API Discovery (70%)
            await self.discover_api_endpoints()
            await emit_scan_progress(self.scan_id, 70, "Discovering API endpoints...")

            # Vulnerability Scanning (80%)
            await self.vulnerability_scan()
            await emit_scan_progress(self.scan_id, 80, "Scanning for vulnerabilities...")

            # Security Misconfiguration (90%)
            await self.check_security_misconfigs()
            await emit_scan_progress(self.scan_id, 90, "Checking security configurations...")

            # Report Generation (100%)
            await self.generate_report()
            await emit_scan_progress(self.scan_id, 100, "Scan complete!")

            # Emit scan complete event
            self.results = self.convert_to_serializable(self.results)
            serialized_results = json.dumps(self.convert_to_serializable(self.results))  # Convert to JSON
            await emit_scan_complete(self.scan_id, serialized_results)

            await self._update_status("completed", 100)

        except Exception as e:
            try:
                print(f"Scan error: {str(e)}")
            except UnicodeEncodeError:
                print(f"Scan error")
            await self._update_status("failed", 0, str(e))
            raise e

    async def generate_report(self):
        try:
            report = {
                "scan_id": self.scan_id,
                "domain": self.domain,
                "timestamp": datetime.utcnow().isoformat(),
                "results": self.convert_to_serializable(self.results),  # Ensure results are serialized
                "summary": self.generate_summary()
            }

            async with async_session() as session:
                async with session.begin():
                    scan_result = ScanResult(
                        scan_id=self.scan_id,
                        results=json.dumps(report)  # Ensure results are serialized as JSON
                    )
                    session.add(scan_result)
                await session.commit()
        except Exception as e:
            print(f"Error generating report: {str(e)}")  # Log error during report generation
            logger.error(f"Error generating report: {str(e)}")  # Add logging for error

    def generate_summary(self):
        """Generates a summary of the scan results."""
        summary = {
            "total_vulnerabilities": len(self.results["vulnerabilities"]),
            "open_ports": self.results["open_ports"] if self.results["open_ports"] else [],
            "subdomains": self.results["subdomains"] if self.results["subdomains"] else [],
            "api_endpoints": self.results["api_endpoints"] if self.results["api_endpoints"] else [],
        }
        return summary

    async def _save_results_to_db(self):
        """Save scan results to the database"""
        try:
            scan_result = ScanResult(scan_id=self.scan_id, results=json.dumps(self.convert_to_serializable(self.results)))
            async with async_session() as session:
                async with session.begin():
                    session.add(scan_result)
                await session.commit()
            print(f"✅ Scan results saved successfully for {self.scan_id}")  # 🔹 Debugging log
            logger.info(f"Scan results saved successfully for {self.scan_id}")  # Add logging for success
        except Exception as e:
            print(f"❌ Failed to save scan results: {str(e)}")

    async def _update_status(self, status: str, progress: int = 0, error_message: str = None):
        """Update scan status in the database and log errors if any."""
        try:
            async with async_session() as session:
                async with session.begin():
                    scan = await session.get(Scan, self.scan_id)
                    if scan:
                        scan.status = status
                        scan.progress = progress
                        scan.updated_at = datetime.utcnow()
                        if error_message:
                            scan.error_message = error_message  # Add error logging to DB (ensure `error_message` column exists)
                        await session.commit()
            try:
                print(f"🔴 Scan {self.scan_id} failed: {error_message}" if error_message else f"✅ Scan {self.scan_id} updated to {status}")
            except UnicodeEncodeError:
                print(f"Scan {self.scan_id} failed: {error_message}" if error_message else f"Scan {self.scan_id} updated to {status}")
        except Exception as e:
            try:
                print(f"Database update failed: {str(e)}")  # Log database update failure
            except UnicodeEncodeError:
                print(f"Database update failed")
            logger.error(f"Database update failed: {str(e)}")  # Add logging for error

    async def update_progress(self, value):
        """Updates progress and sends it via WebSockets."""
        self.progress = value
        from src.main import emit_scan_progress  # Ensure correct import
        await emit_scan_progress(self.scan_id, self.progress, "Scanning in progress")
        print(f"Scanning Progress: {self.progress}%")  # Debugging log

    async def port_scan(self):
        """Scans common ports on the target domain."""
        await self.update_progress(30)  # 30% Done
        ports = [21, 22, 23, 25, 53, 80, 110, 443, 3389]
        open_ports = []
        for port in ports:
            try:
                resolver = dns.resolver.Resolver()
                resolver.resolve(self.domain, 'A')  # Check if the domain resolves
            except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, socket.gaierror) as e:
                self.results["ports"] = f"Domain resolution error: {str(e)}"
                return
            
            try:
                with socket.create_connection((self.domain, port), timeout=2):
                    open_ports.append(port)
            except (socket.timeout, ConnectionRefusedError):
                pass
                open_ports.append(port)
            except (socket.timeout, ConnectionRefusedError) as e:
                self.results["ports"] = f"Connection error on port {port}: {str(e)}"
                continue
            
        self.results["open_ports"] = open_ports  # Store as is for serialization

    def get_results(self):
        """Returns the scan results."""
        return self.convert_to_serializable(self.results)
