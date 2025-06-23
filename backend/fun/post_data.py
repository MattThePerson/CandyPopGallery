from typing import Any
import os
from datetime import datetime
import nltk # type: ignore

from handymatt import StringParser

from .metadata_handling import metadata_load_with_id, combine_metadata
from .metadata_standarding import standardize_metadata


Global_Post_ID = 0
Global_Stopwords_End = None


def extract_post_data(post_id: str, media_path_tuples: list[tuple[str, str]], parser: StringParser) -> dict[str, Any]:
    """ Given post_id and list of media paths, extracts data from filenames and metdata and generates post object """
    global Global_Post_ID
    if media_path_tuples is []:
        raise Exception(f'Post with id "{post_id}" has no media_paths')

    (first_item_abs_path, parent_dir) = media_path_tuples[0] # media path is a tuple of [path, parent_dir]
    first_item_rel_path = first_item_abs_path.replace(parent_dir, '')
    post_parents, first_item_stem, _ = path_components(first_item_rel_path)
    post_source = post_parents[0] if len(post_parents) > 0 else 'SOURCE_UNKNOWN'
    creator = post_parents[1] if len(post_parents) > 1 else 'CREATOR_UNKNOWN'
    
    # [PARSE FILENAME]
    filename_data = parse_data_from_stem(first_item_stem, parser)
    source_id = filename_data.get('source_id')
    
    global_post_id = None
    if source_id is None:
        global_post_id = str(Global_Post_ID)
        Global_Post_ID += 1
    
    # [METADATA] get data from local .json files
    metadata = {}
    if source_id is not None:
        secondary_source_id = filename_data.get('secondary_source_id')
        metadata = get_file_metadata(first_item_abs_path, source_id, secondary_source_id)
        metadata = standardize_metadata(metadata, post_source)
    
    # [MINIMAL SCHEMA]
    post: dict[str, Any] = {
        'post_id': post_id if post_id else global_post_id,
        'source_id': source_id,
        'secondary_source_id': filename_data.get('secondary_source_id'),
        'url': construct_post_url(post_source, source_id),
        'source': post_source,
        'creator': creator,
        'author': None,
        'date_uploaded': None,
        'date_downloaded': datetime.fromtimestamp(os.path.getmtime(first_item_abs_path)).strftime('%Y:%m:%d %H:%M:%S'), # download date of first file
        'title': None,
        'upvotes': -1,
        'downvotes': -1,
        'views': -1,
        'media_count': len(media_path_tuples),
        'media_objects': [],
    }

    # [ADD] combine metadata
    for data_dict in [ filename_data, metadata ]:
        if data_dict:
            for k, v in data_dict.items():
                post[k] = v
    
    # [MEDIA OBJECTS] generate
    media_objects = []
    for (abs_path, parent_dir) in media_path_tuples:
        rel_path = abs_path.replace(parent_dir, '')
        _, stem, suffix = path_components(rel_path)
        item_num = parse_data_from_stem(stem, parser).get('item_num', -1)
        obj = {
            'media_id': get_media_id(post_id, item_num),
            'item_num': item_num,
            'src': rel_path,
            'filename': stem + suffix,
            'suffix': suffix,
            'media_type': get_media_type(suffix),
            'filesize_bytes': os.path.getsize(abs_path),
        }
        media_objects.append(obj)
    post['media_objects'] = media_objects
    
    # Handle edge cases
    if 'reddit' == post_source and not creator.startswith('u_'):
        post['creator'] = 'r/' + post['creator']
    
    # [TAGS] Organize
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
    global Global_Stopwords_End
    if Global_Stopwords_End is None:
        Global_Stopwords_End = _load_nltk_stopwords()
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
def get_media_id(post_id: str, item_num: int) -> str:
    if item_num == -1: # single media for post
        return f"{post_id}-{item_num}"
    return post_id


def construct_post_url(source: str, source_id: str|None) -> str|None:
    if source_id is None:
        return None
    site_format: dict[str|None, Any] = {
        'reddit': 'https://www.reddit.com/r/_/comments/{}',
        'redgifs': 'https://www.redgifs.com/watch/{}',
        'twitter': 'https://x.com/_/status/{}',
        'bluesky': '',
        'instagram': 'https://www.instagram.com/_/p/{}',
        '3dhentai': 'https://3dhentai.co/', # TODO: check it it works lol
        'danbooru': '',
        'rule34': 'https://rule34.xxx/index.php?page=post&s=view&id={}'
    }
    # source, source_id = post_data.get('source'), post_data.get('source_id')
    url_format = site_format.get(source)
    if url_format and source_id:
        url = url_format.format(source_id)
        return url
    return None


# HELPERS

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


# 
def _load_nltk_stopwords():
    nltk.download('stopwords') # type: ignore
    return nltk.corpus.stopwords.words('english')

