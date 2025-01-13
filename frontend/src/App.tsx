import './App.css'

import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom';

import { makeApiRequestGET_JSON, testApiConnection } from './utils/api'
import { parseSortbyString, shuffleListWithSeed, sortPostsByParam, filterPostsByParam, computeDateDist } from './utils/array'

import DropdownInput from './components/DropdownInput'
// import DynamicStream from './components/DynamicStream'
import SimpleStream from './components/SimpleStream'
import SimpleGrid from './components/SimpleGrid';
import ControlBar from './components/ControlBar'
import DateSideNav from './components/DateSideNav';


function App() {

    testApiConnection('/',
        () => setSplash("done"),
        () => setSplash("no connection :("));

    const navigate = useNavigate();
    
    /* STATE */

    const [posts, setPosts] = useState<any[]>([]);
    const [unfilteredPosts, setUnfilteredPosts] = useState<any[]>([]);
    const [postDateDist, setPostDateDist] = useState<any[]>([]);
    
    const [sources, setSources] =   useState<any[]|null>(null);
    const [creators, setCreators] = useState<any[]|null>(null);
    const [tags, setTags] =         useState<any[]|null>(null);
    
    const [streamLoadState, setStreamLoadState] = useState({ postsLoaded: 5, currentPost: 0 });
    
    const [splash, setSplash] = useState('connecting ...');
    const [fetchedInfo, setFetchedInfo] = useState<any>('loading ...');
    
    /* IMPORTANT STATE */

    const [searchParams, setSearchParams] = useSearchParams(); // Requires BrowserRouter in main.tsx

    const sortby_default = 'date-downloaded-desc';
    const filterMedia_default = ['all'];
    const viewMode_default = 'list';

    const [selectedTags, setSelectedTags] =         useState<string[]>( searchParams.getAll('tags') );
    const [selectedSources, setSelectedSources] =   useState<string[]>( searchParams.getAll('sources') );
    const [selectedCreators, setSelectedCreators] = useState<string[]>( searchParams.getAll('creators') );

    const [sortby, setSortby] =                     useState<string>( searchParams.get('sort') || sortby_default );
    const [filterMedia, setFilterMedia] =           useState<string[]>( searchParams.getAll('media') || filterMedia_default );
    const [viewMode, setViewMode] =                 useState<string|null>( searchParams.get('view') || viewMode_default );

    const [feedStartDate, setFeedStartDate] =       useState<string|null>( searchParams.get('start-date') );


    /* update params functions */

    const updateSelectedTags = (newValue: string[]) =>          updateSearchParams('tags', newValue);
    const updateSelectedSources = (newValue: string[]) =>       updateSearchParams('sources', newValue);
    const updateSelectedCreators = (newValue: string[]) =>      updateSearchParams('creators', newValue);
    const updateSortby = (newValue: string) =>                  updateSearchParams('sort', newValue);
    const updateFilterMedia = (newValue: string[]) =>           updateSearchParams('media', newValue);
    const updateViewMode = (newValue: string) =>                updateSearchParams('view', newValue);
    const updateFeedStartDate = (newValue: string|null) =>      updateSearchParams('start-date', newValue);

    const updateSearchParams = (key: string, value: any) => {
        setSearchParams(prevParams => {
            const newParams = new URLSearchParams(prevParams);
            newParams.delete(key);
            if (Array.isArray(value)) {
                value.forEach(item => newParams.append(key, item));
            } else if (value != null) {
                newParams.set(key, value);
            }
            return newParams;
        });
    };

    // sync app state with search params
    useEffect(() => {
        const setStateIfUpdated = (newValue: any, currentValue: any, setterFunc: Function) => 
            (JSON.stringify(newValue) !== JSON.stringify(currentValue)) ? setterFunc(newValue) : {}
        
        setStateIfUpdated( searchParams.getAll('tags'),                             selectedTags, setSelectedTags );
        setStateIfUpdated( searchParams.getAll('sources'),                          selectedSources, setSelectedSources );
        setStateIfUpdated( searchParams.getAll('creators'),                         selectedCreators, setSelectedCreators );
        setStateIfUpdated( searchParams.get('sort') || sortby_default,              sortby, setSortby );
        setStateIfUpdated( searchParams.getAll('media') || filterMedia_default,     filterMedia, setFilterMedia );
        setStateIfUpdated( searchParams.get('view') || viewMode_default,            viewMode, setViewMode );
        setStateIfUpdated( searchParams.get('start-date'),                          feedStartDate, setFeedStartDate );
    }, [searchParams]);
    
    
    /* EFFECTS */
    
    // make query
    useEffect(() => {
        setFetchedInfo('Fetching posts ...');
        setPosts([]);
        setStreamLoadState({ postsLoaded: 5, currentPost: 0 });
        setTags(null);  setSources(null);  setCreators(null);
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
            setSources(res.sources);  setCreators(res.creators);  setTags(res.tags);
            const [sortby_param, sort_descending] = parseSortbyString(sortby);
            const newPosts = sortPostsByParam(res.posts, sortby_param, sort_descending);
            setUnfilteredPosts(newPosts);
            setPosts(newPosts);
            setFetchedInfo(`Fetched ${newPosts.length} posts\n(took ${tt} ms)`);
        });
    }, [selectedSources, selectedCreators, selectedTags]);


    // sort & filter loaded posts
    useEffect(() => {
        console.log("useEffect() -> sort posts")
        setPosts([]);
        setStreamLoadState({ postsLoaded: 5, currentPost: 0 });
        updateFeedStartDate(undefined);
        setTimeout(() => { // timeout so ui updates first
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
        }, 1);
    }, [sortby]);

    // feed start date
    useEffect(() => {
        if (sortby.includes('date') && feedStartDate != null) {
            setPosts([]);
            setStreamLoadState({ postsLoaded: 5, currentPost: 0 });
            const [sortby_param, sort_descending] = parseSortbyString(sortby);
            console.log("Filtering posts by:", sortby, "from:", feedStartDate);
            console.log("len of unfiltered posts:", unfilteredPosts.length);
            const filteredPosts = filterPostsByParam(unfilteredPosts, sortby_param, sort_descending, feedStartDate);
            console.log(filteredPosts);
            setPosts(filteredPosts);
        }
    }, [feedStartDate]);


    // compute date dist
    useEffect(() => {
        if (sortby.includes('date')) {
            const [sortby_param, sort_descending] = parseSortbyString(sortby);
            const newDateDist = computeDateDist(posts, sortby_param, sort_descending);
            setPostDateDist(newDateDist);
        }
    }, [posts]);
    
    
    
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
                updateSelectedTags([tag_name]); // will replace tags, fix!
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
    const getFeed = () => {
        if (viewMode === 'list') {
            return (
                <SimpleStream posts={posts} streamLoadState={streamLoadState} setStreamLoadState={setStreamLoadState} setSelectedTags={handlePostTagClick} />
            )
        } else if (viewMode === 'grid') {
            return (
                <SimpleGrid posts={posts} streamLoadState={streamLoadState} setStreamLoadState={setStreamLoadState} setSelectedTags={handlePostTagClick} />
            )
        }
    }
    
    return (
        <div className="app">
            <section id="side-bar-section">
                <h2 onClick={() => navigate('/home')}>CandyPop Gallery</h2>
                <div style={{height: "2rem"}}><pre>{fetchedInfo}</pre></div>
                <DropdownInput name="source" options={sources} selectedOptions={selectedSources} updateSelectedOptions={updateSelectedSources} /> {/* key="dropdown-input-source"  */}
                <DropdownInput name="creator" options={creators} selectedOptions={selectedCreators} updateSelectedOptions={updateSelectedCreators} />
                <DropdownInput name="tags" options={tags} selectedOptions={selectedTags} updateSelectedOptions={updateSelectedTags} />
                <button onClick={() => navigate('/settings')}>Settings</button>
            </section>

            <section id="main-section">
                <div id="control-bar">
                    <ControlBar sortby={sortby} handleSortChange={updateSortby} viewMode={viewMode} updateViewMode={updateViewMode} />
                </div>
                <div id="content-container">
                    <div id="feed-container">
                        <div className="feed">
                            { (splash !== "done") ? <div className="splash">{splash} </div> : <></> }
                            {getFeed()}
                        </div>
                    </div>
                    <div id="feed-date-nav">
                        <DateSideNav dateDist={postDateDist} updateFeedStartDate={updateFeedStartDate} />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default App
