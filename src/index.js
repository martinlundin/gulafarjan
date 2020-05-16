import React from 'react';
import {BrowserRouter as Router} from "react-router-dom";
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
<Router>
    <App />
</Router>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();

let deferredPrompt;
window.addEventListener('load', (e) => {
    let btnAdd = document.getElementById("pwaInstall");

    
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 76 and later from showing the mini-infobar
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;

        btnAdd.style.display = 'flex';
    });

    btnAdd.addEventListener('click', (e) => {
        // hide our user interface that shows our A2HS button
        btnAdd.style.display = 'none';
        // Show the prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        deferredPrompt.userChoice
            .then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the A2HS prompt');
                } else {
                    console.log('User dismissed the A2HS prompt');
                }
                deferredPrompt = null;
            });
    });


});