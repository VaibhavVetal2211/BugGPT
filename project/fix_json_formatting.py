import sqlite3
import json

def fix_json_formatting():
    # Connect to the SQLite database
    conn = sqlite3.connect('bug_gpt.db')
    cursor = conn.cursor()

    # Fetch all records from the scan_results table
    cursor.execute("SELECT scan_id, results FROM scan_results")
    records = cursor.fetchall()

    for scan_id, results in records:
        try:
            # Attempt to load the JSON to check if it's valid
            json.loads(results)
        except json.JSONDecodeError:
            # If it's not valid, fix the formatting
            # Add commas between key-value pairs
            fixed_results = results.replace('{"', '{"').replace('" ', '", "').replace('} ', '}, ')
            # Update the record in the database
            cursor.execute("UPDATE scan_results SET results = ? WHERE scan_id = ?", (fixed_results, scan_id))
            print(f"Updated scan_id: {scan_id}")

    # Commit the changes and close the connection
    conn.commit()
    conn.close()

if __name__ == "__main__":
    fix_json_formatting()
