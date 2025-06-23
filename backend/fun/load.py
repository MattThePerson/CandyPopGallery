""" Functions for loading and pre-processing media """
import os
from pathlib import Path

from handymatt import StringParser

from .post_data import extract_post_data



# 
def get_media_path_tuples_from_dirs(dirs: list[str], media_extensions: list[str]) -> list[tuple[str, str]]:
    """ Get media files from a list of directories """
    files: list[tuple[Path, str]] = []
    for i, base_dir in enumerate(dirs):
        print('Scanning media dirs ({}/{}) "{}"'.format(i+1, len(dirs), base_dir), end='')
        if not os.path.exists(base_dir):
            print('  ... WRONG PATH')
        else:
            newfiles = [ (f, base_dir) for f in Path(base_dir).rglob('*') ]
            print('  ... found {:_} media'.format(len(newfiles)))
            files.extend(newfiles) # type: ignore
    files_str = [ (str(f), parent_dir) for (f, parent_dir) in files if (f.suffix in media_extensions) ]
    # files_str = [ f for f in files_str if os.path.getsize(f) >= 1024 ] # filter filesize
    return files_str


def _get_post_id_from_filename(fn):
    """ Assumes id can be like this `filename [id].ext` or this `filename [id] #Tag1.ext` """
    parts = fn.split('].')
    if '] #' in fn:
        parts = fn.split('] #') # 
    if len(parts) == 1:
        return fn
    partial_str = parts[-2]
    if '[' not in partial_str:
        return fn
    return partial_str.split('[')[-1]

# 
def group_media_paths_into_posts(media_path_tuples: list[tuple[str, str]]) -> dict[str, list[tuple[str, str]]]:
    post_media: dict[str, list] = {}
    for idx, (path, parent_dir) in enumerate(media_path_tuples):
        post_id = _get_post_id_from_filename(path)
        paths_arr = post_media.get(post_id, [])
        paths_arr.append((path, parent_dir))
        post_media[post_id] = paths_arr
    return post_media


#
def generate_or_load_post_objects(post_media_paths: dict[str, list[tuple[str, str]]], existing_post_objects: dict[str, dict], parser: StringParser, redo: bool=False) -> dict[str, dict]:
    """ For 'unloaded' posts (just a list of filepaths), finds post from existing posts or generates post objects """
    posts: dict[str, dict] = {}
    extractions_count = 0
    for idx, (post_id, media_path_tuples) in enumerate(post_media_paths.items()):
        print('\rLoading/Generating posts ({:_}/{:_}) ({:.1f}%) |[{:<75}]|     '.format( idx+1, len(post_media_paths), ((idx+1)/len(post_media_paths)*100), post_id ), end='')
        obj = existing_post_objects.get(post_id)
        if obj is None or redo:
            obj = extract_post_data(post_id, media_path_tuples, parser)
            extractions_count += 1
        posts[post_id] = obj
    print('\nDone. Extracted data for {:_}/{:_} post objects'.format(extractions_count, len(post_media_paths)))
    return posts


# 
def combine_loaded_and_existing_posts(loaded: dict[str, dict], existing: dict[str, dict]) -> dict[str, dict]:
    """ Combined existing and loaded posts ensuring that posts that we're not loaded get flagged as not having linked media. """
    combined = {}
    for pid, obj in existing.items():
        obj['HAS_LINKED_MEDIA'] = False
        combined[pid] = obj
    for pid, obj in loaded.items():
        obj['HAS_LINKED_MEDIA'] = True
        combined[pid] = obj
    return combined




# TODO: Asses need to remove
def load_media_objects(media_paths: list[str], media_dirs: list[str], saved_posts_by_rel_path: dict[str, dict], parser: StringParser, redo: bool=False) -> dict:
    """ Given a list of media paths and saved posts,  """
    posts_dict = {}
    extractions_count = 0
    for idx, abs_path in enumerate(media_paths):
        media_dir = next((f for f in media_dirs if abs_path.startswith(f)), '')
        rel_path = abs_path.replace(media_dir, '')
        if idx%1 == 0:
            print('\rLoading posts ({:_}/{:_}) ({:.1f}%) |{:<75}|     '.format( idx+1, len(media_paths), ((idx+1)/len(media_paths)*100), rel_path[:73] ), end='')
        post = saved_posts_by_rel_path.get(rel_path) # get post from pre-existing posts
        # print(post is None)
        if post is None or redo:
            post = {} #extract_media_data(idx, rel_path, abs_path, parser)
            extractions_count += 1
        posts_dict[rel_path] = post
    print('\nDone. Extracted data for {:_}/{:_} media_objects'.format(extractions_count, len(media_paths)))
    return posts_dict


# TODO: Assess need to remove
def combine_media_objects_into_post_objects(media_objects: list[dict]) -> dict[str, dict]:
    """ Combine media objects into post objects. """

    posts: dict[str, dict] = {}
    
    media_object_keys = ['media_id', 'src', 'filename', 'media_type', 'filesize_bytes', 'suffix']
    
    for media_obj in media_objects:
        post_id = media_obj.get('post_id', 'None') # 'None' to ignore the fucking strict type checking
        post: dict | None = posts.get(post_id)
        if post is None:
            post = {}
            for key, value in media_obj.items():
                if key not in media_object_keys:
                    post[key] = value
            post['media_count'] = 0
            post['media_objects'] = []
        
        pruned_media_object = { k: media_obj[k] for k in media_object_keys }
        post_media_objects = post.get('media_objects', [])
        post_media_objects.append(pruned_media_object)
        post_media_objects.sort(key=lambda obj: obj['media_id']) # type: ignore
        post['media_objects'] = post_media_objects
        post['media_count'] += 1
        
        posts[post_id] = post
        
    return posts




