import os
from pathlib import Path
from typing import Any
from util.json_handler import JsonHandler
from util.string_parser import StringParser


def linuxify_path(path: str) -> str:
    """ Incase script in in WSL and media referenced on Windows path, converts media to WSL path (/mnt/...) """
    if ':' in path:
        parts = path.split(':')
        path = '/mnt/' + parts[0].lower() + parts[1]
    return path


def initialize_settings(settingsHandler: JsonHandler):
    settingsHandler.setValue('media_folders', [])
    settingsHandler.setValue('filename_formats', [])
    


### POST FILTERING ###

def filter_posts(posts: list[Any], args: dict[str, str]) -> list[Any]:
    
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



## 

def get_media_from_dirs(dirs: list[str]) -> list[str]:
    
    MEDIA_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.mp4']
    
    files: list[Path] = []
    for i, base_dir in enumerate(dirs):
        print('Scanning folder ({}/{}) "{}"'.format(i+1, len(dirs), base_dir), end='')
        if not os.path.exists(base_dir):
            print('  ... WRONG PATH')
        else:
            newfiles = [ f.relative_to(base_dir) for f in Path(base_dir).rglob('*') ]
            print('  ... found {:_} media'.format(len(newfiles)))
            files.extend(newfiles) # type: ignore
        
    files_str = [ str(f) for f in files if (f.suffix in MEDIA_EXTENSIONS) ]
    return files_str


# NOT IN USE
def extract_tags(paths: list[str]) -> dict[str, list[str]]:
    tag_map: dict[str, list[str]] = {}
    return tag_map



# POST PROCESSING

def generate_posts(paths: list[str], parser: StringParser) -> list[dict[str, Any]]:
    posts: list[dict[str, Any]] = []
    for idx, path in enumerate(paths):
        suffix = Path(path).suffix
        post: dict[str, Any] = {
            'src': path,
            'idx': idx,
            'source': 'SOURCE_UNKNOWN',
            'creator': 'CREATOR_UNKNOWN',
            'filename': Path(path).name,
            'suffix': suffix,
            'media_type': get_media_type(suffix),
            'date_uploaded': 'UNKNOWN_DATE',
            'date_added': 'UNKNOWN_DATE',
            'likes': 0,
        }
        post_data_fn = parse_data_from_path(path, parser)
        post_data_meta = extract_custom_metadata(path)
        for data_dict in [ post_data_fn, post_data_meta ]:
            if data_dict:
                for k, v in data_dict.items():
                    if k not in post:
                        post[k] = v
        if 'id' not in post:
            post['id'] = idx
        posts.append(post)
    return posts

def parse_data_from_path(path: str, parser: StringParser) -> dict[str, Any]:
    stem = str(Path(path).stem)
    filename_data = parser.parse(stem)
    if filename_data == None:
        return {}
    return filename_data

def extract_custom_metadata(path: str) -> dict[str, Any]:
    ...



def get_tag_amounts(posts: list[dict[str, Any]]) -> Any:
    sources: dict[str, int] = {}
    creators: dict[str, int] = {}
    tags: dict[str, int] = {}
    for post in posts:
        source = post.get('source')
        if source and isinstance(source, str):
            sources[source] = sources.get(source, 0) + 1
        creator = post.get('creator')
        if creator and isinstance(creator, str):
            creators[creator] = creators.get(creator, 0) + 1
        if 'tags' in post and isinstance(post['tags'], list):
            for tag in tags:
                tags[tag] = tags.get(tag, 0) + 1
    sources_fmt:    list[dict[str, int]] =  [ {'name': key, 'amount': value} for key, value in sources.items() ] # type: ignore
    creators_fmt:   list[dict[str, int]] =  [ {'name': key, 'amount': value} for key, value in creators.items() ] # type: ignore
    tags_fmt:       list[dict[str, int]] =  [ {'name': key, 'amount': value} for key, value in tags.items() ] # type: ignore
    return { "sources": sources_fmt, "creators": creators_fmt, "tags": tags_fmt }


### HELPERS ###

def get_media_type(suff: str) -> str:
    if suff.lower() in ['.gif']: # HUOM: Some 'webp' can be gifs!!
        return 'gif'
    elif suff.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
        return 'image'
    elif suff.lower() in ['.mp4', '.webm']:
        return 'video'
    return 'UNKNOWN_MEDIA'


def make_posts_swf(posts: list[Any], sfw_media_dir: str):
    import random
    swf_media = get_media_from_dirs([sfw_media_dir])
    random.shuffle(swf_media)
    i = 0
    for post in posts:
        post['src'] = swf_media[i]
        i += 1
        if i >= len(swf_media):
            i = 0
            random.shuffle(swf_media)
    return posts
