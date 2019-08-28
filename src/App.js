import React, {Component} from 'react';
import axios from "axios"
import './assets/css/style.scss';
import HarborFilter from './components/HarborFilter'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import moment from 'moment'
import 'moment/locale/sv'

class App extends Component {

    /**
     * Api documentation: http://api.trafikinfo.trafikverket.se/API/TheRequest
     */

    api = (query) => {
        return axios({
            method: "post",
            url: "https://api.trafikinfo.trafikverket.se/v1.3/data.json",
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                REQUEST: {
                    LOGIN: {
                        authenticationkey: "e0b09c15958e47faaa74fd30c908bb12"
                    },
                    QUERY: [query]
                }
            })
        }).then(response => {
            return response
        }).catch(error => {
            toast.error("Could not contact server");
            throw error.response.data.RESPONSE.RESULT[0].ERROR.MESSAGE
        });
    };

    getFerryRoutes = () => {
        let query = {
            objecttype: "FerryRoute"
        };

        return this.api(query).then(response => {
            return response.data.RESPONSE.RESULT[0].FerryRoute
        })
    };

    getDeviations = (ids, timeDiff = "-0.00:01:00") => {
        let query = {
            objecttype: "Situation",
            FILTER: {
                ELEMENTMATCH: [{
                    OR: [{
                        EQ: ids.map(function (id) {
                            return {
                                name: "Deviation.Id",
                                value: id
                            }
                        })
                    }],
                    NE: [{
                        name: "Deviation.IconId",
                        value: "ferryDepartureOnSchedule"
                    }],
                    LT: [{
                        name: "Deviation.StartTime",
                        value: "$dateadd(" + timeDiff + ")"
                    }],
                    GT: [{
                        name: "Deviation.EndTime",
                        value: "$dateadd(" + timeDiff + ")"
                    }]
                }]
            },
            DISTINCT: "Deviation"
        };

        return this.api(query).then(response => {
            //If there are any Deviations, return them, otherwise return empty array
            if (response.data.RESPONSE.RESULT[0].Situation[0].hasOwnProperty("Deviation")) {
                //Note, because Trafikverkets API filter is broken for nested objects we need to filter here to ensure only ferry Deviations is returned
                return response.data.RESPONSE.RESULT[0].Situation[0].Deviation.filter(Deviation => {
                    return Deviation.MessageCodeValue === "ferry"
                });
            } else {
                return []
            }
        })
    };

    getDepartures = (routeId, timeDiff = "-0.00:01:00", limit = 10) => {
        let query = {
            objecttype: "FerryAnnouncement",
            limit: limit,
            orderby: "DepartureTime asc",
            FILTER: {
                AND: [
                    {
                        GT: [{
                            name: "DepartureTime",
                            value: "$dateadd(" + timeDiff + ")"
                        }],
                        EQ: [{
                            name: "Route.Id",
                            value: routeId,
                        }]
                    }
                ]
            },
            EXCLUDE: ["Route", "DeviationId", "ModifiedTime"]
        };

        return this.api(query).then(response => {
            return response.data.RESPONSE.RESULT[0].FerryAnnouncement
        })
    };

    filterFerryRoutes = (search) => {
        return this.state.FerryRoutes.filter(FerryRoute => {
            if (search !== "") {
                if (FerryRoute.Name.toLowerCase().match(search.toLowerCase()) !== null) {
                    return FerryRoute
                } else if (FerryRoute.Harbor[0].Name.toLowerCase().match(search.toLowerCase()) !== null || FerryRoute.Harbor[1].Name.toLowerCase().match(search.toLowerCase()) !== null) {
                    return FerryRoute
                } else {
                    return null
                }
            } else {
                return null
            }
        });
    };

    sortRelevance = (a,b,search) =>{
        let x = a.Name.toLowerCase().match(search.toLowerCase());
        let y = b.Name.toLowerCase().match(search.toLowerCase());

        if(x !== null){
            if(y !== null){
                if (x.index < y.index) {return -1;}
                if (x.index > y.index) {return 1;}
            }
            return -1
        }
        if(y !== null) {
            return 1
        }
        return 0;
    };

    searchChangeHandler = (event) => {
        window.scrollTo(0, 0);
        this.setState({
            search: event.target.value,
            filter: {},
            Departures: [],
            FerryRoute: null,
            FerryRoutesResults: this.filterFerryRoutes(event.target.value).sort((a,b) => {
                    return this.sortRelevance(a,b,event.target.value)
                }).slice(0, 8)
        });
        clearInterval(this.state.Interval);
        //Remove FerryRoute from localstorage
        localStorage.setItem("FerryRoute", null);
    };

    chooseFerryRoute = (FerryRoute) => {
        if(FerryRoute !== null){
            //Set search states
            this.setState({
                search: FerryRoute.Name,
                FerryRoute: FerryRoute,
                FerryRoutesResults: [],
            });
            //Get departures and set its state
            this.getDepartures(FerryRoute.Id).then(Departures => {
                this.setState({Departures});
                this.setState({
                    Interval: setInterval(() => {
                        this.getDepartures(FerryRoute.Id).then(Departures => {
                            this.setState({Departures});
                        });
                    },30000)
                })
            });
            //Set local storage for next time site is opened
            localStorage.setItem("FerryRoute", JSON.stringify(FerryRoute));
        }
    };

    changeHarbor = (Name) => {
        let filter = {...this.state.filter};
        filter.FromHarbor = {Name};
        this.setState({filter});
    };

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

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            search: "",
            filter: {},
            FerryRoute: null,
            FerryRoutes: [],
            FerryRoutesResults: [],
            Deviations: [],
            InfoMessages: [],
            Departures: [],
            Interval: null,
        };
    }

    componentDidMount() {
        this.getFerryRoutes().then(FerryRoutes => {
            this.setState({FerryRoutes});

            //Get Deviations for all the FerryRoutes
            this.getDeviations(FerryRoutes.map(Route => {
                return Route.DeviationId
            })).then(Deviations => {
                this.setState({Deviations});
                });

            //If localstorage is set choose that route
            if(localStorage.getItem("FerryRoute")){
                this.chooseFerryRoute(JSON.parse(localStorage.getItem("FerryRoute")))
            }
        });
    }

    render() {
        return (

            <div className={`App ${this.state.search ? "searched" : ""}`}>
                <ToastContainer className={`text-center`} position={toast.POSITION.TOP_CENTER} hideProgressBar={true}/>
                <div className={"contentWrapper"}>
                <header>
                    <div id={"searchWrap"}>
                        <input
                            onChange={this.searchChangeHandler}
                            value={this.state.search}
                            className={"searchInput"}
                            name={"search"}
                            placeholder={"Sök färja"}
                            autoComplete={"off"}
                        />
                        <ul className={"searchResults"}>
                            {this.state.FerryRoutesResults.map((FerryRoutesResult) => (
                                <li key={FerryRoutesResult.Id} onClick={() => {
                                    this.chooseFerryRoute(FerryRoutesResult)
                                }}>
                                    {FerryRoutesResult.Name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </header>
                <main>
                    {(() => {
                        if (this.state.FerryRoute !== null) {
                            return this.state.Deviations.map((Deviation) => {
                                console.log(Deviation.Id);
                                console.log(this.state.FerryRoute.DeviationId);
                                console.log(Deviation);
                                if (Deviation.Id === this.state.FerryRoute.DeviationId) {
                                    return (
                                        <div className={`Deviation`}>
                                            <span>{Deviation.Message}</span>
                                        </div>
                                    )
                                }
                            });
                        }
                    })()}
                    {(() => {
                        if (this.state.FerryRoute !== null) {
                            if (this.state.FerryRoute.Type.Id === 2) {
                                return <HarborFilter Harbors={this.state.FerryRoute.Harbor}
                                                     changeHarbor={this.changeHarbor.bind(this)}/>
                            }
                        }
                    })()}
                    { this.state.Departures.length > 0 ?
                    <ul className={"Departures"}>
                    <span className={"FerryRouteName"}>{this.state.FerryRoute.Name}</span>
                        {this.state.Departures.map((Departure) => {
                            if(this.state.filter.hasOwnProperty("FromHarbor")){
                                if(Departure.FromHarbor.Name === this.state.filter.FromHarbor.Name){
                                    return (
                                        <li key={Departure.Id}>
                                            <span>
                                                <span className={"ferryIcon"}><i className="fas fa-ship"></i></span>
                                                <span className={"ferryFromTo"}>
                                                    <span className={"ferryFrom"}>{Departure.FromHarbor.Name}</span>
                                                    <i className="fas fa-arrow-right"></i>
                                                    <span className={"ferryTo"}>{Departure.ToHarbor.Name}</span>
                                                </span>
                                            </span>
                                            <span className={"ferryDepartureDateTime"}>
                                                <span className={"time"}>{this.renderTime(Departure.DepartureTime)}</span>
                                                <span className={"date"}>{this.renderDate(Departure.DepartureTime)}</span>
                                            </span>
                                        </li>
                                    )
                                }
                            }else{
                                return (
                                    <li key={Departure.Id}>
                                        <span>
                                            <span className={"ferryIcon"}><i className="fas fa-ship"></i></span>
                                            <span className={"ferryFromTo"}>
                                                <span className={"ferryFrom"}>{Departure.FromHarbor.Name}</span>
                                                <i className="fas fa-arrow-right"></i>
                                                <span className={"ferryTo"}>{Departure.ToHarbor.Name}</span>
                                            </span>
                                        </span>
                                        <span className={"ferryDepartureDateTime"}>
                                            <span className={"time"}>{this.renderTime(Departure.DepartureTime)}</span>
                                            <span className={"date"}>{this.renderDate(Departure.DepartureTime)}</span>
                                        </span>
                                    </li>
                                )
                            }
                        })}
                    </ul>
                    : null }

                    <div id={"home"}>
                        Hitta avgångar för vägverkets bilfärjor.<br/>
                        Sök genom i rutan efter färjeled eller hamn.
                    </div>
                </main>
                </div>
            </div>
        );
    }
}

export default App;
