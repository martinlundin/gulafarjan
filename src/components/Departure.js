import React from 'react';
import moment from "moment/moment";
import 'moment/locale/sv'

class DepartureComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            "Departure":   this.props.Departure,
        };
    }

    renderDate = (time) => {
        if(moment(time).format('LL') !== moment().format('LL')) {
            return moment(time).format('LL');
        }
    };

    renderTime = (time) => {
        let unixTimestamp = moment(time).unix();
        let currentUnixTimestamp = moment().unix();
        let diff = unixTimestamp - currentUnixTimestamp;

        //Diff is passed (1 minute margin by default) or less than 1 minute
        if (diff <= 60) {
            return "Nu"
        } else if (diff <= 3600) {
            return Math.ceil(diff / 60) + "min"
        }  else {
            return moment(time).format('LT');
        }
    };

    render() {
        return (
            <li>
                <span>
                    <span className={"ferryIcon"}><i className="fas fa-ship"></i></span>
                    <span className={"ferryFromTo"}>
                        <span className={"ferryFrom"}>{this.state.Departure.FromHarbor.Name}</span>
                        <i className="fas fa-arrow-right"></i>
                        <span className={"ferryTo"}>{this.state.Departure.ToHarbor.Name}</span>
                    </span>
                </span>
                <span className={"ferryDepartureDateTime"}>
                    <span className={"time"}>{this.renderTime(this.state.Departure.DepartureTime)}</span>
                    <span className={"date"}>{this.renderDate(this.state.Departure.DepartureTime)}</span>
                </span>
            </li>
        )
    }
}

export default DepartureComponent;