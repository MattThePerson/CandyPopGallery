""" Functions for loading and pre-processing media """
import os
from pathlib import Path
from typing import Any
from datetime import datetime
import nltk # type: ignore
import time

from handymatt import StringParser

from .metadata_handling import metadata_load_with_id, combine_metadata
from .metadata_standarding import standardize_metadata
from .fun import filter_strings
from config import FILENAME_PARSER
import backend.db as db


Global_Stopwords_End = []
Global_Source_ID = 0


def scan_media_libraries(media_dirs: list[str]) -> None:
    """ Scans media from media dirs, loads post objects, and saves to db """
    
    print_posts: int|bool = False
    redo_media_extract = False
    filters = []
    union_mode = False # for filters
    
    load_nltk_stopwords()
    
    # scan dirs for posts
    print('Fetching media from media folders ...')
    start = time.time()
    media_paths: list[str] = get_media_from_dirs(media_dirs)
    print('Loaded {:_} media from {} base folders in {:.1f} sec'.format(len(media_paths), len(media_dirs), time.time()-start))
    
    # filter media
    if filters:
        media_paths = filter_strings(media_paths, filters, union_mode)
    
    # generate media objects from media paths
    print('Generating post objects for {:_} media ...'.format(len(media_paths)))
    start = time.time()
    saved_posts = db.read_table_as_dict('posts')
    saved_posts_by_rel_path = {} # { obj['rel_path']: obj for obj in saved_posts.values() }
    media_objects = load_media_objects(media_paths, media_dirs, saved_posts_by_rel_path, FILENAME_PARSER, redo=redo_media_extract)

    # filter small media objects (eg. 'image does not exist' images)
    before_size = len(media_objects)
    media_objects = { rel_path: obj for rel_path, obj in media_objects.items() if obj.get('filesize_bytes', 0) > 1024 }
    if len(media_objects) < before_size:
        print('Removed {:_}/{:_} ({:.1f}%) media objects that were too small'.format( before_size-len(media_objects), before_size, (before_size-len(media_objects))/before_size*100 ))
    
    # generate posts from media objects (basically combine media from same post)
    post_objects = generate_post_objects(list(media_objects.values()))
    print('Generated {:_} post objects'.format(len(post_objects)))
    
    # save to db
    db.write_objects_to_db(post_objects, 'posts')
    

    # DEBUGGING
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


# 
def load_nltk_stopwords():
    """  """
    global Global_Stopwords_End
    nltk.download('stopwords') # type: ignore
    Global_Stopwords_End = nltk.corpus.stopwords.words('english')


# 
def get_media_from_dirs(dirs: list[str]) -> list[str]:
    """ Get media files from a list of directories """
    MEDIA_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.webm']
    files: list[Path] = []
    for i, base_dir in enumerate(dirs):
        print('Scanning media dirs ({}/{}) "{}"'.format(i+1, len(dirs), base_dir), end='')
        if not os.path.exists(base_dir):
            print('  ... WRONG PATH')
        else:
            newfiles = [ f for f in Path(base_dir).rglob('*') ]
            print('  ... found {:_} media'.format(len(newfiles)))
            files.extend(newfiles) # type: ignore
    files_str = [ str(f) for f in files if (f.suffix in MEDIA_EXTENSIONS) ]
    # files_str = [ f for f in files_str if os.path.getsize(f) >= 1024 ] # filter filesize
    return files_str



# 
def load_media_objects(media_paths: list[str], media_dirs: list[str], saved_posts_by_rel_path: dict[str, dict], parser: StringParser, redo: bool=False) -> dict[str, Any]:
    """ Given a list of media paths and saved posts,  """
    posts_dict: dict[str, Any] = {}
    extractions_count = 0
    for idx, abs_path in enumerate(media_paths):
        media_dir = next((f for f in media_dirs if abs_path.startswith(f)), '')
        rel_path = abs_path.replace(media_dir, '')
        if idx%1 == 0:
            print('\rLoading posts ({:_}/{:_}) ({:.1f}%) |{:<75}|     '.format( idx+1, len(media_paths), ((idx+1)/len(media_paths)*100), rel_path[:73] ), end='')
        post = saved_posts_by_rel_path.get(rel_path) # get post from pre-existing posts
        # print(post is None)
        if post is None or redo:
            post = _extract_media_data(idx, rel_path, abs_path, parser)
            extractions_count += 1
        posts_dict[rel_path] = post
    print('\nDone. Extracted media for {:_}/{:_} media_objects'.format(extractions_count, len(media_paths)))
    return posts_dict


