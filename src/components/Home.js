import React from 'react';
import logo from './../assets/img/gulafarjan.png'

class Home extends React.Component {
    render() {
        return (
            <div id={"home"} className={"box"}>
                <img className={"logo"} src={logo} alt={"Gulafärjan logo"}/>
                <div className={"padding"}>
                    <h1>Gulafärjan</h1>
                    <h2>Hitta avgångar för de gula färjorna<br/>(Vägverkets bilfärjor)</h2>
                </div>
                <div id={"pwaInstall"}>Installera</div>
            </div>
        )
    }
}

export default Home;
