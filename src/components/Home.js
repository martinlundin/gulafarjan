import React from 'react';

class Home extends React.Component {
    constructor(props) {
        super(props);

    }

    render() {
        return (
            <div id={"home"}>
                <i className="fas fa-ship"></i>
                Hitta avgångar för de gula färjorna (Vägverkets bilfärjor)<br/><br/>
                Sök i rutan efter färjeled eller hamn
            </div>
        )
    }
}

export default Home;
