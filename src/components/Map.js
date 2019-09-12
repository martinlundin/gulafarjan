import React, { Component } from 'react';
import { Map, GoogleApiWrapper } from 'google-maps-react';
import markerIcon from '../assets/img/gulafarjan.png'
import MarkerCluster from './MarkerCluster'
import mapStyle from '../assets/map/blackandwhite.json'

export class MapComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            mapStyles: {
                background: '#333333',
                width: '100%',
                height: '100%'
            },
            avalibleFerryRoutes: this.props.FerryRoutes
        };
    }

    getPositionFromRoute = (FerryRoute) => {
        let regex = /\(([^)]+)\)/;
        let stringPosition = regex.exec(FerryRoute.Geometry.WGS84)[1];
        let arrayPosition = stringPosition.split(" ");

        return {
            lng: Number(arrayPosition[0]),
            lat: Number(arrayPosition[1]),
        }
    };

    updateMapBounds = () => {
        let bounds = new this.props.google.maps.LatLngBounds();
        this.state.avalibleFerryRoutes.map((FerryRoute) => {
            bounds.extend(new window.google.maps.LatLng(this.getPositionFromRoute(FerryRoute)));
        });
        let offset = 20;
        let padding = {
            top: document.getElementById("header").clientHeight+offset,
            bottom: document.getElementById("home").clientHeight+offset,
            left: offset,
            right: offset
        };
        this.refs.gmap.map.fitBounds(bounds, padding)
    };

    componentDidUpdate(prevProps){
        if(this.props.FerryRoute === null){
            if(prevProps.FerryRoutesResults !== this.props.FerryRoutesResults){
                if(this.props.FerryRoutesResults.length > 0){
                    this.setState({avalibleFerryRoutes: this.props.FerryRoutesResults}, () => {this.updateMapBounds()})
                }else{
                    this.setState({avalibleFerryRoutes: this.props.FerryRoutes}, () => {this.updateMapBounds()})
                }
            }
        }
    }

    render() {
        return (
            <Map
                google={this.props.google}
                ref="gmap"
                zoom={5 }
                style={this.state.mapStyles}
                styles={mapStyle}
                initialCenter={{
                    lng: 17.08700585,
                    lat: 61.29914475
                }}
                disableDefaultUI={true}
                maxZoom={11}
            >
                <MarkerCluster
                    markers={this.state.avalibleFerryRoutes.map((FerryRoute) => {
                        return {
                            name: FerryRoute.Name,
                            label: {
                                text: FerryRoute.Name,
                                color: "#feda4a",
                                fontSize: "9px",
                                fontFamily: "PT Sans, sans-serif",
                                fontWeight: "bold"
                            },
                            position: this.getPositionFromRoute(FerryRoute),
                            icon: {
                                url: markerIcon,
                                anchor: new this.props.google.maps.Point(15,15),
                                scaledSize: new this.props.google.maps.Size(30,30),
                                labelOrigin: new this.props.google.maps.Point(15,35),
                            },
                            onClick: () => {this.props.chooseFerryRoute(FerryRoute)}
                        }
                    })}
                />
            </Map>
        );
    }
}

export default GoogleApiWrapper({
    apiKey: 'AIzaSyA1WFar8T4jePHDPwxkWwpgRJYsNVK96ec'
})(MapComponent);