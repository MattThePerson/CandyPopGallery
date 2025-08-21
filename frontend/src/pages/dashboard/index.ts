import $ from "jquery"


export function DashboardPage(selector: string) {

    const page = $(selector);
    
    page.html(/* html */ `
        <h1>Dashboard!</h1>
    `)
}
