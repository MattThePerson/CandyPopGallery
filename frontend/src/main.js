/* project created with `npm create vite@latest my-app --template vanilla` */
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg' /* direct import from public */
import './style.css'
import { setupCounter } from './util/counter.js'


document.querySelector('#app').innerHTML = /* html */`
    <div>
        <h1>Hello Vite!</h1>
        <div class="card">
            <button id="counter" type="button"></button>
        </div>
        <p class="read-the-docs">
            Click on the Vite logo to learn more
        </p>
    </div>
`

setupCounter(document.querySelector('#counter'))

console.log('hey vite!');

fetch('/api/hello')
    .then(res => res.json())
    .then(data => console.log(data)
);


