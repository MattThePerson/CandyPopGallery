# CandyPopGallery

A web-based viewer for local images, GIFs and videos downloaded from Reddit, Twitter, Instagram, etc.

## Features

- user interactions:
    - add user tags to posts
    - save posts to collection
    - save search (combination of filters and options)
    - search communities (community - platform)
    - add tags/description to community

## Expanded Description

The idea is that I have a large collection of organized media downloaded from various websites or sources and organized into 'posts'. Each post can have multiple media (images, GIFs, or videos) and has associated metadata, such as date uploaded (and downloaded), title, description, etc. Each post also has a list of tags, which come in two categories: proper tags and improper tags. Proper tags are things like hashtags or content tags (eg. #DigitalArt), and improper tags are extracted/generated from assiciated text (eg. 'digital-art'). The posts are organized by platform and community, where platform can the the site (Twitter) and community can either be the uploader/user or something like a subreddit. 

The app has two main view modes: Posts view and Media view. In posts view, the user can search, filter, and sort all the posts. The posts can be viewed in a number of different styles, including Feed view (like a Reddit feed), a grid view (like Twitter's media tab), column/row view (dynamically placed in row or column), and list view (where more of the metadata of the post is visible). When a post is clicked on, the posts view page opens as an overlay, and the full metadata of the post is visible and the media is larger. In the case of a gallery post, the media can be viewed as either a carousel or a column/row placement. The media can also be clicked on to open (yet another) overlay which shows the media larger. The media view functionality (both fullscreen and not) is optimized for user friendliness (eg. no fucking autoplay of videso if you dont want) and also for the diversity of media types. This includes GIFs (which can be paused/played by clicking on them), videos (with or without sound), landscape and portrait images, and also comic stips (basically very long images where it is important to be able to zoom in and navigate easily). 

When the post overlay is open, the feed from which the post was selected (defined by the filters, sortby option) is 'remembered', and the user can navigate forwards and backwards in the feed without needing to close the overlay. (This is how instagram works, although the user experience is not great espeically with regards to keyboard shortcuts. Also, twitters media tab could be dramatically improved with this functionality.) The post page can also be opened in a new tab (ie. not as an overlay) in which case the feed is not remembered. Similar posts to the one being viewed can be seen by scrolling down (and the view style can be selected from the same styles as the home feed). The similar (or recommended) posts would primarily be generated with a simple TF-IDF recommender system, although support for alternative systems (such as language model base recommenders) could be added. 

If a user likes a particular media, the media can be opened in a media view, where the metadata for the post (the "parent") can still be viewed, but only the single media is shown. In this view, similar/recommended media are shown based on attributes of the media itself. For example, an AI based solution using CLIP generated descriptions, or more simple features such as histogram or image similarity (using a hash function that is not sensitive to small changes). Additionally, exact matches to the viewed media can be seen, and the user can chose to aggregate all post metadata of all exactly matching media. 

The media can also be searched via the Media page, where (like with the Posts page) media can be filtered by platform/community/tags, sorted by date or likes, and further refined via search query. The search query can also be applied to CLIP generated descriptions. 

### About CLIP

I thought it would be cool to be able to search media via AI generated descriptions. However, one challenge may be that a lot of compute must be applied to the whole collection. It would be really cool to incorporate this into the app (especially the media recommender), but it should not be a given, but rather an additional feature which doesnt fundumentally break things if it doesn't exist.
