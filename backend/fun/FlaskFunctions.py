

def linuxify_path(path):
    if ':' in path:
        path = '/mnt/' + path.replace(':', '')
    return path


### POST FILTERING ###

def filter_posts(posts, args):
    
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