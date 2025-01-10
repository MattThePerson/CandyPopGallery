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

    return (
        <div className="Post">

            <div className="post-title-bar">
                <div className="title">{data.title} </div>
                <div className="date-uploaded">{data.date_uploaded} </div>
            </div>
            <div className="post-body">
                <MediaComponent src={flask_api_url + 'media/' + encodeURIComponent(data.src)} />
                <div className="info-container">
                    <div className="tag-bar upper-tag-bar">
                        <div className="tag source" onClick={() => setSelectedTags('source', data['source'])}>{data['source']} </div>
                        <div className="tag creator" onClick={() => setSelectedTags('creator', data['creator'])}>{data['creator']} </div>
                    </div>
                    <div className="tag-bar lower-tag-bar">
                        {data['tags']?.slice(1,20).map((tag: string, idx: number) =>
                            <div key={"tag-" + idx} className="tag general" onClick={() => setSelectedTags('general', tag)}>{tag} </div>
                        )}
                    </div>
                    <div>{"Likes: " + data.likes} </div>
                    <div>{"Filaname: " + data.filename} </div>
                    <div>{"Date downloaded: " + data.date_downloaded}</div>
                </div>
            </div>


        </div>
    )
}

export default Post;
