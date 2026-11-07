/*
  Brings an existing DelniDB up to date with the 2026-11-07 changes (run once in SSMS on DelniDB after
  upgrade_2026-11-03.sql; safe to re-run). Take a backup first.

  Adds the support chat table: messages between an account (or a visitor) and the platform's administration
  are now kept in the database instead of each browser's local storage, so no conversation is lost and the
  administration sees every conversation. Additive only: no other table is changed.
  (Same table as delni-backend/database/migrations/2026_11_07_000000_create_support_messages_table.php)
*/
SET NOCOUNT ON;

IF OBJECT_ID('dbo.support_messages', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.support_messages (
        [id] BIGINT IDENTITY(1, 1) NOT NULL,
        [session_id] NVARCHAR(100) NOT NULL,      -- the conversation the message belongs to
        [sender_id] NVARCHAR(100) NULL,           -- who sent it (NULL for a visitor without an account)
        [sender_role] NVARCHAR(20) NOT NULL,      -- tourist | guide | transport | driver | admin | visitor
        [recipient_id] NVARCHAR(100) NULL,        -- who it is for (NULL = the administration as a team)
        [recipient_role] NVARCHAR(20) NOT NULL,   -- admin, or the account's role for an admin reply
        [body] NVARCHAR(MAX) NOT NULL,            -- the message text
        [is_read] BIT NOT NULL CONSTRAINT [DF_support_messages_is_read] DEFAULT ((0)),
        [created_at] DATETIME NOT NULL,           -- when it was sent (Africa/Tripoli)
        CONSTRAINT [PK_support_messages] PRIMARY KEY ([id])
    );
    CREATE INDEX [support_messages_session_id_created_at_index] ON dbo.support_messages ([session_id], [created_at]);
    CREATE INDEX [support_messages_recipient_role_is_read_index] ON dbo.support_messages ([recipient_role], [is_read]);
END;

SELECT CASE WHEN OBJECT_ID('dbo.support_messages', 'U') IS NOT NULL THEN 'support_messages ready' ELSE 'MISSING' END AS result;
