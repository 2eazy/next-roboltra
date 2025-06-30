-- Activate Spring Cleaning season
UPDATE seasons 
SET is_active = true 
WHERE id = 'spring-cleaning-2024';

-- Ensure only one season is active at a time
UPDATE seasons 
SET is_active = false 
WHERE id != 'spring-cleaning-2024';