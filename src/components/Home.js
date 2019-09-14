import React from 'react';
import logo from './../assets/img/gulafarjan.png'

class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            extraInfo: false
        };
    }
    render() {
        return (
            <div id={"home"} className={`box ${this.props.focus}`}>
                <div>
                    <span className={"infoButton"} onClick={() => {this.setState({extraInfo: !this.state.extraInfo})}}><i className={`fa fa-${this.state.extraInfo ? "times" : "info"}`}></i></span>
                    <img className={"logo"} src={logo} alt={"Gulafärjan logo"}/>
                    <div className={"intro"}>
                        <h1>Gulafärjan</h1>
                        <h2>Hitta avgångar för de gula färjorna<br/>(Trafikverkets bilfärjor)</h2>
                    </div>
                    <div id={"pwaInstall"}><i className="fa fa-arrow-circle-down"></i>Spara på hemskärmen</div>
                </div>
                <div id={"extraInfo"} className={`${this.state.extraInfo ? "show" : ""}`}>
                    <h2>Tidtabell för Sveriges bilfärjor</h2>
                    <p>Denna webbapp är utvecklad för att göra det lite enklare att veta om hur lång tid färjan går. Alla Trafikverkets bilfärjor i landet finns med här och genom att söka eller välja vilken rutt på kartan kommer man snabbt se när de nästkommande färjorna ska gå.</p>
                    <p>Några av de mer populära färjelederna på Trafikverkets Färjeräderi är: Hönöleden, Gullmarsleden, Vaxholmsleden, Ljusteröleden, Ekeröleden, Svanesundsleden, Korhallsleden, Björköleden, Furusundsleden, Fårösundsleden, Gräsöleden, Blidöleden, Adelsöleden. Det är bara att nämna några, sök i rutan för att hitta din färjeled.</p>
                    <h2>Kontakt</h2>
                    <p>Appen är utvecklad ideelt. Har du några problem, förslag på förbättringar eller vill du hjälpa till att programmera så besök gärna open-source projektet <a href={"https://github.com/martinlundin/gulafarjan"}>github.com/martinlundin/gulafarjan</a></p>
                    <p>Om du eller dit bolag behöver utveckling av hemsidor eller appar kan ni höra av er till <a href="mailto:martin@fokusiv.com">martin@fokusiv.com</a></p>
                </div>
            </div>
        )
    }
}

export default Home;
