import React from 'react';
import DepartureComponent from './../components/Departure'

class DepartureList extends React.Component {

    render() {
        return (
            <ul className={"Departures box"}>
                <span className={"FerryRouteName"}>{this.props.FerryRoute.Name}
                    <i onClick={(e) => {
                        let el = e.target;
                        el.classList.add("spin");
                        this.props.updateDepartures(this.props.FerryRoute.Id).then(Departures => {
                            setTimeout(function(){
                                el.classList.remove("spin")
                            },500)
                        })
                    }} className="fa fa-redo-alt"/>
                </span>
                {this.props.Departures.map((Departure) => {
                    if(this.props.filter.hasOwnProperty("FromHarbor")){
                        if(Departure.FromHarbor.Name === this.props.filter.FromHarbor.Name){
                            return <DepartureComponent key={Departure.Id} Departure={Departure}/>
                        }
                    }else{
                        return <DepartureComponent key={Departure.Id} Departure={Departure}/>
                    }
                })}
            </ul>
        )
    }
}

export default DepartureList;