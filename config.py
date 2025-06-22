import yaml
from handymatt.wsl_paths import convert_to_wsl_path
from handymatt import StringParser

with open('config.yaml', 'r') as f:
    CONFIG = yaml.safe_load(f)

MEDIA_FOLDERS = [ convert_to_wsl_path(pth) for pth in CONFIG.get('media_folders', []) if not pth.startswith('!') ]

FILENAME_PARSER = StringParser(CONFIG.get('filename_formats'))
