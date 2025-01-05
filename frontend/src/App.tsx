import './App.css'

import { useState, useEffect } from 'react'

import { makeApiRequestGET, makeApiRequestGET_JSON } from './utils/api'
import { parseSortbyString, shuffleListWithSeed, sortPostsByParam } from './utils/sort'

import DropdownInput from './components/DropdownInput'
import DynamicStream from './components/DynamicStream'
import ControlBar from './components/ControlBar'


function App() {

    const [posts, setPosts] = useState([])
    
    const [sources, setSources] = useState(null);
    const [creators, setCreators] = useState(null);
    const [tags, setTags] = useState(null);

    const [selectedSources, setSelectedSources] = useState([]);
    const [selectedCreators, setSelectedCreators] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    const [sortby, setSortby] = useState('date-uploaded-desc');

    // request tags and posts
    useEffect(() => {
        console.log("useEffect() -> api request")
        makeApiRequestGET('get-sources', [], (res: any) => {
            setSources(res);
        });
        makeApiRequestGET('get-creators', [], (res: any) => {
            setCreators(res);
        });
        makeApiRequestGET('get-tags', [], (res: any) => {
            setTags(res);
        });

        const request_args = {
            sources: selectedSources.map((item: any) => item.name),
            creators: selectedCreators.map((item: any) => item.name),
            tags: selectedTags.map((item: any) => item.name),
            tags_combine: '&', // & or |
        }
        makeApiRequestGET_JSON('get-posts', request_args, (res: any) => {
            console.log(res);
            setPosts(res);
        });
    }, [selectedSources, selectedCreators, selectedTags]);

    // sort & filter loaded posts
    useEffect(() => {
        console.log("useEffect() -> sort posts")
        const [sortby_param, sort_descending] = parseSortbyString(sortby);
        console.log(sortby_param, sort_descending);
        console.log("length of posts:", posts.length);
        if (posts.length > 0 && (sortby_param in posts[0])) {
            console.log("Sorting posts by:", sortby_param, sort_descending)
            const newPosts = sortPostsByParam(posts, sortby_param, sort_descending);
            setPosts(newPosts);
        } else if (sortby_param === 'random') {
            console.log("Sorting posts by:", sortby_param, sort_descending)
            const seed = '1234';
            const newPosts = shuffleListWithSeed(posts, seed);
            setPosts(newPosts);
        }
    }, [sortby]);
    

    return (
        <div className="app">
            <section id="side-bar-section">
                <h2>CandyPop Gallery</h2>
                <div>{`Fetched ${posts.length} posts`}</div>
                <DropdownInput key="dropdown-input-source" name="source" options={sources} selectedOptions={selectedSources} setSelectedOptions={setSelectedSources} />
                <DropdownInput name="creator" options={creators} selectedOptions={selectedCreators} setSelectedOptions={setSelectedCreators} />
                <DropdownInput name="tags" options={tags} selectedOptions={selectedTags} setSelectedOptions={setSelectedTags} />
            </section>

            <section id="main-section">
                <div id="control-bar">
                    <ControlBar sortby={sortby} setSortby={setSortby} />
                </div>
                <div id="content-container">
                    <div id="feed-container">
                        <div className="feed">
                            <DynamicStream
                                posts={posts}
                                jumpTo={() => {}}
                                viewMode="feed"
                                x={3}
                                y={3}
                            />
                        </div>
                    </div>
                    <div id="feed-date-nav">
                        2025
                        2024
                        2023
                        2022
                        2021
                    </div>
                </div>
            </section>
        </div>
    )
}

export default App