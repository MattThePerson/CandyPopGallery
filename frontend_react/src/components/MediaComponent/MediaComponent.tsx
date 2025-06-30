import './MediaComponent.css';


function MediaComponent({src}: {src: string}) {

    function getMediaElement() {
        if (src.endsWith('.mp4') || src.endsWith('.webm')) {
            return (
                <video className="media-component" src={src} controls muted loop playsInline >
                    {/* <source src={src} type="video/mp4" /> */}
                    {/* Your browser does not support the video tag. */}
                </video>
            )
        } else {
            return (
                <img className="media-component" src={src} alt="Media" />
            )
        }
    }

    
    return (
        <div className="media-component-container">
            {getMediaElement()}
        </div>
    )
}

export default MediaComponent;
