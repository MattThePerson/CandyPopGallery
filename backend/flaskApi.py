from typing import Any
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import argparse
import os
# from pathlib import Path
import time
from util.json_handler import JsonHandler
from util.string_parser import StringParser
import fun.FlaskFunctions as ff


app = Flask(__name__)
CORS(app)

@app.route("/")
def API_home():
    print("Blank request recieved")
    return jsonify({'message': 'Hello, CORS enabled!'}), 200

# @app.route("/get-tags")
# def API_get_tags():
#     tags_data = ff.get_tag_amounts(list(gl.posts.values()))
#     if tags_data == None:
#         return jsonify('Unable to process tags'), 500
#     return jsonify(tags_data), 200

# @app.route("/get-posts")
# def API_get_posts():
#     filtered = ff.filter_posts(list(gl.posts.values()), request.args)
#     return jsonify(filtered), 200

@app.route("/make-query")
def API_make_query():
    # gl.last_request = request.args
    filtered = ff.filter_posts(list(gl.posts.values()), request.args)
    sources_fmt, creators_fmt, tags_fmt = ff.get_tags_and_amounts(filtered)
    return jsonify({
        'posts': filtered,
        'sources': sources_fmt,
        'creators': creators_fmt,
        'tags': tags_fmt
    }), 200
    
    
@app.route('/media/<path:filename>')
def API_get_media(filename: str):
    for mediadir in gl.media_dirs:
        print('\nDIR: ', os.path.exists(mediadir))
        print('fn:', filename)
        print('file exists:', os.path.exists( os.path.join(mediadir, filename) ))
        if os.path.exists( os.path.join(mediadir, filename) ):
            return send_from_directory(mediadir, filename)
    print('[WARNING] Media not found in {} mediadirs "{}"'.format(len(gl.media_dirs),filename))
    return send_from_directory('...', '...')


### GLOBALS ###

SCRIPT_DIR = os.path.dirname(__file__)
SETTINGS_FN = os.path.join( SCRIPT_DIR, 'data/settings.json' )
POST_DATA_FN = os.path.join( SCRIPT_DIR, 'data/saved_posts.json' )

class NameSpace:
    media_paths: list[str] = []
    media_dirs: list[str] = []
    posts: dict[str, Any] = {}
    settings = JsonHandler(SETTINGS_FN, prettify=True, readonly=True)
    saved_posts = JsonHandler(POST_DATA_FN, prettify=True)
    filename_parser: StringParser | None = None
    
    last_request: dict[str, Any] = {} # last post reqest
    # last_filtered: 
    
    
gl = NameSpace()


# MAIN
def main(args: argparse.Namespace):

    # read settings
    if gl.settings.isEmpty():
        ff.initialize_settings(gl.settings)
    
    gl.media_dirs = [ ff.linuxify_path(f) for f in gl.settings.getValue('media_folders') ]
    gl.filename_parser = StringParser(gl.settings.getValue('filename_formats'))

    # scan dirs for posts
    print('[MAIN:SCAN] Fetching media from media folders ...')
    start = time.time()
    media_paths = ff.get_media_from_dirs(gl.media_dirs)
    print('[MAIN:SCAN] Loaded {:_} media from {} base folders in {:.1f} sec'.format(len(media_paths), len(gl.media_dirs), time.time()-start))
    
    # generate post objects from media paths
    print('[MAIN:PROCESS] Generating post objects for {:_} media ...'.format(len(media_paths)))
    start = time.time()
    gl.posts = ff.load_media_objects(media_paths, gl.media_dirs, gl.saved_posts.jsonObject, gl.filename_parser, redo=args.redo_media_extract)
    print('saving posts ...')
    for src, post in gl.posts.items():
        gl.saved_posts.setValue(src, post, nosave=True)
    gl.saved_posts.save()
    print('[MAIN:PROCESS] Done. Took {:.1f} sec'.format(time.time()-start))
    
    ## PRINT OUT POST OBJECTS (AND PAUSE) ##
    if args.print_posts:
        import random
        random.seed(0)
        POSTS = [ v for v in gl.posts.values() ]
        random.shuffle(POSTS)
        print()
        for i in range(args.print_posts):
            post = POSTS[i]
            print('\n  ({}) "{}"'.format(i+1, post['src']))
            for k, v in post.items():
                print('{:<20}:  {}'.format(k, v))
        print()
        input('...')
    
    # [OPTIONAl] Replace media srcs with SFW alternatives
    if args.safe_for_work:
        print('[MODE] Replacing SRCs with SFW media ...')
        sfw_media_dir = ff.linuxify_path('C:/Users/stirl/Downloads/media')
        gl.media_dirs = [sfw_media_dir] # type: ignore
        gl.posts = ff.make_posts_sfw(gl.posts, sfw_media_dir) # type: ignore
    

    if not args.nostart:
        print('[MAIN] Starting Flask Server ...')
        port = args.port if args.port else 5002
        app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', help='Port to start flask api on', type=int)
    parser.add_argument('-um', '--update_mode', action='store_true', help='Update loaded media when change occurs in media dirs')
    parser.add_argument('-sfw', '--safe_for_work', action='store_true', help='SFW mode, replace post SRCs with SFW media')
    parser.add_argument('-nostart', action='store_true', help='Dont start flask server')
    parser.add_argument('-rme', '--redo-media-extract', action='store_true', help='Redoes extracting (parsing and scanning) of media objects (posts)')
    
    parser.add_argument('-print_posts', help='Print post objects before starting server', type=int)
    
    args = parser.parse_args()
    print()
    try:
        main(args)
    except KeyboardInterrupt:
        print('\n\n[INTERRUPT] Stopping server ...')
    print()
