# CandyPopGalleries

## About

An app for exploring a local collection of well-tagged media. Made with ReactJS and Python Flask!

## Install

1. Clone repo
2. With tools/setup.sh, make executable (`chmod +x setup.sh`) and run (`./setup.sh`) to install python and npm dependencies
3. (Optional) Add symbolic link to tools/run.sh \
`sudo ln -fs INSTALL_DIR/tools/run.sh /usr/local/bin/cpop-gall`

Now, you'll have a CL utility called `cpop-gall` which will start the http server and flask api. 

## Dependencies

- python3
- npm

## Brainstorming


- supports images, gifs, and short videos (no advanced video controls)
- media can have duplicates
- tag based searching
- images viewed in a stream
- Stream defined by:
	- tags
	- collections
	- filters (favs, likes)
	- sortby option (date added, number of tags)
	- media type (images, gifs, videos, extensions)
- Stream:
	- Select stream, then view in twitter-like feed (either home feed or media feed)
	- Click on image to fullscreen it. Images still in stream, x/n. 
- media from:
	- twitter (profiles)
	- patreon
	- reddit (subreddits)
	- redgifs
	- other image boards
- download media with easy
- integrate new media quickly (in real time, watchdog library)
- focus on pc AND mobile from the start
- extract tags from text (title, comments, etc)




FILENAMES:

username - Twitter - [date] title #tags.png
1869414850130284799_1 #TagOne #TagTwo #tag-three.png



### FILE STUCTURES

PROJECT
|-- backend
|	|-- util
|	|	|-- JsonReader.py
|	|	|-- StringParser.py
|	|-- flaskApi.py



MEDIA
|- Twitter
|  |- Creator 1
|  |- Creator 2
|  |- Creator 3
|- Patreon
|- Danbooru
|- Reddit
|- 
|- 



### On Tags

// EXAMPLES
General: #StellarBlade #Rule34 #d.va #Overwatch
Creator: #CalamariCakes #fpsblyck
Site: #Twitter #Reddit


// TYPES
- creator/artist (group)
- site/platform (source)
- CONTENT TAGS
  - character
  - game/show/movie
  - general tags
- USER
  - favourite
  - CUSTOM



### sort / filter / view

SORT:
- date added
- date uploaded
- likes

FILTER:
- media
- favourites
- 

VIEW:
- list
- grid




###


twitter		1234
reddit		 142
youtube		 995
...