# 
def generate_post_objects(media_objects: list[dict[str, Any]]) -> dict[str, Any]:
    """ Combine media objects into post objects. """
    posts: dict[str, Any] = {}
    
    for obj in media_objects:
        post_id = obj.get('post_id', 'None') # 'None' to ignore the fucking strict type checking
        post: dict[str, Any] | None = posts.get(post_id)
        if post == None:
            post = {}
            for key, value in obj.items():
                if key not in ['media_id', 'src', 'filename']:
                    post[key] = value
            post['media_count'] = 0
            post['media_objects'] = []
        
        new_obj = {
            'media_id': obj.get('media_id'),
            'src': obj.get('src'),
            'filename': obj.get('filename'),
        }
        post_media_objects = post.get('media_objects', [])
        post_media_objects.append(new_obj)
        post_media_objects.sort(key=lambda obj: obj['media_id']) # type: ignore
        post['media_objects'] = post_media_objects
        post['media_count'] += 1
        posts[post_id] = post
        
    return posts



# 
def make_posts_sfw(posts: dict[str, Any], sfw_media_dir: str):
    import random
    sfw_media = get_media_from_dirs([sfw_media_dir])
    sfw_media = [ f.replace(sfw_media_dir, '') for f in sfw_media ]
    random.shuffle(sfw_media)
    i = 0
    for post in posts.values():
        post['src'] = sfw_media[i]
        i += 1
        if i >= len(sfw_media):
            i = 0
            random.shuffle(sfw_media)
    return posts


#endregion

#region - PRIVATE FUNCS ------------------------------------------------------------------------------------------------

# 
def _extract_media_data(idx: int, rel_path: str, abs_path: str, parser: StringParser):
    global Global_Source_ID
    parents, stem, suffix = path_components(rel_path)
    source = parents[0] if len(parents) > 0 else 'SOURCE_UNKNOWN'
    creator = parents[1] if len(parents) > 1 else 'CREATOR_UNKNOWN'
    
    post: dict[str, Any] = {
        'post_id': None,
        'media_id': None,
        'source_id': None,
        'secondary_source_id': None,
        'item_num': 0,
        'src': rel_path,
        'url': None,
        'source': source,
        'creator': creator,
        'author': None,
        'date_uploaded': None,
        'date_downloaded': datetime.fromtimestamp(os.path.getmtime(abs_path)).strftime('%Y:%m:%d %H:%M:%S'),
        'filesize_bytes': os.path.getsize(abs_path),
        'title': None,
        'filename': stem + suffix,
        'suffix': suffix,
        'media_type': get_media_type(suffix),
        'upvotes': -1,
        'downvotes': -1,
        'views': -1,
    }
    
    filename_data = parse_data_from_stem(stem, parser)
    metadata = get_file_metadata(abs_path, filename_data.get('source_id'), filename_data.get('secondary_source_id'))
    metadata = standardize_metadata(metadata, source)
    
    for data_dict in [ filename_data, metadata ]:
        if data_dict:
            for k, v in data_dict.items():
                post[k] = v
    
    if 'reddit' in source and not creator.startswith('u_'):
        post['creator'] = 'r/' + post['creator']
    
    if post['source_id'] == None:
        post['source_id'] = Global_Source_ID
        Global_Source_ID += 1
    
    post['post_id'] = get_post_id(post) # requires source_id
    post['media_id'] = get_media_id(post)
    post['url'] = get_post_url(post)

    # ORGANIZE TAGS
    meta_tags =     make_combined_list_from_params(post, ['source', 'creator', 'author', 'artist'])
    proper_tags =   make_combined_list_from_params(post, [
                        'tags', 'suffix_tags', 'custom_tags',
                        'tags_artist', 'tags_character', 'tags_copyright', 'tags_general', 'tags_metadata', # rule34
                        'categories', 'pornstars', 'characters', 'sources'
    ])
    improper_tags = make_combined_list_from_params(post, ['tags_from_title', 'tags_from_content'])
    
    ignore_tags = ['[delete]']
    post['meta_tags'] = [ t for t in set(meta_tags) if t not in ignore_tags ]
    post['proper_tags'] = [ t for t in set(proper_tags) if t not in ignore_tags ]
    post['improper_tags'] = [ t for t in set(improper_tags) if t not in ignore_tags ]
    
    return post


