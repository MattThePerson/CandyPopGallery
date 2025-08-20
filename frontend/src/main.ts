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

/* page adder funcs */
const page_adders = {
    "/home":        HomePage,
    "/dashboard":   DashboardPage,
    "/settings":   () => 'settings',
    "/about":   () => 'about',
}

/* load page */
const loadPage = () => {
    // get path name
    let name = location.pathname;
    if (!(name in page_adders)) {
        name = "/home"
        window.history.replaceState({}, "", name);
    }
    // get adder func
    const adder_func = page_adders[name as keyof typeof page_adders];
    if (!adder_func) {
        throw new Error("no page adder for: "+name)
    }
    $("#page").html(adder_func());
    // update buttons
    $("nav button").each((_, btn) => btn.classList.remove("highlighted"));
    $("button#"+location.pathname.replace("/", "btn-")).addClass("highlighted");
}

/* button event listeners */
$("nav button").each((_, btn) => {
    $(btn).on('click', () => {
        window.history.pushState({}, "" , btn.id.replace("btn-", "/"));
        loadPage();
    })
})

loadPage()
