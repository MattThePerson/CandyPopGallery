import $ from "jquery"
import "./style.css"


export function HomePage(page_selector: string) {

    const page = $(page_selector);

    /* SET PAGE HTML */
    page.html(/* html */ `
        <script>
            console.log("inside script in HOME!")
        </script>
        <h1>Home Page Constructor!</h1>
    `)

    /* SOMETHING ELSE */
    


    
}
