from typing import Any


metadata_unifying_options: dict[str, Any] = {
    
    # REDDIT
    'reddit': { # count?
        'keep_keys': [
            'subreddit_name_prefixed',
            'title',
            'ups',
            'downs',
            'author',
            'score',
            'link_flair_text',
        ],
        'keys_map': {
            'ups': 'upvotes',
            'downs': 'downvotes',
            'subreddit_name_prefixed': 'subreddit',
        }
    },
    
    # REDGIFS
    'redgifs': {
        'keep_keys': [
            'description',
            'likes',
            'niches',
            'sexuality',
            'tags',
            'userName',
            'views',
        ],
        'keys_map': {
            'likes': 'upvotes',
            'userName': 'username'
        }
    },
    
    # INSTAGRAM
    'instagram': {
        'keep_keys': [
            'likes',
            'description',
            'tags',
            'username',
            'fullname',
            'coauthors',
        ],
        'keys_map': {
        }
    },
    
    # TWITTER
    'twitter': {
        'keep_keys': [
            'hashtags',
            'favorite_count',
            'view_count',
            'retweet_count',
            'bookmark_count',
            'author',
        ],
        'keys_map': {
            'hashtags': 'tags',
            'favorite_count': 'upvotes',
            'view_count': 'views',
        }
    },
    
    # PATREON
    'patreon': {
        'keep_keys': [
            'content',
            'like_count',
            'tags',
            'title',
            'teaser_text',
            'comment_count',
        ],
        'keys_map': {
            'like_count': 'upvotes',
        }
    },
    
    # RULE34
    "rule34": {
        'keep_keys': [
            'score',
            'source',
            'uploader',
            'tags',
            'comments',
            'tags_artist',
            'tags_character',
            'tags_copyright',
            'tags_general',
            'tags_metadata',
        ],
        'keys_map': {
            'score': 'upvotes',
            'source': 'original_source_url',
        }
    },
    
    # BLUESKY
    "bluesky": {
        'keep_keys': [
            'likeCount',
            'labels',
            'text',
            'repostCount',
            'quoteCount',
        ],
        'keys_map': {
            'likeCount': 'upvotes',
        }
    },
    
    
}



# 
def standardize_metadata(metadata: dict[str, Any], source: str|None) -> dict[str, Any]:
    """ For the metadata of a given post, keep desired keys, map to new keynames and add general processing """

    global metadata_unifying_options
    if source is None:
        return metadata
    options = metadata_unifying_options.get(source.lower())
    if options is None:
        return metadata
    keep_keys = options['keep_keys'] + ['comments']
    keys_map = options.get('keys_map', {})

    metadata_unf: dict[str, Any] = {}
    for key in keep_keys:
        newKey = keys_map.get(key)
        if newKey == None:
            newKey = key
        metadata_unf[newKey] = metadata.get(key)
    
    if source.lower() == 'twitter':         metadata_unf = handle_twitter(metadata_unf)
    if source.lower() == 'instagram':       metadata_unf = handle_instagram(metadata_unf)
    if source.lower() == 'rule34':          metadata_unf = handle_rule34(metadata_unf)
    
    metadata_unf = handle_general(metadata_unf)
    
    return metadata_unf


# HANDLERS

def handle_general(metadata: dict[str, Any]) -> dict[str, Any]:
    # ints
    for key in ['upvotes', 'downvotes', 'views']:
        if metadata.get(key) != None:
            metadata[key] = int(metadata[key])
    
    # floats
    for key in ['upvote_ratio']:
        if key in metadata:
            metadata[key] = float(metadata[key])
    
    return metadata

def handle_twitter(metadata: dict[str, Any]) -> dict[str, Any]:
    author_obj = metadata.get('author')
    if author_obj:
        name = author_obj.get('name')
        desc = author_obj.get('description')
        metadata['author'] = name
        metadata['author_description'] = desc
    return metadata

def handle_instagram(metadata: dict[str, Any]) -> dict[str, Any]:
    coauthors = metadata.get('coauthors')
    if coauthors:
        usernames = [ co.get('username') for co in coauthors ]
        metadata['coauthors'] = usernames
    return metadata

def handle_rule34(metadata: dict[str, Any]) -> dict[str, Any]:
    for tag_type in ['tags_artist', 'tags_character', 'tags_copyright', 'tags_metadata']:
        slug = tag_type.split('_')[-1]
        if isinstance(metadata.get(tag_type), list):
            metadata[tag_type] = [ f'{slug}: {tag}' for tag in metadata[tag_type] ]
    return metadata
