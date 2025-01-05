# from typing import Any
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

@app.route("/get-tags")
def API_get_tags():
    tags_data = ff.get_tag_amounts(ac.posts)
    if tags_data == None:
        return jsonify('Unable to process tags'), 500
    return jsonify(tags_data), 200

@app.route("/get-posts")
def API_get_posts():
    filtered = ff.filter_posts(ac.posts, request.args)
    return jsonify(filtered), 200

@app.route('/get-media/<path:filename>')
def API_get_media(filename: str):
    for mediadir in ac.media_dirs:
        if os.path.exists( os.path.join(mediadir, filename) ):
            return send_from_directory(mediadir, filename)
    return send_from_directory('...', '...')


### GLOBALS ###

SCRIPT_DIR = os.path.dirname(__file__)
SETTINGS_FN = os.path.join( SCRIPT_DIR, 'data/settings.json' )
POST_DATA_FN = os.path.join( SCRIPT_DIR, 'data/settings.json' )

ac = argparse.Namespace(
    media_paths = [],
    posts = [],
    settings = JsonHandler(SETTINGS_FN, prettify=True),
    post_data = JsonHandler(POST_DATA_FN, prettify=True),
    filename_parser = None,
)


# MAIN
def main(args: argparse.Namespace):

    # read settings
    if ac.settings.isEmpty():
        ff.initialize_settings(ac.settings)
    
    ac.media_dirs = [ ff.linuxify_path(f) for f in ac.settings.getValue('media_folders') ]
    ac.filename_parser = StringParser(ac.settings.getValue('filename_formats'))

    # scan dirs for posts
    print('[MAIN:SCAN] Fetching media from media folders ...')
    start = time.time()
    ac.media_paths = ff.get_media_from_dirs(ac.media_dirs)
    print('[MAIN:SCAN] Loaded {:_} media from {} base folders in {:.1f} sec'.format(len(ac.media_paths), len(ac.media_dirs), time.time()-start))
    
    # generate post objects from media paths
    print('[MAIN:PROCESS] Generating post objects from media ...')
    start = time.time()
    ac.posts = ff.generate_posts(ac.media_paths, ac.filename_parser)
    print('[MAIN:PROCESS] Done. Took {:.1f} sec'.format(time.time()-start))
    
    # [OPTIONAl] Replace media srcs with SWF alternatives
    if args.safe_for_work:
        print('[MODE] Replacing SRCs with SWF media ...')
        SFW_MEDIA_DIR = ff.linuxify_path('C:/Users/stirl/Downloads/media')
        ac.media_dirs = [SFW_MEDIA_DIR]
        ac.posts = ff.make_posts_swf(ac.posts, SFW_MEDIA_DIR)
    
    print('[MAIN] Starting Flask Server ...')
    port = args.port if args.port else 5002
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', help='Port to start flask api on', type=int)
    parser.add_argument('-um', '--update_mode', action='store_true', help='Update loaded media when change occurs in media dirs')
    parser.add_argument('-swf', '--safe_for_work', action='store_true', help='SWF mode, replace post SRCs with SWF media')
    
    args = parser.parse_args()
    print()
    try:
        main(args)
    except KeyboardInterrupt:
        print('\n\n[INTERRUPT] Stopping server ...')
    print()
