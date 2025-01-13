import './DateSideNav.css';

interface DateSideNavParams {
    dateDist: any[];
    updateFeedStartDate: Function;
}

function DateSideNav({dateDist, updateFeedStartDate}: DateSideNavParams) {

    const dateNavElements = dateDist.map((obj) => {

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        const className = (obj.date.length == 4) ? 'year' : 'month';
        const value = (obj.date.length == 4) ? obj.date : months[Number(obj.date.slice(5, 7)-1)];
        
        return (
            <span key={obj.date} className={className}>
                <button onClick={() => updateFeedStartDate(obj.date)} >{value} </button>
                <div className="count">{obj.count} </div>
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
