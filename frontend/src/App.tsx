import './App.css'

import { useState, useEffect } from 'react'

import { makeApiRequestGET_JSON, testApiConnection } from './utils/api'
import { parseSortbyString, shuffleListWithSeed, sortPostsByParam } from './utils/sort'

import DropdownInput from './components/DropdownInput'
// import DynamicStream from './components/DynamicStream'
import SimpleStream from './components/SimpleStream'
import ControlBar from './components/ControlBar'


function App() {

    /* STATE */

    const [posts, setPosts] = useState([])
    
    const [sources, setSources] =   useState(null);
    const [creators, setCreators] = useState(null);
    const [tags, setTags] =         useState(null);
    
    const [streamLoadState, setStreamLoadState] = useState({ postsLoaded: 2, currentPost: 0 });
    
    const [splash, setSplash] = useState('connecting ...');
    const [fetchedInfo, setFetchedInfo] = useState<any>('loading ...')
    
    // reproducible state
    const [selectedSources, setSelectedSources] =   useState<string[]>([]);
    const [selectedCreators, setSelectedCreators] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] =         useState<string[]>([]);

    const [sortby, setSortby] = useState('date-uploaded-desc');

    /* EFFECTS */
    
    testApiConnection('/',
        () => setSplash("done"),
        () => setSplash("no connection :("));

    // request tags and posts
    useEffect(() => {
        setFetchedInfo('loading ...');
        const request_args = {
            sources: selectedSources.map((item: any) => item),
            creators: selectedCreators.map((item: any) => item),
            tags: selectedTags.map((item: any) => item),
            tags_combine: '&', // & or |
        }
        let start = performance.now();
        makeApiRequestGET_JSON('make-query', request_args, (res: any) => {
            let tt = Math.round(performance.now() - start);
            console.log(`API call took ${tt} ms`)
            setSources(res.sources);
            setCreators(res.creators);
            setTags(res.tags);
            const [sortby_param, sort_descending] = parseSortbyString(sortby);
            const newPosts = sortPostsByParam(res.posts, sortby_param, sort_descending);
            setPosts(newPosts);
            setFetchedInfo(`Fetched ${newPosts.length} posts\n(took ${tt} ms)`);
        });
    }, [selectedSources, selectedCreators, selectedTags]);

    // sort & filter loaded posts
    useEffect(() => {
        console.log("useEffect() -> sort posts")
        const [sortby_param, sort_descending] = parseSortbyString(sortby);
        let start = performance.now();
        if (posts.length > 0) {
            console.log("Sorting posts by:", sortby_param, sort_descending)
            const newPosts = sortPostsByParam(posts, sortby_param, sort_descending);
            setPosts(newPosts);
        } else if (sortby_param.startsWith('random')) {
            console.log("Sorting posts by:", sortby_param, sort_descending)
            // const seed = '1234';
            const seed = Math.floor(Math.random()*9999).toString();
            console.log(seed);
            const newPosts = shuffleListWithSeed(posts, seed);
            setPosts(newPosts);
        }
        console.log(`Sorting posts took ${Math.round(performance.now() - start)} ms`)
    }, [sortby]);

    /* STATE CHANGE HANDLERS */
    
    function handleSortStream(new_sortby: string) {
        console.log("Handling sort!");
        window.scrollTo({ top: 0 });
        setTimeout(() => {
            setStreamLoadState({ postsLoaded: 2, currentPost: 0 });
            setSortby(new_sortby);
        }, 1);
    }
    
    function handlePostTagClick(tag_type: string, tag_name: string): void {
        console.log("in handlePostTagClick:", tag_type, tag_name);
        switch (tag_type) {
            case "general":
                setSelectedTags([tag_name]);    setSelectedSources([]);           setSelectedCreators([]); break;
            case "source":
                setSelectedSources([tag_name]); setSelectedCreators([]);          setSelectedTags([]); break;
            case "creator":
                setSelectedSources([]);         setSelectedCreators([tag_name]);  setSelectedTags([]); break;
        }
    }
    
    // console.log(posts.length);
    
    return (
        <div className="app">
            <section id="side-bar-section">
                <h2>CandyPop Gallery</h2>
                <div><pre>{fetchedInfo}</pre></div>
                <DropdownInput name="source" options={sources} selectedOptions={selectedSources} setSelectedOptions={setSelectedSources} /> {/* key="dropdown-input-source"  */}
                <DropdownInput name="creator" options={creators} selectedOptions={selectedCreators} setSelectedOptions={setSelectedCreators} />
                <DropdownInput name="tags" options={tags} selectedOptions={selectedTags} setSelectedOptions={setSelectedTags} />
            </section>

            <section id="main-section">
                <div id="control-bar">
                    <ControlBar sortby={sortby} handleSortChange={handleSortStream} />
                </div>
                <div id="content-container">
                    <div id="feed-container">
                        <div className="feed">
                            { (splash !== "done") ? <div className="splash">{splash} </div> : <></> }
                            <SimpleStream posts={posts} streamLoadState={streamLoadState} setStreamLoadState={setStreamLoadState} setSelectedTags={handlePostTagClick} />
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