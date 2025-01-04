import './ControlBar.css';

import down_arrow from './assets/down-arrow.svg'


function ControlBar() {

    return (
        <div className="ControlBar">
            <div className="container">
                <div>sort by</div>
                <div className="button selected" onClick={() => console.log("date added")}>
                    <div>date added</div>
                    <div className="order-button"><img src={down_arrow} alt="Order image" /></div>
                </div>
                <div className="button ">
                    <div>date uploaded</div>
                    <div className="order-button"><img src={down_arrow} alt="Order image" /></div>
                </div>
                <div className="button ">
                    <div>likes</div>
                    <div className="order-button"><img src={down_arrow} alt="Order image" /></div>
                </div>
                <div className="button ">
                    <div>random</div>
                </div>
            </div>
            <div className="container">
                <div>view</div>
                <div className="button">
                    <div>list</div>
                    <div>grid</div>
                </div>
            </div>
        </div>
    )
}
export default ControlBar;
