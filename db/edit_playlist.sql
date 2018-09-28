-- UPDATE playlists
-- SET playlistimage = $1
-- where playlistname = $2

-- UPDATE playlists
-- SET playlistimage = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuhjQkVnBh0q50K5kGFjIPDjYrRcMvfSOs2VuO_qpW-6KvijuAwQ'
-- WHERE playlistname = 'Second Playlist';

-- UPDATE playlists
-- SET playlistname = 'New Super Working Second Playlist'
-- WHERE playlistname = 'New Working Second Playlist';


UPDATE playlists
SET playlistimage = $2
where playlistname = $3;

UPDATE playlists
SET playlistname = $1
where playlistname = $3;

UPDATE singleplaylist
SET playlistname = $1
WHERE playlistname = $3;

SELECT * FROM playlists ORDER BY id;




--  $1 = playlist's new name
--  $2 = playlist's new image
--  $3 = playlist's old name
--
--
--
--
--