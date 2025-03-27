# SQL Commands for Operating on bug_gpt.db

## 1. Select All Records
```sql
SELECT * FROM scans;
```

## 2. Select Specific Columns
```sql
SELECT Domain, Status FROM scans;
```

## 3. Insert a New Record
```sql
INSERT INTO scans (ID, Domain, Status, Score, Timestamp) 
VALUES ('new-id', 'example.com', 'pending', 0, '2025-03-10 12:00:00');
```

## 4. Update an Existing Record
```sql
UPDATE scans 
SET Status = 'completed', Score = 100 
WHERE ID = 'existing-id';
```

## 5. Delete a Record
```sql
DELETE FROM scans 
WHERE ID = 'existing-id';
```

## 6. Count Records
```sql
SELECT COUNT(*) FROM scans;
```

## 7. Filter Records by Status
```sql
SELECT * FROM scans 
WHERE Status = 'completed';
```

## 8. Order Records by Timestamp
```sql
SELECT * FROM scans 
ORDER BY Timestamp DESC;
