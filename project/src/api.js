export const startScan = async (domain) => {
    try {
        const response = await fetch("http://localhost:8000/api/scan/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ domain }), // Pass the domain to the API
        });
  
        if (!response.ok) throw new Error("Failed to start scan");
  
        const result = await response.json();
        console.log("Scan response:", result);
        return result;
    } catch (error) {
        console.error("Scan error:", error);
    }
  };
  
  export const getScanStatus = async (scanId) => {
    try {
        const response = await fetch(`http://localhost:8000/api/scan/status/${scanId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
  
        if (!response.ok) throw new Error("Failed to fetch scan status");
  
        const result = await response.json();
        console.log("Scan status response:", result);
        return result;
    } catch (error) {
        console.error("Scan status error:", error);
    }
  };
  
  export const getScanResults = async (scanId) => {
    try {
        const response = await fetch(`http://localhost:8000/api/scan/results/${scanId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
  
        if (!response.ok) throw new Error("Failed to fetch scan results");
  
        const result = await response.json();
        console.log("Scan results response:", result);
        return result;
    } catch (error) {
        console.error("Scan results error:", error);
        throw error; // Ensure the error is propagated
    }
  };
  