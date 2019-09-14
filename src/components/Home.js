import React from 'react';
import logo from './../assets/img/gulafarjan.png'

class Home extends React.Component {
    render() {
        return (
            <div id={"home"} className={`box ${this.props.focus}`}>
                <img className={"logo"} src={logo} alt={"Gulafärjan logo"}/>
                <div className={"intro"}>
                    <h1>Gulafärjan</h1>
                    <h2>Hitta avgångar för de gula färjorna<br/>(Vägverkets bilfärjor)</h2>
                </div>
                <div id={"pwaInstall"}><i className="fa fa-arrow-circle-down"></i>Spara på hemskärmen</div>
            </div>
        )
    }
}

export default Home;
