from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS
import argparse
import os
from pathlib import Path
from lib.json_handler import JsonHandler
import fun.FlaskFunctions as ff


""" TEMP """
def get_posts_objects():
    import json
    posts_file = os.path.join( os.path.dirname(__file__), 'data/posts.json' )
    with open(posts_file, 'r') as f:
        posts = json.load(f)
    media_folder = ff.linuxify_path('c:/Users/stirl/Downloads/media')
    media_files = [str(file.relative_to(media_folder)) for file in Path(media_folder).rglob('*') if file.is_file()]
    i = 0
    for post in posts:
        post['src'] = media_files[i]
        i += 1
        if i >= len(media_files):
            i = 0
    return posts

def add_to_dict(dct, item, key):
    items = dct.get(key, [])
    items.append(item)
    dct[key] = items
    return dct

def get_tag_post_map(posts):
    mp = {}
    for post in posts:
        id_, src, cre, tags = post['id'], post['source'], post['creator'], post['tags']
        mp = add_to_dict(mp, id_, 'source--' + src)
        mp = add_to_dict(mp, id_, 'creator--' + cre)
        for tag in tags:
            mp = add_to_dict(mp, id_, tag)
    return mp

def get_general_tags(mp):
    tags = []
    for tag, lst in mp.items():
        if '--' not in tag:
            item = {
                'name': tag,
                'amount': int(len(lst))
            }
            tags.append(item)
    return tags

def get_source_tags(mp):
    tags = []
    for tag, lst in mp.items():
        if tag.startswith('source--'):
            item = {
                'name': tag.replace('source--', ''),
                'amount': int(len(lst))
            }
            tags.append(item)
    return tags

def get_creator_tags(mp):
    tags = []
    for tag, lst in mp.items():
        if tag.startswith('creator--'):
            item = {
                'name': tag.replace('creator--', ''),
                'amount': int(len(lst))
            }
            tags.append(item)
    return tags

""" TEMP END """

posts = get_posts_objects()
tag_post_map = get_tag_post_map(posts)

app = Flask(__name__)
CORS(app)

settingsHandler = JsonHandler('data/settings.json', prettify=True)
if settingsHandler.isEmpty():
    settingsHandler.setValue('media_folders', [])
    settingsHandler.setValue('filename_formats', [])


def generateReponse(main=None, time_taken=None):
    r = {}
    #r['favourites_ids'] = jsonHandlerApp.getValue('favourites')
    # r['collections'] = metadataHandler.getValue('collections', [])
    r['main'] = main
    r['time_taken'] = time_taken
    return r

@app.route("/")
def API_home():
    print("Blank request recieved")
    return jsonify({'message': 'Hello, CORS enabled!'}), 200


@app.route("/get-sources")
def API_get_sources():
    source_tags = get_source_tags(tag_post_map)
    return jsonify(source_tags), 200

@app.route("/get-creators")
def API_get_creators():
    creator_tags = get_creator_tags(tag_post_map)
    return jsonify(creator_tags), 200

@app.route("/get-tags")
def API_get_tags():
    tags = get_general_tags(tag_post_map)
    return jsonify(tags), 200


@app.route("/get-posts")
def API_get_posts():
    # request.args
    return jsonify(posts), 200

@app.route('/media')
def API_serve_media():
    media_path = request.args.get('src')
    print(media_path)
    if media_path == None:
        return jsonify("[ERROR] Failed to get src from request args"), 500
    media_path = ff.linuxify_path(media_path)
    return send_file(media_path, mimetype='image/jpeg')


@app.route('/get-media/<path:filename>')
def API_get_media(filename):
    folder = ff.linuxify_path('c:/Users/stirl/Downloads/media')
    return send_from_directory(folder, filename)

# c:/Users/stirl/Downloads/images/kobe-transparent.png

# MAIN
def main(args):
    print('Starting Flask Server ...')
    port = args.port if args.port else 5000
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', help='Port to start flask api on', type=int)
    parser.add_argument('-um', '--update_mode', action='store_true', help='Update loaded media when change occurs in media dirs')
    args = parser.parse_args()
    main(args)
