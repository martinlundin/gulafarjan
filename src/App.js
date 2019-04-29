import React, {Component} from 'react';
import axios from "axios"
import './assets/css/style.scss';

class App extends Component {

    /**
     * Api documentation: http://api.trafikinfo.trafikverket.se/API/TheRequest
     */

    api = (query) => {
        return axios({
            method: "post",
            url: "http://api.trafikinfo.trafikverket.se/v1.3/data.json",
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
    getDeviations = (ids, timeDiff = "-0.00:00:00") => {
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
    getDepartures = (routeId, timeDiff = "-0.00:00:00", limit = 50) => {
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

    constructor(props) {
        super(props);
        this.state = {
            isLoaded: false,
            search: "",
            FerryRoute: null,
            FerryRoutes: [],
            FerryRoutesResults: [],
            Deviations: [],
            InfoMessages: []
        };
    }

    componentDidMount() {
        this.getFerryRoutes().then(FerryRoutes => {

            console.log("Routes");
            console.log(FerryRoutes);
            this.setState({FerryRoutes});

            //Get Deviations for all the FerryRoutes
            this.getDeviations(FerryRoutes.map(Route => {
                return Route.DeviationId
            })).then(Deviations => {

                console.log("Deviations");
                console.log(Deviations);
                this.setState({Deviations});
            });
        });

        //Test to get departures, this will be called onClick later
        this.getDepartures(39).then(departures => {
            console.log(departures)
        })
    }

    searchChangeHandler = event => {
        this.setState({
            search: event.target.value,
            FerryRoutesResults: this.state.FerryRoutes.filter(FerryRoute => {
                if (event.target.value !== "") {
                    if (FerryRoute.Name.toLowerCase().match(event.target.value.toLowerCase()) !== null) {
                        return FerryRoute
                    } else if (FerryRoute.Harbor[0].Name.toLowerCase().match(event.target.value.toLowerCase()) !== null || FerryRoute.Harbor[1].Name.toLowerCase().match(event.target.value.toLowerCase()) !== null) {
                        return FerryRoute
                    } else {
                        return null
                    }
                } else {
                    return null
                }
            }).slice(0, 8)
        });
    };

    chooseFerryRoute(FerryRoute) {
        //Set search states
        this.setState({
            search: FerryRoute.Name,
            FerryRoute: FerryRoute,
            FerryRoutesResults: [],
        });
    }

    render() {
        return (
            <div className="App">
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

                </main>
            </div>
        );
    }
}

export default App;
