import React, {Component} from 'react';
import axios from "axios"
import './assets/css/style.scss';
import Home from './components/Home'
import HarborFilter from './components/HarborFilter'
import DeviationComponent from './components/Deviation'
import MapComponent from './components/Map'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import DepartureList from "./containers/DepartureList";

class App extends Component {

    /** Api documentation: http://api.trafikinfo.trafikverket.se/API/TheRequest **/
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
            console.log(error)
            if (error.response) {
                toast.error("Could not contact server");
                throw error.response.data.RESPONSE.RESULT[0].ERROR.MESSAGE
            }
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
        this.setState({ isLoading: true})
        return this.api(query).then(response => {
            this.setState({ isLoading: false})
            return response.data.RESPONSE.RESULT[0].FerryAnnouncement
        })
    };

    updateDepartures = (FerryRouteId) => {
        return this.getDepartures(FerryRouteId).then(Departures => {
            this.setState({Departures});
            return Departures
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

    inputSearchHandler = (event) => {
        this.search(event.target.value);
    };

    search = (value) => {
        this.setState({
            search: value,
            FerryRoutesResults: this.filterFerryRoutes(value).sort((a,b) => {
                return this.sortRelevance(a,b,value)
            })
        });
        this.closeChosenFerryRoute()
    };

    chooseFerryRoute = (FerryRoute) => {
        if(FerryRoute !== null){
            //Make sure to clear previous chosen route
            this.closeChosenFerryRoute().then(r => {
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
            });
        }
    };

    closeChosenFerryRoute = () => {
        let othis = this;
        return new Promise(function(resolve, reject) {
            othis.setState({
                filter: {},
                Departures: [],
                FerryRoute: null,
            });
            clearInterval(othis.state.Interval);
            //Remove FerryRoute from localstorage
            localStorage.setItem("FerryRoute", null);
            resolve(true)
        });
    };

    changeHarbor = (Name) => {
        let filter = {...this.state.filter};
        filter.FromHarbor = {Name};
        this.setState({filter});
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,
            isLoaded: false,
            search: "",
            focus: false,
            filter: {},
            FerryRoute: null,
            FerryRoutes: [],
            FerryRoutesResults: [],
            Deviations: [],
            InfoMessages: [],
            Departures: [],
            Interval: null,
        };
        this.searchInput = React.createRef();
    }

    componentDidMount() {
        //If localstorage exist set those routes until we get response with new ones
        if(localStorage.getItem("FerryRoutes")){
            let FerryRoutes = JSON.parse(localStorage.getItem("FerryRoutes"));
            this.setState({FerryRoutes});
        }
        this.getFerryRoutes().then(FerryRoutes => {
            //If localstorage is set choose that route
            if(localStorage.getItem("FerryRoute") !== null){
                this.chooseFerryRoute(JSON.parse(localStorage.getItem("FerryRoute")))
            }

            this.setState({FerryRoutes});
            localStorage.setItem("FerryRoutes", JSON.stringify(FerryRoutes));

            //Get Deviations for all the FerryRoutes
            this.getDeviations(FerryRoutes.map(Route => {
                return Route.DeviationId
            })).then(Deviations => {
                this.setState({Deviations});
                });
        });
    }

    render() {
        return (
            <div className={`App`}>
                <ToastContainer className={`text-center`} position={toast.POSITION.TOP_CENTER} hideProgressBar={true}/>
                <header id={"header"}>
                    <div id={"searchBar"} className={"box"}>
                        <input
                            ref={this.searchInput}
                            onChange={this.inputSearchHandler}
                            onFocus={()=>{this.setState({focus:true})}}
                            onBlur={()=>{this.setState({focus:false})}}
                            value={this.state.search}
                            name={"search"}
                            placeholder={"Sök färjeled eller hamn"}
                            aria-label={"Sök färjeled eller hamn"}
                            autoComplete={"off"}
                        />
                        {this.state.search !== "" ? <span id={"resetSearch"} onClick={()=>{this.search(""); this.searchInput.current.focus()}}><i className="fa fa-times-circle"/></span> : null}
                    </div>
                    <ul id={"searchResults"} className={"box"}>
                        {this.state.FerryRoutesResults.length !== 0 ?
                            this.state.FerryRoutesResults.map((FerryRoutesResult) => (
                                <li key={FerryRoutesResult.Id} onClick={() => {this.chooseFerryRoute(FerryRoutesResult)}}>
                                    {FerryRoutesResult.Name}
                                </li>
                            ))
                            :
                            this.state.search !== "" && this.state.FerryRoute === null ?
                                <li className={"noResult"}><i className="fa fa-frown"/> <br/>Vi hittade inga färjor med det namnet</li>
                                :
                                null
                        }
                    </ul>
                </header>
                <main id={"main"}>
                    <div className={"ChosenFerryRoute"}>
                        { this.state.FerryRoute !== null && !this.state.isLoading  ?
                            this.state.Deviations.map((Deviation) => {
                                if (Deviation.Id === this.state.FerryRoute.DeviationId) {
                                    return <DeviationComponent key={Deviation.Message} Deviation={Deviation}/>
                                }
                            })
                            :
                            null}
                        { this.state.FerryRoute !== null && this.state.FerryRoute.Type.Id === 2 ? <HarborFilter Harbors={this.state.FerryRoute.Harbor} changeHarbor={this.changeHarbor.bind(this)}/> : null}
                        { this.state.FerryRoute !== null && this.state.Departures.length > 0 ? <DepartureList Departures={this.state.Departures} FerryRoute={this.state.FerryRoute} filter={this.state.filter} updateDepartures={this.updateDepartures.bind(this)}/>: null }
                        { this.state.FerryRoute !== null && this.state.Departures.length === 0 && this.state.isLoading ? 
                            <div className="margin">
                                <div className="loading" /> 
                                <div className="loading light-gray" /> 
                                <div className="loading" /> 
                                <div className="loading light-gray" /> 
                                <div className="loading" /> 
                            </div>
                            : 
                            null }
                    </div>
                    { this.state.Departures.length > 0 ? <div id={"mapOverlay"} onClick={()=>{this.search("")}}/>: null }
                </main>
                <div className={`Map${this.state.FerryRoute !== null ? " blur" : ""}`}>
                    <MapComponent FerryRoute={this.state.FerryRoute} FerryRoutes={this.state.FerryRoutes} FerryRoutesResults={this.state.FerryRoutesResults} chooseFerryRoute={this.chooseFerryRoute.bind(this)}/>
                </div>
                <Home focus={`${this.state.focus || this.state.search ? "hide" : ""}`}/>
            </div>
        );
    }
}

export default App;
