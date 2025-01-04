import './MediaComponent.css';


function MediaComponent({src}: {src: string}) {

    if (src.endsWith('.mp4') || src.endsWith('.webm')) {
        return (
            <video controls muted loop>
                <source src={src} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        )
    } else {
        return (
            <img src={src} alt="Media" />
        )
    }
}

export default MediaComponent;
