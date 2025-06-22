from typing import Any

from util.json_handler import JsonHandler # replace with MattThePerson_CustomLibs
from util.string_parser import StringParser # replace with MattThePerson_CustomLibs


class AppState:
    media_paths: list[str] = []
    media_dirs: list[str] = []
    media_objects: dict[str, Any] = {} # UNUSED AFTER INIT
    posts: dict[str, Any] = {}
    settings = ...
    saved_media_objects = ...
    filename_parser: StringParser | None = None
    
    def __init__(self, settings_fn: str, saved_media_fn: str):
        self.settings = JsonHandler(settings_fn, prettify=True, readonly=True)
        self.saved_media_objects = JsonHandler(saved_media_fn, prettify=True)