# get metadata for media
def get_file_metadata(abs_path: str, id_primary: str|None, id_secondary: str|None=None) -> dict[str, Any]:

    if id_primary == None:
        return {}
    
    metadata = metadata_load_with_id(abs_path, id_primary)
    id_comments = f'{id_primary}-comments'
    comments_dict = metadata_load_with_id(abs_path, id_comments, use_shared_metadata=False)
    metadata = combine_metadata(metadata, comments_dict)
    if id_secondary:
        metadata_sec = metadata_load_with_id(abs_path, id_secondary)
        metadata = combine_metadata(metadata, metadata_sec)
    
    return metadata



# parses post data from stem
def parse_data_from_stem(stem: str, parser: StringParser) -> dict[str, Any]:
    data = parser.parse(stem)
    if data == None:
        return {}
    if 'source_id_TwitterSeleniumScraped' in data:
        data['source_id'] = data['source_id_TwitterSeleniumScraped'].replace(' photo ', '-')
    if 'date_uploaded_dt' in data:
        data['date_uploaded'] = data['date_uploaded_dt'].split('T')[0]
    data['suffix_tags'] = data.get('tags', [])
    del data['tags']
    data['tags_from_title'] = get_tags_from_title(data.get('title', ''))
    return data

# generates tags from title string
def get_tags_from_title(title: str, remove_stopwords: bool=True) -> list[str]:
    """ Returns list of tokens from a sentence. Removes stopwords """
    tags: list[str] = []
    
    for c in '-_#,()[].;:*':
        title = title.replace(c, ' ')
    title_chars = [ c for c in title.lower() if c.isalnum() or c == ' ' ] # removes uncommen (non alphanumeric) chars
    title = ''.join(title_chars)
    
    words = [ w for w in title.split() if (len(w) > 2 and len(w) < 20 and not w.isnumeric()) ]
    if remove_stopwords:
        words = [ w for w in words if w not in Global_Stopwords_End ]
    
    bigram_words = [ '-'.join(bg) for bg in nltk.bigrams(words) ] # type: ignore
    tags = words + bigram_words
    
    return tags



# 
def get_media_type(suff: str) -> str:
    if suff.lower() in ['.gif']: # HUOM: Some 'webp' can be gifs!!
        return 'gif'
    elif suff.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
        return 'image'
    elif suff.lower() in ['.mp4', '.webm']:
        return 'video'
    return 'UNKNOWN_MEDIA'


# 
def get_media_id(post_data: dict[str, Any]):
    id_ = '{}-{}'.format( post_data.get('source'), post_data.get('source_id') )
    num = int(post_data.get('item_num', 0))
    if num > 0:
        id_ = f'{id_}-{num}'
    return id_

def get_post_id(post_data: dict[str, Any]):
    id_ = '{}-{}'.format( post_data.get('source'), post_data.get('source_id') )
    return id_

def get_post_url(post_data: dict[str, Any]):
    site_format: dict[str|None, Any] = {
        'reddit': 'https://www.reddit.com/r/_/comments/{}',
        'redgifs': 'https://www.redgifs.com/watch/{}',
        'twitter': 'https://x.com/_/status/{}',
        'bluesky': '',
        'instagram': 'https://www.instagram.com/_/p/{}',
        '3dhentai': '',
        'danbooru': '',
        'rule34': 'https://rule34.xxx/index.php?page=post&s=view&id={}'
    }
    source, source_id = post_data.get('source'), post_data.get('source_id')
    url_format = site_format.get(source)
    if url_format and source_id:
        url = url_format.format(source_id)
        return url
    return None


#### INTERNAL HELPERS ####

# gets the components of a path (parent, stem and suffix)
def path_components(path: str) -> Any:
    from pathlib import Path
    obj = Path(path)
    stem = obj.stem
    suffix = obj.suffix
    parents = [ p for p in str(obj.parent).split('/') if p != '' ]
    return parents, stem, suffix

def make_combined_list_from_params(obj: dict[str, Any], param_list: list[str]) -> list[str]:
    arr: list[str] = []
    for param in param_list:
        value = obj.get(param)
        if value:
            if not isinstance(value, list):
                value = [value]
            arr.extend(value) # type: ignore
    return arr
