import './App.css'

import { useState, useEffect } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'

import { makeApiRequestGET, makeApiRequestGET_JSON } from './utils/api'

import DropdownInput from './components/DropdownInput'
import Post from './components/Post'
import ControlBar from './components/ControlBar'



function App() {

    const [posts, setPosts] = useState([])
    
    const [sources, setSources] = useState(null);
    const [creators, setCreators] = useState(null);
    const [tags, setTags] = useState(null);

    // console.log("made App()");
    // console.log(creators);
    
    useEffect(() => {
        makeApiRequestGET('get-sources', [], (res: any) => {
            setSources(res);
        });
        makeApiRequestGET('get-creators', [], (res: any) => {
            setCreators(res);
        });
        makeApiRequestGET('get-tags', [], (res: any) => {
            setTags(res);
        });
        makeApiRequestGET_JSON('get-posts', {tags: ['test1', 'lebron', 'muhaha']}, (res: any) => {
            // console.log(res);
            setPosts(res);
        });
    }, []);
    

    /* RETURN */
    const post_elements = posts.slice(10, 21).map((post_data, idx) => {
        return (
            <Post key={'post-' + idx} data={post_data} />
        )
    });
    
    return (
        <div className="app">
            <section id="side-bar-section">
                <h2>CandyPop Gallery</h2>
                <DropdownInput name="source" options={sources} />
                <DropdownInput name="creator" options={creators} />
                <DropdownInput name="tags" options={tags} />
            </section>

            <section id="main-section">
                <div id="control-bar">
                    <ControlBar />
                </div>
                <div id="content-container">
                    <div id="feed-container">
                        <div className="feed">
                            {post_elements}
                        </div>
                    </div>
                    <div id="feed-date-nav">2024</div>
                </div>
            </section>
        </div>
    )
}

export default App