import { useState } from "react";

const ScanButton = () => {
    const [domain, setDomain] = useState("");
    const [loading, setLoading] = useState(false);

    const startScan = async () => {
        console.log("🔹 startScan() function triggered");

        if (!domain.trim()) {
            alert("Please enter a valid domain.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`https://${domain}`, { method: "HEAD" });
            if (!response.ok) {
                alert("The domain is not reachable or does not support HTTPS.");
                setLoading(false);
                return;
            }
        } catch (error) {
            alert("Failed to validate the domain. Please check the domain and try again.");
            setLoading(false);
            return;
        }

        try {
            console.log(`🔹 Sending request to: ${import.meta.env.VITE_API_URL}/api/scan/start`);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/scan/start`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ domain }),
            });

            console.log("🔹 API Response:", response);

            const data = await response.json();
            console.log("🔹 Response Data:", data);

            if (!response.ok) {
                throw new Error(data.detail || "Failed to start scan. Server error.");
            }

            alert("✅ Scan started successfully!");
        } catch (error) {
            console.error("🔴 Scan start error:", error.message);
            alert(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain"
            />
            <button onClick={startScan} disabled={loading}>
                {loading ? "Starting..." : "Start Scan"}
            </button>
        </div>
    );
};

export default ScanButton;
