from typing import Any
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import argparse
import os
# from pathlib import Path
import time
from util.json_handler import JsonHandler
from util.string_parser import StringParser
import fun.flask_functions as ff
import fun.load as load
import fun.processing as proc




app = Flask(__name__)
CORS(app)

@app.route("/")
def API_home():
    print("Blank request recieved")
    return jsonify({'message': 'Hello, CORS enabled!'}), 200


""" 
Send posts with only following params:
- post_id
- source_id
- source
- creator
- media_type
- date_downloaded
- date_uploaded
- likes
- views
- upvote_ratio
- title
- media_count
- cover_src (the src of first media object)
"""
@app.route("/make-query")
def API_make_query():
    # gl.last_request = request.args
    filtered = proc.filter_posts(list(gl.posts.values()), request.args)
    sources_fmt, creators_fmt, tags_fmt = proc.get_tags_and_amounts(filtered)
    return jsonify({
        'posts': filtered,
        'sources': sources_fmt,
        'creators': creators_fmt,
        'tags': tags_fmt
    }), 200
    

@app.route('/media/<path:rel_path>')
def API_get_media(rel_path: str):
    for mediadir in gl.media_dirs:
        if os.path.exists( os.path.join(mediadir, rel_path) ):
            return send_from_directory(mediadir, rel_path)
    print('[WARNING] Media not found in {} mediadirs "{}"'.format(len(gl.media_dirs), rel_path))
    return send_from_directory('...', '...')


### GLOBALS ###

SCRIPT_DIR = os.path.dirname(__file__)
SETTINGS_FN = os.path.join( SCRIPT_DIR, 'data/settings.json' )
POST_DATA_FN = os.path.join( SCRIPT_DIR, 'data/saved_posts.json' )


class NameSpace:
    media_paths: list[str] = []
    media_dirs: list[str] = []
    media_objects: dict[str, Any] = {} # UNUSED AFTER INIT
    posts: dict[str, Any] = {}
    settings = JsonHandler(SETTINGS_FN, prettify=True, readonly=True)
    saved_media_objects = JsonHandler(POST_DATA_FN, prettify=True)
    filename_parser: StringParser | None = None
    
    # last_request: dict[str, Any] = {} # last post reqest

gl = NameSpace()




##############
#### MAIN ####
##############

def main(args: argparse.Namespace):

    load.load_nltk()

    # read settings
    if gl.settings.isEmpty():
        ff.initialize_settings(gl.settings)
    
    gl.media_dirs = [ ff.linuxify_path(f) for f in gl.settings.getValue('media_folders') if not f.startswith('!') ]
    gl.filename_parser = StringParser(gl.settings.getValue('filename_formats'))

    # scan dirs for posts
    print('Fetching media from media folders ...')
    start = time.time()
    media_paths: list[str] = load.get_media_from_dirs(gl.media_dirs)
    print('Loaded {:_} media from {} base folders in {:.1f} sec'.format(len(media_paths), len(gl.media_dirs), time.time()-start))
    
    # filter media
    if args.filters:
        media_paths = ff.filter_strings(media_paths, args.filters, args.union_mode)
    
    # generate media objects from media paths
    print('Generating post objects for {:_} media ...'.format(len(media_paths)))
    start = time.time()
    gl.media_objects = load.load_media_objects(media_paths, gl.media_dirs, gl.saved_media_objects.jsonObject, gl.filename_parser, redo=args.redo_media_extract)
    print('saving media objects ...')
    ff.save_media_objects(gl.media_objects, gl.saved_media_objects)
    print('Done. Took {:.1f} sec'.format(time.time()-start))
    
    # filter small media objects (eg. 'image does not exist' images)
    before_size = len(gl.media_objects)
    gl.media_objects = { rel_path: obj for rel_path, obj in gl.media_objects.items() if obj.get('filesize_bytes', 0) > 1024 }
    print('Removed {:_}/{:_} ({:.1f}%) media objects that were too small'.format( before_size-len(gl.media_objects), before_size, (before_size-len(gl.media_objects))/before_size*100 ))
    
    # PRINT OUT POST OBJECTS (AND PAUSE) ##
    if args.print_posts:
        import random
        random.seed(0)
        POSTS = [ v for v in gl.media_objects.values() ]
        random.shuffle(POSTS)
        print()
        for i, post in enumerate(POSTS[:args.print_posts]):
            print('  ({}) "{}"'.format(i+1, post['src']))
            if args.print_verbose:
                for k, v in post.items():
                    print('{:<20}:  {}'.format(k, v))
                print()
        print()
        input('...')
    
    # [OPTION] Replace media srcs with SFW alternatives
    if args.safe_for_work:
        print('[MODE] Replacing SRCs with SFW media ...')
        sfw_media_dir = ff.linuxify_path('C:/Users/stirl/Downloads/media')
        gl.media_dirs = [sfw_media_dir] # type: ignore
        gl.media_objects = load.make_posts_sfw(gl.media_objects, sfw_media_dir) # type: ignore
    
    # generate posts from media objects (basically combine media from same post)
    gl.posts = load.generate_post_objects(list(gl.media_objects.values()))
    
    if not args.nostart:
        print('[MAIN] Starting Flask Server ...')
        port = args.port if args.port else 5002
        app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', help='Port to start flask api on', type=int)
    parser.add_argument('-nostart', action='store_true', help='Dont start flask server')

    parser.add_argument('-um', '--update_mode', action='store_true', help='Update loaded media when change occurs in media dirs') # not really in use?
    parser.add_argument('-sfw', '--safe_for_work', action='store_true', help='SFW mode, replace post SRCs with SFW media')
    parser.add_argument('-re', '--redo-media-extract', action='store_true', help='Redoes extracting (parsing and scanning) of media objects (posts)')
    
    parser.add_argument('-print_posts', help='Print post objects before starting server', type=int)
    parser.add_argument('-print_verbose', action='store_true', help='(with -print_posts) Prints extracted info for printed media')
    parser.add_argument('-filters', help='Filters for which media to load')
    parser.add_argument('-union_mode', action='store_true', help='Union mode for filters (default: intercect mode)')
    
    args = parser.parse_args()
    print()
    try:
        main(args)
    except KeyboardInterrupt:
        print('\n\n[INTERRUPT] Stopping server ...')
    print()
