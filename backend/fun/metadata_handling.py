""" Functions for reading metadata from metadata.json files in the directories of media """
from typing import Any
import os
from pathlib import Path
import json


def metadata_load(filepath: str, id_format: str='{}[{id:S}]', use_shared_metadata: bool=True) -> dict[str, Any]:
    """ Loads metadata for given filepath and id_format. Looks for .json file called '<id>.json' in same folder, '.metadata' folder, repeats for parent directory. """
    obj = Path(filepath)
    if not obj.is_file():
        raise Exception('filepath is not a file')
    result: Any = parse.parse(id_format, str(obj.stem)) # type: ignore
    if result == None:
        raise Exception('Unable to parse filename with id_format "{}"'.format(id_format))
    file_id = result.named.get('id')
    if file_id == None:
        raise Exception('No "id" attribute extracted from filename with id_format "{}"'.format(id_format))
    return metadata_load_with_id(filepath, file_id, use_shared_metadata=use_shared_metadata)


def metadata_load_with_id(path: str, file_id: str, use_shared_metadata: bool=True) -> dict[str, Any]:
    """ Loads metadata for given filepath and id. Looks for .json file called '<id>.json' in same folder, '.metadata' folder, repeats for parent directory. """
    obj = Path(path)
    if obj.is_file():
        obj = obj.parent
    parts = str(obj).split(os.sep)
    if ':' in parts[0]: # Windows
        parts[0] += os.sep
    elif parts[0] == '': # Linux
        parts[0] = os.sep
    metadata_fn = f'{file_id}.json'
    dirs: list[str] = []
    while parts != []:
        dirs.append(os.path.join(*parts))
        dirs.append(os.path.join(*parts, '.metadata'))
        parts.pop()
    data: dict[str, Any] = {}
    for parent in dirs:
        fp = os.path.join(parent, metadata_fn)
        if os.path.exists(fp):
            data = read_json_file_to_dict(fp)
            break
    if use_shared_metadata:
        for parent in dirs:
            fp = os.path.join(parent, '.metadata.json')
            if os.path.exists(fp):
                data_shared = read_json_file_to_dict(fp)
                data = combine_metadata(data, data_shared)
    return data


def read_json_file_to_dict(path: str) -> dict[str, Any]:
    with open(path, 'r') as f:
        data = json.load(f)
    if not isinstance(data, dict):
        data = {'data': data}
    return data # type: ignore

def combine_metadata(d1: dict[str, Any], d2: dict[str, Any], overwrite_nonlist: bool=False) -> dict[str, Any]:
    d: dict[str, Any] = { k: v for k, v in d1.items() }
    for k, v in d2.items():
        ev = d.get(k)
        if ev == None:
            d[k] = v
        elif isinstance(ev, list):
            if not isinstance(v, list):
                raise Exception('combine_dicts(): mismatched dict value types')
            combined: list[Any] = ev + v
            d[k] = combined
        elif overwrite_nonlist:
            d[k] = v
    return d
