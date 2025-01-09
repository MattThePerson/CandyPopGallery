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
            <h2 className="date-uploaded">{data['date_uploaded']} </h2>
            <div className="tag-bar upper-tag-bar">
                <div className="tag source" onClick={() => setSelectedTags('source', data['source'])}>{data['source']} </div>
                <div className="tag creator" onClick={() => setSelectedTags('creator', data['creator'])}>{data['creator']} </div>
            </div>
            <div className="tag-bar lower-tag-bar">
                {data['tags']?.map((tag: string, idx: number) =>
                    <div key={"tag-" + idx} className="tag general" onClick={() => setSelectedTags('general', tag)}>{tag} </div>
                )}
            </div>
            <div>{data.likes} </div>
            <MediaComponent src={flask_api_url + 'media/' + encodeURIComponent(data.src)} />
            <div>{data.filename} </div>
        </div>
    )
}

export default Post;
