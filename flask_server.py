from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import fun.processing as proc

from app_state import AppState


app = Flask(__name__)
CORS(app)

state: AppState = None


@app.route("/")
def API_home():
    print("Blank request recieved")
    return jsonify({'message': 'Hello, CORS enabled!'}), 200


""" 
Send posts with only following params:
- post_id
- source_id
- source
- creator
- media_type
- date_downloaded
- date_uploaded
- likes
- views
- upvote_ratio
- title
- media_count
- cover_src (the src of first media object)
"""
@app.route("/make-query")
def API_make_query():
    # state.last_request = request.args
    filtered = proc.filter_posts(list(gl.posts.values()), request.args)
    sources_fmt, creators_fmt, tags_fmt = proc.get_tags_and_amounts(filtered)
    return jsonify({
        'posts': filtered,
        'sources': sources_fmt,
        'creators': creators_fmt,
        'tags': tags_fmt
    }), 200
    

@app.route('/media/<path:rel_path>')
def API_get_media(rel_path: str):
    for mediadir in gl.media_dirs:
        if os.path.exists( os.path.join(mediadir, rel_path) ):
            return send_from_directory(mediadir, rel_path)
    print('[WARNING] Media not found in {} mediadirs "{}"'.format(len(gl.media_dirs), rel_path))
    return send_from_directory('...', '...')


