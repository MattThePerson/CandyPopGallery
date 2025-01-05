import './App.css'

import { useState, useEffect } from 'react'
// import { BrowserRouter as Router, useNavigate, useLocation } from 'react-router-dom';

import { makeApiRequestGET, makeApiRequestGET_JSON } from './utils/api'

import DropdownInput from './components/DropdownInput'
import DynamicStream from './components/DynamicStream'
import ControlBar from './components/ControlBar'
// import Post from './components/Post'

function App1() {
    return (
        <div className="app">
            <section id="side-bar-section">
                <h2>CandyPop Gallery</h2>
            </section>

            <section id="main-section">
                <div id="control-bar">
                    <ControlBar />
                </div>
                <div id="content-container">
                    <div id="feed-container">
                        <div className="feed">
                            <div>One</div>
                            <div>Two</div>
                            <div>Three</div>
                            <div>Four</div>
                            <div>Five</div>
                            <div>Six</div>
                            <div>Seven</div>
                            <div>Eight</div>
                            <div>Nine</div>
                            <div>Ten</div>
                            <div>One</div>
                            <div>Two</div>
                            <div>Three</div>
                            <div>Four</div>
                            <div>Five</div>
                            <div>Six</div>
                            <div>Seven</div>
                            <div>Eight</div>
                            <div>Nine</div>
                            <div>Ten</div>
                            <div>One</div>
                            <div>Two</div>
                            <div>Three</div>
                            <div>Four</div>
                            <div>Five</div>
                            <div>Six</div>
                            <div>Seven</div>
                            <div>Eight</div>
                            <div>Nine</div>
                            <div>Ten</div>
                            <div>One</div>
                            <div>Two</div>
                            <div>Three</div>
                            <div>Four</div>
                            <div>Five</div>
                            <div>Six</div>
                            <div>Seven</div>
                            <div>Eight</div>
                            <div>Nine</div>
                            <div>Ten</div>
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


function App() {

    const [posts, setPosts] = useState([])
    
    const [sources, setSources] = useState(null);
    const [creators, setCreators] = useState(null);
    const [tags, setTags] = useState(null);

    const [selectedSources, setSelectedSources] = useState([]);
    const [selectedCreators, setSelectedCreators] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);

    const [sortby, setSortby] = useState('date-added-desc');

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
    

    return (
        <div className="app">
            <section id="side-bar-section">
                <h2>CandyPop Gallery</h2>
                <DropdownInput key="dropdown-input-source" name="source" options={sources} selectedOptions={selectedSources} setSelectedOptions={setSelectedSources} />
                <DropdownInput name="creator" options={creators} selectedOptions={selectedCreators} setSelectedOptions={setSelectedCreators} />
                <DropdownInput name="tags" options={tags} selectedOptions={selectedTags} setSelectedOptions={setSelectedTags} />
            </section>

            <section id="main-section">
                <div id="control-bar">
                    <ControlBar />
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