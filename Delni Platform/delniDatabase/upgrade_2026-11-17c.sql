/*
  Brings an existing DelniDB up to date with the third 2026-11-17 change (run once in SSMS on DelniDB after
  upgrade_2026-11-17b.sql; safe to re-run). Take a backup first.

  tour_guides.years_of_experience gets the CHECK constraint chk_experience: 2 to 40 years, the same rule the API
  already applies when a guide registers or edits the profile. The check below lists any guide outside that range
  first (the constraint is refused while one exists).
  (Same change as delni-backend/database/migrations/2026_11_17_000002_check_experience_on_tour_guides.php)
*/
SET NOCOUNT ON;

SELECT license_number, years_of_experience
FROM dbo.tour_guides
WHERE years_of_experience < 2 OR years_of_experience > 40;

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.tour_guides') AND name = 'chk_experience')
    ALTER TABLE dbo.tour_guides WITH CHECK
        ADD CONSTRAINT chk_experience CHECK (years_of_experience >= 2 AND years_of_experience <= 40);

SELECT CASE WHEN EXISTS (SELECT 1 FROM sys.check_constraints WHERE parent_object_id = OBJECT_ID('dbo.tour_guides') AND name = 'chk_experience')
            THEN 'tour_guides.chk_experience ready' ELSE 'MISSING' END AS result;
