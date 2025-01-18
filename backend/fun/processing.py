from typing import Any


# filter posts
def filter_posts(posts: list[Any], args: dict[str, str]) -> list[Any]:

    if len(posts) == 0:
        return []
    
    sources =   [ t for t in args['sources'].split(',')     if t != '' ]
    creators =  [ t for t in args['creators'].split(',')    if t != '' ]
    proper_tags =       [ t for t in args['tags'].split(',')        if t != '' ]
    improper_tags =     [ t for t in args['tags'].split(',')        if t != '' ]
    tags = proper_tags + improper_tags

    # print(creators)

    filtered = posts.copy()
    filtered = [ p for p in filtered if sources == [] or p.get('source') in sources ]
    filtered = [ p for p in filtered if creators == [] or p.get('creator') in creators ]
    if args.get('tags_combine', '') == '&':
        filtered = [ p for p in filtered if tags == [] or containsAll(p.get('proper_tags', []), tags) or containsAll(p.get('improper_tags', []), tags) ]
    else:
        filtered = [ p for p in filtered if tags == [] or containsAny(p.get('proper_tags', []), tags) or containsAll(p.get('improper_tags', []), tags) ]
    return filtered


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
        post_tags: list[str] = post.get('proper_tags', []) + post.get('improper_tags', [])
        if post_tags and isinstance(post_tags, list): # type: ignore
            for tag in post_tags:
                tags_count[tag] = tags_count.get(tag, 0) + 1
    sources:    list[dict[str, int]] =  [ {'name': key, 'amount': value} for key, value in sources_count.items() ] # type: ignore
    creators:   list[dict[str, int]] =  [ {'name': key, 'amount': value} for key, value in creators_count.items() ] # type: ignore
    tags:       list[dict[str, int]] =  [ {'name': key, 'amount': value} for key, value in tags_count.items() if (value > 1) ] # type: ignore
    return sources, creators, tags
    # return { "sources": sources_fmt, "creators": creators_fmt, "tags": tags_fmt }


#### HELPERS ####

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