import os
from pathlib import Path
from typing import Any
from util.json_handler import JsonHandler
from util.string_parser import StringParser
import nltk
import random

nltk.download('stopwords')
STOPWORDS_ENG = nltk.corpus.stopwords.words('english')

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

    if len(posts) == 0:
        return []
    
    # print("\nINSIDE!")
    # print(len(posts))
    # print(args)
    
    # print(posts[0])
    
    # input()
    
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

def load_post_objects(paths: list[str], saved_posts: dict[str, Any], parser: StringParser) -> dict[str, Any]:
    posts_dict: dict[str, Any] = {}
    for idx, path in enumerate(paths):
        # if path
        parents, stem, suffix = path_components(path)
        post: dict[str, Any] = {
            'src': path,
            'idx': idx,
            'source': 'SOURCE_UNKNOWN',
            'creator': 'CREATOR_UNKNOWN',
            'filename': stem + suffix,
            'suffix': suffix,
            'media_type': get_media_type(suffix),
            'likes': random.randint(0,9999),
            'date_added': str(idx),
        }
        post_data_fn = parse_data_from_stem(stem, parser)
        post_data_meta = extract_custom_metadata(path)
        # file_info = extract_media_info(path)
        for data_dict in [ post_data_fn, post_data_meta ]:
            if data_dict:
                for k, v in data_dict.items():
                    post[k] = v
        if 'id' not in post:
            post['id'] = idx
        if post.get('source') == 'SOURCE_UNKNOWN' and len(parents) > 0:
            post['source'] = parents[0]
            
        posts_dict[path] = post
    return posts_dict

def parse_data_from_stem(stem: str, parser: StringParser) -> dict[str, Any]:
    data = parser.parse(stem)
    if data == None:
        return {}
    if 'source_id_TwitterSeleniumScraped' in data:
        data['source_id'] = data['source_id_TwitterSeleniumScraped'].replace(' photo ', '-')
    if 'date_uploaded_dt' in data:
        data['date_uploaded'] = data['date_uploaded_dt'].split('T')[0]
    tags_from_filename = data.get('tags', [])
    del data['tags']
    data['tags'] = tags_from_filename + get_tags_from_title(data['title'])
    return data

def get_tags_from_title(title: str, remove_stopwords: bool=True) -> list[str]:
    """ Returns list of tokens from a sentence. Removes stopwords,  """
    tags: list[str] = []
    
    for c in '-_#':
        title = title.replace(c, ' ')
    title_chars = [ c for c in title.lower() if c.isalnum() or c == ' ' ]
    title = ''.join(title_chars)
    
    words = [ w for w in title.split() if (len(w) > 2 and len(w) < 20 and not w.isnumeric()) ]
    if remove_stopwords: words = [ w for w in words if w not in STOPWORDS_ENG ]

    
    bigram_words = [ '-'.join(bg) for bg in nltk.bigrams(words) ]
    tags = words + bigram_words
    
    return tags

# http://192.168.1.3:5002/get-media/images/gallery-dl/reddit/pics/elxa0j%2022-year-old%20Iranian%20here.%20Just%20wanted%20to%20share%20my%20love%20with%20my%20friends%20all%20over%20the%20world%20(Americans,%20Iraqis,%20Australians,%20etc.)%20as%20it%20is%20what%20the%20world%20needs%20the%20most%20in%20these%20hard%20times.%20#LoveBeyondFlags.jpg

def extract_custom_metadata(path: str) -> dict[str, Any]:
    ...

def path_components(path: str) -> Any:
    from pathlib import Path
    obj = Path(path)
    stem = obj.stem
    suffix = obj.suffix
    parents = [ p for p in str(obj.parent).split('/') if p != '' ]
    return parents, stem, suffix


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


### HELPERS ###

def get_media_type(suff: str) -> str:
    if suff.lower() in ['.gif']: # HUOM: Some 'webp' can be gifs!!
        return 'gif'
    elif suff.lower() in ['.jpg', '.jpeg', '.png', '.webp']:
        return 'image'
    elif suff.lower() in ['.mp4', '.webm']:
        return 'video'
    return 'UNKNOWN_MEDIA'


def make_posts_swf(posts: dict[str, Any], sfw_media_dir: str):
    import random
    swf_media = get_media_from_dirs([sfw_media_dir])
    random.shuffle(swf_media)
    i = 0
    for post in posts.values():
        post['src'] = swf_media[i]
        i += 1
        if i >= len(swf_media):
            i = 0
            random.shuffle(swf_media)
    return posts
