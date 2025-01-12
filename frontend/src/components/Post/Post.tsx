import './Post.css';

// import { useState, useEffect } from 'react'
import { flask_api_url } from '../../utils/api';

import MediaComponent from '../MediaComponent';

type PostProps = {
    data: any;
    setSelectedTags: Function;
}

function Post({data, setSelectedTags}: PostProps) {

    // console.log(data);

    const media_objects = data.media_objects;

    return (
        <div className="Post">

            <div className="post-title-bar">
                <h2 className="title">{data.title} </h2>
                <div className="date-uploaded">{data.date_uploaded} </div>
            </div>
            <div className="post-body">
                <MediaComponent src={flask_api_url + 'media/' + encodeURIComponent(media_objects[0].src)} />
                <div className="info-container">
                    <div className="tag-bar upper-tag-bar">
                        <div className="tag source" onClick={() => setSelectedTags('source', data['source'])}>{data['source']} </div>
                        <div className="tag creator" onClick={() => setSelectedTags('creator', data['creator'])}>{data['creator']} </div>
                    </div>
                    <div className="tag-bar lower-tag-bar">
                        {data['tags']?.slice(0,50).map((tag: string, idx: number) =>
                            <div key={"tag-" + idx} className="tag proper" onClick={() => setSelectedTags('general', tag)}>{tag} </div>
                        )}
                    </div>
                    <div className="tag-bar lower-tag-bar">
                        {data['improper_tags']?.slice(0,50).map((tag: string, idx: number) =>
                            <div key={"tag-" + idx} className="tag improper" onClick={() => setSelectedTags('general', tag)}>{tag} </div>
                        )}
                    </div>
                    <div>{"Likes: " + data.likes} </div>
                    <div>{"Filaname: " + media_objects[0].filename} </div>
                    <div>{"Date downloaded: " + data.date_downloaded}</div>
                    <div>{"media count: " + data.media_count} </div>
                    <div className="comments">
                        {`Comments (${data["comments"]?.length}):`}
                        {data['comments']?.slice(0, 6).map((comment: any) => 
                            <div key={comment.id} className="comment">{comment.body} </div>
                        )}
                    </div>
                </div>
            </div>


        </div>
    )
}

export default Post;
