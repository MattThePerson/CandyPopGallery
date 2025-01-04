

def linuxify_path(path):
    if ':' in path:
        path = '/mnt/' + path.replace(':', '')
    return path