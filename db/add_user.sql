INSERT INTO users (username, authid)
VALUES ($1, $2) RETURNING *;