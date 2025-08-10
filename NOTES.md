

# TODO

- make bare project


# FOLDER STRUCTURE

|-- data/
|-- frontend/
|-- tools/ `shell scripts for running`
|-- .gitignore
|-- README.md
|-- config.yaml



# API ROUTES

GET         `/`                         // frontend
GET         `/media/:rel_path`          // get media with rel_path (query param: `?preview=true` for smaller media)
POST        `/api/search`               // send search query (json via POST), returns list of minimal post data
POST        `/api/catalogue`            // send catalogue query (json via POST), get sources, artists, and tags (and their counts)
GET         `/api/similar_posts/:post_id`       // get similar posts based on TF-IDF matrix of tags (no source or artist)
GET         `/api/similar_media/:media_id`      // get similar media based on histograms

GET                 `/api/posts/:post_id`              // get post data (`?minimal=true|false`)
GET|POST|DELETE     `/api/posts/:post_id/custom_tags`  // 
GET|POST            `/api/posts/:post_id/likes`        // 
GET|POST|DELETE     `/api/posts/:post_id/comments`     // 
GET                 `/api/posts/:post_id/interactions` // get all user interactions for post. (eg. comments, custom tags, etc)

GET                 `/api/favourites`           // 
GET|POST|DELETE     `/api/favourites/:post_id`  // GET returns boolean
GET|POST|DELETE     `/api/lists/:title`         // 

POST        `/admin/scan`        // scan posts (`?filter=string` to filter posts by substring)
POST        `/admin/scan/quick`  // quick scan (don't rescan previous posts)
POST        `/admin/generate/preview_media`  // 
POST        `/admin/generate/histograms`  // histograms of media
POST        `/admin/generate/tfidf`  // tf-idf model based on post `tags|comments|description`




# FRONTEND STRUCTURE

|-- pages/
|   |-- home/
|   |   |-- page.html
|   |-- search/
|   |   |-- page.html
|   |-- settings/
|   |   |-- page.html
|-- shared/
|-- global.css
|-- index.html `redirects to 'pages/home/page.html'`
