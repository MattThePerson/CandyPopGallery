import time

from .fun.load import get_media_path_tuples_from_dirs, group_media_paths_into_posts, generate_or_load_post_objects, combine_loaded_and_existing_posts
# from .fun.load import load_media_objects, combine_media_objects_into_post_objects
from .util import db
from config import FILENAME_PARSER, MEDIA_EXTENSIONS


def scan_media_libraries(media_dirs: list[str]) -> None:
    """ Scans media from media dirs, loads post objects, and saves to db """
    
    # [DEBUG Controls]
    print_posts: int|bool = False
    redo_data_extract = False
    filters = []
    union_mode = False # for filters
    
    # [STEP 1] scan dirs for posts
    print('[SCAN] Fetching media from media folders ...')
    start = time.time()
    media_path_tuples: list[tuple[str, str]] = get_media_path_tuples_from_dirs(media_dirs, MEDIA_EXTENSIONS)
    print('[SCAN] Scanned {:_} media files from {} base folders in {:.1f} sec'.format(len(media_path_tuples), len(media_dirs), time.time()-start))
    
    # [DEBUGGING] filter media
    # if filters:
    #     media_paths = filter_strings(media_path_tuples, filters, union_mode)
    
    # [STEP 2] group media paths by id
    post_media_paths = group_media_paths_into_posts(media_path_tuples)
    print("[GROUPED] Grouped files into {:_} posts".format(len(post_media_paths)))
    
    # [STEP 3] Generate/Load post objects
    existing_post_objects = db.read_table_as_dict('posts')
    print("[LOAD] Loading/Generating posts")
    start = time.time()
    loaded_post_objects = generate_or_load_post_objects(post_media_paths, existing_post_objects, parser=FILENAME_PARSER, redo=redo_data_extract)
    print('[LOAD] loaded {:_} posts in {:.1f} sec ({:.3f} ms/post)'.format(len(loaded_post_objects), (time.time()-start), ((time.time()-start)*1000/len(loaded_post_objects))))
    combined_post_objects = combine_loaded_and_existing_posts(loaded_post_objects, existing_post_objects)
    print("[COMBINE] Combined posts with saved posts (total {:_})".format(len(combined_post_objects)))
    db.write_objects_to_db(combined_post_objects, 'posts')
    
    return
    
    # [STEP 2] generate media objects from media paths
    print('[] Generating post objects for {:_} media ...'.format(len(media_paths)))
    start = time.time()
    saved_posts = db.read_table_as_dict('posts')
    saved_posts_by_rel_path = {} # { obj['rel_path']: obj for obj in saved_posts.values() }
    media_objects = load_media_objects(media_paths, media_dirs, saved_posts_by_rel_path, FILENAME_PARSER, redo=redo_media_extract)

    # filter small media objects (eg. 'image does not exist' images)
    before_size = len(media_objects)
    media_objects = { rel_path: obj for rel_path, obj in media_objects.items() if obj.get('filesize_bytes', 0) > 1024 }
    if len(media_objects) < before_size:
        print('Removed {:_}/{:_} ({:.1f}%) media objects that were too small'.format( before_size-len(media_objects), before_size, (before_size-len(media_objects))/before_size*100 ))
    
    # [STEP 3] generate post objects from media objects
    post_objects = combine_media_objects_into_post_objects(list(media_objects.values()))
    print('Generated {:_} post objects'.format(len(post_objects)))
    db.write_objects_to_db(post_objects, 'posts')
    

    # [DEBUGGING] Print posts
    if print_posts:
        import random
        random.seed(0)
        POSTS = [ v for v in media_objects.values() ]
        random.shuffle(POSTS)
        print()
        for i, post in enumerate(POSTS[:print_posts]):
            print('  ({}) "{}"'.format(i+1, post['src']))
            if args.print_verbose:
                for k, v in post.items():
                    print('{:<20}:  {}'.format(k, v))
                print()
        print()
        input('...')



#region - HELPERS ------

def filter_strings(strings: list[str], filters: list[str], union_mode: bool) -> list[str]:
    if not union_mode:
        for filt in filters:
            strings = [ pth for pth in strings if filt in pth.lower() ]
    else:
        cumulative: list[str] = []
        for filt in filters:
            cumulative.extend([ pth for pth in strings if filt in pth.lower() ])
        strings = cumulative
    return strings
