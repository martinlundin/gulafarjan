import React from 'react';
import { Link } from 'react-router-dom'
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
            <div id={"home"} className={`box ${this.props.focus}`}  onClick={() => {this.setState({extraInfo: !this.state.extraInfo})}}>
                <div>
                    <span className={"infoButton"}><i className={`fa fa-${this.state.extraInfo ? "times" : "info"}`}/></span>
                    <img className={"logo"} src={logo} alt={"Gulafärjan logo"}/>
                    <div className={"intro"}>
                        <h1>Gulafärjan</h1>
                        <h2>Hitta avgångar för de gula färjorna<br/>(Trafikverkets bilfärjor)</h2>
                    </div>
                    <div id={"pwaInstall"}><i className="fa fa-arrow-circle-down"/>Spara på hemskärmen</div>
                </div>
                <div id={"extraInfo"} className={`${this.state.extraInfo ? "show" : ""}`}>
                    <h2>Tidtabell för Sveriges bilfärjor</h2>
                    <p>Denna webbapp är utvecklad för att göra det lite enklare att veta om hur lång tid färjan går. Alla Trafikverkets bilfärjor i landet finns med här och genom att söka eller välja vilken rutt på kartan kommer man snabbt se när de nästkommande färjorna ska gå.</p>
                    <p>Några av de mer populära färjelederna på Trafikverkets Färjeräderi är: <Link to="/honoleden">Hönöleden</Link>, <Link to="/gullmarsleden">Gullmarsleden</Link>, <Link to="/vaxholmsleden">Vaxholmsleden</Link>, <Link to="/ljusteroleden">Ljusteröleden</Link>, <Link to="/ekeroleden">Ekeröleden</Link>, <Link to="/svanesundsleden">Svanesundsleden</Link>, <Link to="/kornhallsleden">Kornhallsleden</Link>, <Link to="/bjorkoleden">Björköleden</Link>, <Link to="/furusundsleden">Furusundsleden</Link>, <Link to="/farosundsleden">Fårösundsleden</Link>, <Link to="/grasoleden">Gräsöleden</Link>, <Link to="/blidoleden">Blidöleden</Link>, <Link to="/adelsoleden">Adelsöleden</Link>. Det är bara att nämna några, sök i rutan för att hitta din färjeled.</p>
                    <h2>Kontakt</h2>
                    <p>Appen är utvecklad ideellt. Har du några problem, förslag på förbättringar eller vill du hjälpa till att programmera så besök gärna open-source projektet <a target={"_blank"} href={"https://github.com/martinlundin/gulafarjan"}>github.com/martinlundin/gulafarjan</a></p>
                    <p>Om du eller ditt bolag behöver utveckling av hemsidor eller appar kan ni höra av er till <a href="mailto:martin@fokusiv.com">martin@fokusiv.com</a></p>
                </div>
            </div>
        )
    }
}

export default Home;
