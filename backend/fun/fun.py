""" Generic functions """
from typing import Any

from handymatt import JsonHandler


def save_media_objects(media_objects: dict[str, Any], saved_media_objects: JsonHandler):
    """ saves media objects into JsonHandler """
    for src, post in media_objects.items():
        saved_media_objects.setValue(src, post, nosave=True)
    saved_media_objects.save()


# def linuxify_path(path: str) -> str:
#     """ Incase script in in WSL and media referenced on Windows path, converts media to WSL path (/mnt/...) """
#     if ':' in path:
#         parts = path.split(':')
#         path = '/mnt/' + parts[0].lower() + parts[1]
#     return path


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

