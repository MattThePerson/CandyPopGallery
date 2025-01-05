import './ControlBar.css';

import down_arrow from './assets/down-arrow.svg'

interface ControlBarProps {
    sortby: string;
    setSortby: Function;
}

function ControlBar({sortby, setSortby}: ControlBarProps) {

    function updateSortby(target: HTMLDivElement | any, type: string) {
        const order_button_click = target.classList.contains('order-button');
        const current_order = (sortby.endsWith('-desc')) ? '-desc' : '-asc';
        const current_sortby = sortby.replace(current_order, '');
        
        let new_sortby = '-desc';
        if (current_sortby != type) {
            if (order_button_click)
                new_sortby = '-asc';
        } else {
            if (current_order == '-desc')
                new_sortby = '-asc';
            else
                new_sortby = '-desc';
        }
        const newSortby = type + new_sortby;
        setSortby(newSortby);
    }

    const sortbyTypes = ["date-added", "date-uploaded", "likes", "random"];

    const sortbyButtons = sortbyTypes.map((type, idx) => {

        function getClasses() {
            const classes = ["button"]
            if (sortby.startsWith(type))
                classes.push("selected");
            return classes.join(' ');
        }
        function getClasses_OrderButton() {
            const classes = ['order-button'];
            if (sortby.startsWith(type) && sortby.endsWith('-asc'))
                classes.push('asc')
            return classes.join(' ');
        }
        
        return (
            <div
                key={'sortby-button-'+idx}
                id={'sortby-button-'+type}
                className={getClasses()}
                onClick={(e) => updateSortby(e.target, type)}
            >
                <div>{type.split('-').join(' ')} </div>
                {(type !== 'random') ? (
                    <div className={getClasses_OrderButton()}>
                        <img className='order-button' src={down_arrow} alt="Order image" />
                    </div>
                ) : ( <></> )}
            </div>
        )
    });
    
    return (
        <div className="ControlBar">
            <div className="container">
                <div>sort by</div>
                {sortbyButtons}
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
