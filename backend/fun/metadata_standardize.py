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
            'date',
            'score',
            'id',
        ],
        'keys_map': {
            'id': 'source_id',
            'date': 'date_uploaded',
            'ups': 'upvotes',
            'downs': 'downvotes',
            'subreddit_name_prefixed': 'subreddit',
        }
    },
    
    # REDGIFS
    'redgifs': {
        'keep_keys': [
            'description',
            'id',
            'likes',
            'niches',
            'sexuality',
            'tags',
            'userName',
            'views',
            'date'
        ],
        'keys_map': {
            'id': 'source_id',
            'date': 'date_uploaded',
            'likes': 'upvotes',
            'userName': 'username'
        }
    },
    
    # INSTAGRAM
    'instagram': {
        'keep_keys': [
            'post_shortcode',
            'likes',
            'description',
            'tags',
            'username',
            'fullname',
            'post_date',
            'coauthors',
        ],
        'keys_map': {
            'post_shortcode', 'source_id',
            'post_date', 'date_uploaded',
        }
    },
    
    # TWITTER
    'twitter': {
        'keep_keys': [
            'tweet_id',
            'date',
            'hashtags',
            'favorite_count',
            'view_count',
            'retweet_count',
            'bookmark_count',
            'author',
        ],
        'keys_map': {
            'tweet_id': 'source_id',
            'date': 'date_uploaded',
            'hashtags': 'tags',
            'favorite_count': 'upvotes',
            'view_count': 'views',
        }
    },
}



# 
def standardize_metadata(metadata: dict[str, Any], source: str) -> dict[str, Any]:
    global metadata_unifying_options
    options = metadata_unifying_options.get(source.lower())
    if options == None:
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
    
    return metadata_unf


# HANDLERS

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