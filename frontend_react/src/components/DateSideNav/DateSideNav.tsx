import './DateSideNav.css';

interface DateSideNavParams {
    dateDist: any[];
    feedStartDate: string | null;
    updateFeedStartDate: Function;
}

function DateSideNav({dateDist, feedStartDate, updateFeedStartDate}: DateSideNavParams) {

    // format numbers to limit length
    function formatNumber(num: number): string {
        if (num >= 1000 && num < 10000) {
            return (num / 1000).toFixed(1) + 'k'; // For 1.5k, 2.3k, etc.
        } else if (num >= 10000) {
            return Math.floor(num / 1000) + 'k'; // For 12k, 15k, etc.
        }
        return num.toString();
    }


    // date nav elements
    // let lastMonth = -1;
    const max_bar_width = 60;
    const max_month_count = Math.max(...dateDist.filter(item => item.date.length > 4).map(item => item.count));
    const max_year_count = Math.max(...dateDist.filter(item => item.date.length == 4).map(item => item.count));

    let before_selected = (feedStartDate) ? true : false;
    const dateNavElements = dateDist.map((obj) => {

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const year_element = (obj.date.length == 4);
        const classes = (year_element) ? ['year'] : ['month'];
        const value = (year_element) ? obj.date : months[Number(obj.date.slice(5, 7)-1)];
        const bar_width = (year_element) ? (obj.count / max_year_count * max_bar_width) : (obj.count / max_month_count * max_bar_width);
        const bar_color = (year_element) ? "rgb(202, 42, 69)" : "orange";
        if (obj.date == feedStartDate) {
            classes.push('selected');
            before_selected = false;
        } else if (before_selected) {
            classes.push('before-selected');
        }
        
        return (
            <span key={obj.date} className={classes.join(' ')}>
                <button onClick={() => updateFeedStartDate(obj.date)} >{value} </button>
                <div className="count">{formatNumber(obj.count)} </div>
                <div style={{width: `${bar_width}px`, background: bar_color}} className="bar"></div>
            </span>
        )
    });
    
    return (
        <div className="DateSideNav">
            {dateNavElements}
        </div>
    )
}

export default DateSideNav;
