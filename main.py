from typing import Any
import argparse
import os
import time
from util.string_parser import StringParser # replace with MattThePerson_CustomLibs

from app_state import AppState
import fun.fun as fun
import fun.load as load


### GLOBALS ###

SCRIPT_DIR = os.path.dirname(__file__)
SETTINGS_FN = os.path.join( SCRIPT_DIR, 'data/settings.json' )
POST_DATA_FN = os.path.join( SCRIPT_DIR, 'data/saved_posts.json' )


state = AppState(SETTINGS_FN, POST_DATA_FN)


def main(args: argparse.Namespace):

    load.load_nltk()

    # read settings
    if state.settings.isEmpty():
        fun.initialize_settings(state.settings)
    
    state.media_dirs = [ fun.linuxify_path(f) for f in state.settings.getValue('media_folders') if not f.startswith('!') ]
    state.filename_parser = StringParser(state.settings.getValue('filename_formats'))

    # scan dirs for posts
    print('Fetching media from media folders ...')
    start = time.time()
    media_paths: list[str] = load.get_media_from_dirs(state.media_dirs)
    print('Loaded {:_} media from {} base folders in {:.1f} sec'.format(len(media_paths), len(state.media_dirs), time.time()-start))
    
    # filter media
    if args.filters:
        media_paths = fun.filter_strings(media_paths, args.filters, args.union_mode)
    
    # generate media objects from media paths
    print('Generating post objects for {:_} media ...'.format(len(media_paths)))
    start = time.time()
    state.media_objects = load.load_media_objects(media_paths, state.media_dirs, state.saved_media_objects.jsonObject, state.filename_parser, redo=args.redo_media_extract)
    print('saving media objects ...')
    fun.save_media_objects(state.media_objects, state.saved_media_objects)
    print('Done. Took {:.1f} sec'.format(time.time()-start))
    
    # filter small media objects (eg. 'image does not exist' images)
    before_size = len(state.media_objects)
    state.media_objects = { rel_path: obj for rel_path, obj in state.media_objects.items() if obj.get('filesize_bytes', 0) > 1024 }
    print('Removed {:_}/{:_} ({:.1f}%) media objects that were too small'.format( before_size-len(state.media_objects), before_size, (before_size-len(state.media_objects))/before_size*100 ))
    
    # PRINT OUT POST OBJECTS (AND PAUSE) ##
    if args.print_posts:
        import random
        random.seed(0)
        POSTS = [ v for v in state.media_objects.values() ]
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
        state.media_dirs = [sfw_media_dir] # type: ignore
        state.media_objects = load.make_posts_sfw(state.media_objects, sfw_media_dir) # type: ignore
    
    # generate posts from media objects (basically combine media from same post)
    state.posts = load.generate_post_objects(list(state.media_objects.values()))
    
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
