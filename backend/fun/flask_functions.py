from typing import Any
from util.json_handler import JsonHandler



def save_media_objects(media_objects: dict[str, Any], saved_media_objects: JsonHandler):
    for src, post in media_objects.items():
        saved_media_objects.setValue(src, post, nosave=True)
    saved_media_objects.save()


def initialize_settings(settingsHandler: JsonHandler):
    settingsHandler.setValue('media_folders', [])
    settingsHandler.setValue('filename_formats', [])


def linuxify_path(path: str) -> str:
    """ Incase script in in WSL and media referenced on Windows path, converts media to WSL path (/mnt/...) """
    if ':' in path:
        parts = path.split(':')
        path = '/mnt/' + parts[0].lower() + parts[1]
    return path


def filter_strings(strings: list[str], filters_str: str, union_mode: bool) -> list[str]:
    filters = [ p.strip() for p in filters_str.lower().split(',') if p != '' ]
    if not union_mode:
        for filt in filters:
            strings = [ pth for pth in strings if filt in pth.lower() ]
    else:
        cumulative: list[str] = []
        for filt in filters:
            cumulative.extend([ pth for pth in strings if filt in pth.lower() ])
        strings = cumulative
    return strings

