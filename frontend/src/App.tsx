import './App.css'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom';

import { makeApiRequestGET_JSON, testApiConnection } from './utils/api'
import { parseSortbyString, shuffleListWithSeed, sortPostsByParam } from './utils/sort'

import DropdownInput from './components/DropdownInput'
// import DynamicStream from './components/DynamicStream'
import SimpleStream from './components/SimpleStream'
import ControlBar from './components/ControlBar'


function App() {

    testApiConnection('/',
        () => setSplash("done"),
        () => setSplash("no connection :("));

    
    /* STATE */

    const [posts, setPosts] = useState([]);

    const [sources, setSources] =   useState(null);
    const [creators, setCreators] = useState(null);
    const [tags, setTags] =         useState(null);
    
    const [streamLoadState, setStreamLoadState] = useState({ postsLoaded: 5, currentPost: 0 });
    
    const [splash, setSplash] = useState('connecting ...');
    const [fetchedInfo, setFetchedInfo] = useState<any>('loading ...');
    
    /* IMPORTANT STATE */

    const [searchParams, setSearchParams] = useSearchParams(); // Requires BrowserRouter in main.tsx

    const [selectedTags, setSelectedTags] =         useState<string[]>(searchParams.getAll('tags'));
    const [selectedSources, setSelectedSources] =   useState<string[]>(searchParams.getAll('sources'));
    const [selectedCreators, setSelectedCreators] = useState<string[]>(searchParams.getAll('creators'));

    const sortby_default = 'date-downloaded-desc';
    const filterMedia_default = ['all'];
    const [sortby, setSortby] =                     useState(searchParams.get('sort') || sortby_default);
    const [filterMedia, setFilterMedia] =           useState(searchParams.get('media') || filterMedia_default);


    /* update params functions */

    const updateSelectedTags = (newItems: string[]) =>          updateSearchParams('tags', newItems);
    const updateSelectedSources = (newItems: string[]) =>       updateSearchParams('sources', newItems);
    const updateSelectedCreators = (newItems: string[]) =>      updateSearchParams('creators', newItems);
    const updateSortby = (newItems: string) =>                  updateSearchParams('sort', newItems);
    const updateFilterMedia = (newItems: string[]) =>           updateSearchParams('media', newItems);

    const updateSearchParams = (key: string, value: any) => {
        setSearchParams(prevParams => {
            const newParams = new URLSearchParams(prevParams);
            newParams.delete(key);
            if (Array.isArray(value)) {
                value.forEach(item => newParams.append(key, item));
            } else {
                newParams.set(key, value);
            }
            return newParams;
        });
    };

    // sync app state with search params
    useEffect(() => {
        const setStateIfUpdated = (newValue: any, currentValue: any, setterFunc: Function) => 
            (JSON.stringify(newValue) !== JSON.stringify(currentValue)) ? setterFunc(newValue) : {}
        
        setStateIfUpdated( searchParams.getAll('tags'),                            selectedTags, setSelectedTags );
        setStateIfUpdated( searchParams.getAll('sources'),                         selectedSources, setSelectedSources );
        setStateIfUpdated( searchParams.getAll('creators'),                        selectedCreators, setSelectedCreators );
        setStateIfUpdated( searchParams.get('sort') || sortby_default,             sortby, setSortby );
        setStateIfUpdated( searchParams.getAll('media') || filterMedia_default,    filterMedia, setFilterMedia );
    }, [searchParams]);
    
    
    /* EFFECTS */
    
    // make query
    useEffect(() => {
        setFetchedInfo('loading ...');
        setPosts([]);
        setStreamLoadState({ postsLoaded: 5, currentPost: 0 });
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
        window.scrollTo({ top: 0 });
        setStreamLoadState({ postsLoaded: 5, currentPost: 0 });

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
    
    // function handleSortStream(new_sortby: string) {
    //     console.log("Handling sort!");
    //     window.scrollTo({ top: 0 });
    //     setTimeout(() => {
    //         setStreamLoadState({ postsLoaded: 2, currentPost: 0 });
    //         updateSortby(new_sortby);
    //     }, 1);
    // }
    
    function handlePostTagClick(tag_type: string, tag_name: string): void {
        console.log("in handlePostTagClick:", tag_type, tag_name);
        switch (tag_type) {
            case "general":
                updateSelectedTags([tag_name]);
                break;
            case "source":
                updateSelectedSources([tag_name]);
                break;
            case "creator":
                updateSelectedCreators([tag_name]);
                break;
        }
    }
    
    
    
    /* RETURN */
    return (
        <div className="app">
            <section id="side-bar-section">
                <h2>CandyPop Gallery</h2>
                <div><pre>{fetchedInfo}</pre></div>
                <DropdownInput name="source" options={sources} selectedOptions={selectedSources} updateSelectedOptions={updateSelectedSources} /> {/* key="dropdown-input-source"  */}
                <DropdownInput name="creator" options={creators} selectedOptions={selectedCreators} updateSelectedOptions={updateSelectedCreators} />
                <DropdownInput name="tags" options={tags} selectedOptions={selectedTags} updateSelectedOptions={updateSelectedTags} />
            </section>

            <section id="main-section">
                <div id="control-bar">
                    <ControlBar sortby={sortby} handleSortChange={updateSortby} />
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