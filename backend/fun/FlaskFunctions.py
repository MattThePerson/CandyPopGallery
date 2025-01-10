import os
from pathlib import Path
from typing import Any
from util.json_handler import JsonHandler
from util.string_parser import StringParser
from datetime import datetime
import nltk # type: ignore
import fun.tags_extraction as te

nltk.download('stopwords') # type: ignore
STOPWORDS_ENG = nltk.corpus.stopwords.words('english')


### GENERAL FUNCS ###

def get_media_from_dirs(dirs: list[str]) -> list[str]:
    MEDIA_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4', '.m4v']
    files: list[Path] = []
    for i, base_dir in enumerate(dirs):
        print('Scanning folder ({}/{}) "{}"'.format(i+1, len(dirs), base_dir), end='')
        if not os.path.exists(base_dir):
            print('  ... WRONG PATH')
        else:
            newfiles = [ f for f in Path(base_dir).rglob('*') ]
            print('  ... found {:_} media'.format(len(newfiles)))
            files.extend(newfiles) # type: ignore
    files_str = [ str(f) for f in files if (f.suffix in MEDIA_EXTENSIONS) ]
    return files_str


# gets list of tags their occurance amounts
def get_tags_and_amounts(posts: list[dict[str, Any]]):
    sources_count: dict[str, int] = {}
    creators_count: dict[str, int] = {}
    tags_count: dict[str, int] = {}
    for post in posts:
        source = post.get('source')
        if source and isinstance(source, str):
            sources_count[source] = sources_count.get(source, 0) + 1
        creator = post.get('creator')
        if creator and isinstance(creator, str):
            creators_count[creator] = creators_count.get(creator, 0) + 1
        post_tags: list[str] = post.get('tags', [])
        if post_tags and isinstance(post_tags, list): # type: ignore
            for tag in post_tags:
                tags_count[tag] = tags_count.get(tag, 0) + 1
    sources:    list[dict[str, int]] =  [ {'name': key, 'amount': value} for key, value in sources_count.items() ] # type: ignore
    creators:   list[dict[str, int]] =  [ {'name': key, 'amount': value} for key, value in creators_count.items() ] # type: ignore
    tags:       list[dict[str, int]] =  [ {'name': key, 'amount': value} for key, value in tags_count.items() if (value > 10) ] # type: ignore
    return sources, creators, tags
    # return { "sources": sources_fmt, "creators": creators_fmt, "tags": tags_fmt }


def initialize_settings(settingsHandler: JsonHandler):
    settingsHandler.setValue('media_folders', [])
    settingsHandler.setValue('filename_formats', [])


### POST FILTERING ###

def filter_posts(posts: list[Any], args: dict[str, str]) -> list[Any]:

    if len(posts) == 0:
        return []
    
    sources =   [ t for t in args['sources'].split(',')     if t != '' ]
    creators =  [ t for t in args['creators'].split(',')    if t != '' ]
    tags =      [ t for t in args['tags'].split(',')        if t != '' ]

    # print(creators)

    filtered = posts.copy()
    filtered = [ p for p in filtered if sources == [] or p.get('source') in sources ]
    filtered = [ p for p in filtered if creators == [] or p.get('creator') in creators ]
    if args.get('tags_combine', '') == '&':
        filtered = [ p for p in filtered if tags == [] or containsAll(p.get('tags', []), tags) ]
    else:
        filtered = [ p for p in filtered if tags == [] or containsAny(p.get('tags', []), tags) ]
    return filtered


def containsAll(A: list[str], B: list[str]) -> bool:
    """ Returns True IFF list A contains all elements of list B """
    for x in B:
        if x not in A:
            return False
    return True


def containsAny(A: list[str], B: list[str]) -> bool:
    """ Returns True IFF list A contains any elements of list B """
    for x in B:
        if x in A:
            return True
    return False


# POST PROCESSING

def load_media_objects(abs_paths: list[str], media_dirs: list[str], saved_posts: dict[str, Any], parser: StringParser, redo: bool=False) -> dict[str, Any]:
    posts_dict: dict[str, Any] = {}
    for idx, abs_path in enumerate(abs_paths):
        media_dir = next((f for f in media_dirs if abs_path.startswith(f)), '')
        rel_path = abs_path.replace(media_dir, '')
        print('\rLoading posts ({:_}/{:_}) ({:.1f}%)'.format( idx+1, len(abs_paths), ((idx+1)/len(abs_paths)*100) ), end='')
        if not redo and rel_path in saved_posts:
            post = saved_posts.get(rel_path)
        else:
            post = extract_media_data(idx, rel_path, abs_path, parser)
        posts_dict[rel_path] = post
    print()
    return posts_dict


