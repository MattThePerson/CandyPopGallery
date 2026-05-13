# Notes

## APP DATA DIR

|-- `preview_media/`	// 
|-- `app.db`			// posts, media, interactions
|-- `config.yaml`		// filename formats, media dirs, settings

## FOLDER STRUCTURE

|-- data/
|-- frontend/
|-- tools/ `shell scripts for running`
|-- .gitignore
|-- README.md
|-- config.yaml

## API ROUTES

GET         `/`                         // frontend
GET         `/media/:rel_path`          // get media with rel_path (query param: `?preview=true` for smaller media)
POST        `/api/search`               // send search query (json via POST), returns list of minimal post data
POST        `/api/catalogue`            // send catalogue query (json via POST), get sources, artists, and tags (and their counts)

GET                 `/api/post/:post_id`                // get post data (`?minimal=true|false`)
GET|POST|DELETE     `/api/post/:post_id/user-tags`      // 
GET|POST            `/api/post/:post_id/user-likes`     // 
GET|POST|DELETE     `/api/post/:post_id/user-comments`  // 
GET                 `/api/post/:post_id/interactions`   // get all user interactions for post. (eg. comments, custom tags, etc)
GET                 `/api/post/:post_id/similar`        // get similar posts based on TF-IDF matrix of tags

GET                 `/api/media/:media_id/similar`      // get similar media based on histograms

GET                 `/api/favourites`           // 
GET|POST|DELETE     `/api/favourites/:post_id`  // GET returns boolean
GET|POST|DELETE     `/api/lists/:title`         // 

GET         `/admin/setup-complete` // returns true is config.yaml exists
GET|POST    `/admin/config`         // get or post Config
POST        `/admin/scan`           // scan posts (`?filter=string` to filter posts by substring)
POST        `/admin/scan/quick`     // quick scan (don't rescan previous posts)
POST        `/admin/generate/preview_media` // 
POST        `/admin/generate/histograms`    // histograms of media
POST        `/admin/generate/tfidf`         // TF-IDF model based on post `tags|comments|description`

## DB

Tables:
- Posts             `COLS: post_id, date_added, platform, community, date_uploaded, data (serialized)`
- UserInteractions  `COLS: date_added, is_favourite, favourited_date, views, last_viewed, likes, comments`
- Views             `COLS: date_time, post_id`
