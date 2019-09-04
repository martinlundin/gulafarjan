import React from 'react';
import logo from './../assets/img/gulafarjan.png'
import arrow from './../assets/img/arrow.png'

class Home extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div id={"home"}>
                <img className={"logo"} src={logo} alt={"Gulafärjan logo"}/>
                <h1>Gulafärjan</h1>
                <h2>Hitta avgångar för de gula färjorna<br/>(Vägverkets bilfärjor)</h2>
                <div className={"searchHelp"}>
                    <img className={"arrow"} src={arrow} alt={"Help arrow"}/>
                </div>
            </div>
        )
    }
}

export default Home;
