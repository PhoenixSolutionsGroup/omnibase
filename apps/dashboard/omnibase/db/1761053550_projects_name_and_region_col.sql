-- Add name and region columns to projects table
-- Step 1: Add columns as nullable first
ALTER TABLE projects
ADD COLUMN name VARCHAR(255),
ADD COLUMN region VARCHAR(100);

-- Step 2: Set default values for existing rows
UPDATE projects
SET name = 'test', region = 'sydney'
WHERE name IS NULL OR region IS NULL;

-- Step 3: Make columns NOT NULL
ALTER TABLE projects
ALTER COLUMN name SET NOT NULL,
ALTER COLUMN region SET NOT NULL;
