

### Frontend/Backend Interface

- /search-posts/QUERY
- /get-post-info/{post_id}
- /media/{relative_path}
- /control/rescan-libraries


### TODO List


- [BACK] 
- [BACK] Get basic backend up and running for frontend dev
- [FRONT] Get basic template for responsive and collapsible sidebar (collapse on phones)
- [FRONT] Figure out infinite scroll


### Collection Management ToDo

- Download Stoyadinovich/top/?t=all
- Format filenames of STOY NSFW (with mtime or something)
- For STOY NSFW loading only 1 post (??)
- Siri
- Rename TwitterSelenium collection
- add collections from animation (dz & melt)
- dualapeep
<!-- - Fix kiriamari2 collection (m4v) -->
<!-- - reddit scrape comments (half done) -->
<!-- - incorporate 3dHent into collection (mdown and rename) -->
<!-- - Compare old Reddit (29GB) to new Reddit (20GB) -->
<!-- - Format filenames of DWHP -->
<!-- - Download that insta page -->



### Posts to look at when evaluating tag management
- reddit-1c4wpan
- reddit-1i020vu
- reddit-19awi30




## BACKEND FILE STRUCTURE:

|- fontend/
|  |- src/
|  |- index.html
|  |- package.json
|- data/
|  |- settings_template.json
|- app/
|  |- app_state.py
|  |- flask_server.py
|- fun/
|  |- fun.py  // generic functions
|  |- load.py
|  |- processing.py
|- main.py


## IMPORT NETWORK

main
- fun.fun
- fun.load

flask_server
- fun.processing

fun.fun
...

fun.load
- fun.metadata
- fun.metadata_standardize

