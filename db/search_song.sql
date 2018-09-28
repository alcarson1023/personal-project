-- When I can connect reliably, pass in custom searches with this:

    -- curl -X "GET" "https://api.spotify.com/v1/search?q=$1&type=$2&limit=$3&offset=$4" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer $5"


    -- $1 = query. Whatever they type into the box.
    -- $2 = type. Should probably equal either artist, track,
        -- or track%2Cartist (read in system as track,artist)
    -- $3 = limit. This can probably be set to a default.
    -- $4 = offset. I might need to set up a counter.
    -- $5 = authentication token saved in localStorage.




-- Until then, this is a placeholder while I try and connect.


curl -X "GET" "https://api.spotify.com/v1/search?q=tania%20bowra&type=artist" -H "Accept: application/json" -H "Content-Type: application/json" -H "Authorization: Bearer $1"

-- $1 is whatever my current auth token is.

$.ajax({
        url: 'https://api.wit.ai/message?v=20140826&q=',
        beforeSend: function(xhr) {
             xhr.setRequestHeader("Authorization", "Bearer 6QXNMEMFHNY4FJ5ELNFMP5KRW52WFXN5")
        }, success: function(data){
            alert(data);
            //process the JSON data etc
        }
})