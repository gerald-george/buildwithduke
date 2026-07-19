PRAGMA foreign_keys = ON;

-- Microsoft OAuth is no longer used. Remove stored credentials and pending
-- authorisation requests while retaining any historical lead correspondence.
DROP TABLE IF EXISTS microsoft_oauth_states;
DROP TABLE IF EXISTS microsoft_connections;
