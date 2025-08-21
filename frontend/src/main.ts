import $ from "jquery";
import './style.css'
import { HomePage } from './pages/home/index.ts'
import { DashboardPage } from './pages/dashboard/index.ts'

/* add page template */
document.querySelector<HTMLDivElement>('#app')!.innerHTML = /* html */ `
    <div id="page"></div>
    <nav>
        <button id="btn-home">home</button>
        <button id="btn-dashboard">dashboard</button>
        <button id="btn-settings">settings</button>
        <button id="btn-about">about</button>
    </nav>
`

/* page constructor funcs */
const page_constructors = {
    "/home":        HomePage,
    "/dashboard":   DashboardPage,
    "/settings":    (selector: string) => $(selector).text('settings'),
    "/about":       (selector: string) => $(selector).text('about'),
}

/* load page */
const loadPage = () => {
    // get path name
    let name = location.pathname;
    if (!(name in page_constructors)) {
        name = "/home"
        window.history.replaceState({}, "", name);
    }
    // get adder func
    const page_constructor_func = page_constructors[name as keyof typeof page_constructors];
    if (!page_constructor_func) {
        throw new Error("no page adder for: "+name)
    }
    // $("#page").html(adder_func());
    page_constructor_func("#page")
    // update buttons
    $("nav button").each((_, btn) => btn.classList.remove("highlighted"));
    $("button#"+location.pathname.replace("/", "btn-")).addClass("highlighted");
}

/* button event listeners */
$("nav button").each((_, btn) => {
    const new_url = btn.id.replace("btn-", "/");
    $(btn).on('click', e => {
        if (e.ctrlKey || e.metaKey) {
            window.open(new_url, "_blank");
        } else { // normal click
            window.history.pushState({}, "" , new_url);
            loadPage();
        }
    })
    // middle click
    btn.addEventListener("mouseup", (e) => {
    if (e.button === 1) {
            window.open(new_url, "_blank");
        }
    });
})

loadPage()