def extract_media_data(idx: int, rel_path: str, abs_path: str, parser: StringParser):
    parents, stem, suffix = path_components(rel_path)
    filename_post_data = parse_data_from_stem(stem, parser)
    if False and '196i879' in rel_path:
        print()
        print(rel_path)
        for k, v in filename_post_data.items():
            print('{:<20}:  {}'.format(k, v))
        input()
    tags_from_file = te.read_tags_from_metadata_file(abs_path, filename_post_data.get('source_id'), filename_post_data.get('secondary_source_id'))
    
    post: dict[str, Any] = {
        # 'idx': idx,
        'id': None,
        'source_id': None,
        'secondary_source_id': None,
        'item_num': 0,
        'src': rel_path,
        'source': 'SOURCE_UNKNOWN',
        'creator': 'CREATOR_UNKNOWN',
        'author': None,
        'date_uploaded': None,
        'title': None,
        'filename': stem + suffix,
        'suffix': suffix,
        'media_type': get_media_type(suffix),
        'likes': -1,
        'date_downloaded': datetime.fromtimestamp(os.path.getmtime(abs_path)).strftime('%Y:%m:%d %H:%M:%S')
    }
    
    for data_dict in [ filename_post_data, tags_from_file ]:
        if data_dict:
            for k, v in data_dict.items():
                post[k] = v
    if post.get('source') == 'SOURCE_UNKNOWN' and len(parents) > 0:
        post['source'] = parents[0]
    if post.get('creator') == 'CREATOR_UNKNOWN' and len(parents) > 1:
        post['creator'] = parents[1]
    post['id'] = get_post_id(post)
    tags_params = ['source', 'creator', 'author', 'suffix_tags', 'tags_from_title', 'comments_tags', 'tags_artist', 'tags_character', 'tags_copyright', 'tags_general']
    post['tags'] = make_combined_list_from_params(post, tags_params)
    post['tags'] = [ t for t in set(post['tags']) if t not in ['[deleted]'] ]
    return post


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
    """ Returns list of tokens from a sentence. Removes stopwords,  """
    tags: list[str] = []
    
    for c in '-_#':
        title = title.replace(c, ' ')
    title_chars = [ c for c in title.lower() if c.isalnum() or c == ' ' ]
    title = ''.join(title_chars)
    
    words = [ w for w in title.split() if (len(w) > 2 and len(w) < 20 and not w.isnumeric()) ]
    if remove_stopwords: words = [ w for w in words if w not in STOPWORDS_ENG ]

    
    bigram_words = [ '-'.join(bg) for bg in nltk.bigrams(words) ] # type: ignore
    tags = words + bigram_words
    
    return tags


# gets the components of a path (parent, stem and suffix)
def path_components(path: str) -> Any:
    from pathlib import Path
    obj = Path(path)
    stem = obj.stem
    suffix = obj.suffix
    parents = [ p for p in str(obj.parent).split('/') if p != '' ]
    return parents, stem, suffix


# 
def get_post_id(post_data: dict[str, Any]):
    id_ = '{}-{}'.format( post_data.get('source'), post_data.get('source_id') )
    num = int(post_data.get('item_num', 0))
    if num > 0:
        id_ = f'{id_}-{num}'
    return id_

### HELPERS ###

def linuxify_path(path: str) -> str:
    """ Incase script in in WSL and media referenced on Windows path, converts media to WSL path (/mnt/...) """
    if ':' in path:
        parts = path.split(':')
        path = '/mnt/' + parts[0].lower() + parts[1]
    return path


def get_media_type(suff: str) -> str:
    if suff.lower() in ['.gif']: # HUOM: Some 'webp' can be gifs!!
        return 'gif'
    elif suff.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
        return 'image'
    elif suff.lower() in ['.mp4', '.webm']:
        return 'video'
    return 'UNKNOWN_MEDIA'


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


def make_combined_list_from_params(obj: dict[str, Any], param_list: list[str]) -> list[str]:
    arr: list[str] = []
    for param in param_list:
        value = obj.get(param)
        if value:
            if not isinstance(value, list):
                value = [value]
            arr.extend(value) # type: ignore
    return arr
