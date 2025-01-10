from typing import Any
from pathlib import Path
import os
import ast


# 
def read_tags_from_metadata_file(abs_path: str, _id: str|None, sec_id: str|None=None) -> dict[str, Any]:

    if _id == None:
        return {}

    dirname = str(Path(abs_path).parent)
    
    filepath = dirname + f'/{_id}.txt'
    metadata: dict[str, Any] = get_metadata_from_file(filepath)
    
    if sec_id:
        filepath = dirname + f'/{sec_id}.txt'
        metadata_sec: dict[str, Any] = get_metadata_from_file(filepath)
        for k, v in metadata_sec.items():
            if k not in metadata:
                metadata[k] = v
    
    return metadata


def get_metadata_from_file(filepath: str) -> dict[str, Any]:
    metadata: dict[str, Any] = {}
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            for line in f:
                parts = line.strip().split('=')
                if len(parts) >= 2:
                    key = parts[0]
                    value = '='.join(parts[1:])
                    if value != 'None':
                        if 'tags' in key:
                            value = parse_tags_string(value)
                            if key == 'tags' or key == 'tags_string':
                                key = 'tags_general'
                        metadata[key] = value
    return metadata

def parse_tags_string(tags_str: str) -> list[str]:
    try:
        tags: list[str] = ast.literal_eval(tags_str)
        if isinstance(tags, list): # type: ignore
            return tags
    except:
        return tags_str.split()

