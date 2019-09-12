import {useEffect} from 'react'
import PropTypes from 'prop-types'
import MarkerClusterer from '@google/markerclusterer'

const evtNames = [
    'click',
    'dblclick',
    'dragend',
    'mousedown',
    'mouseout',
    'mouseover',
    'mouseup',
    'recenter',
]

const MarkerCluster = (props) => {
    const {map, google, markers} = props

    const handleEvent = ({event, marker, entry}) => {
        if (props[event]) {
            props[event]({
                props: props,
                marker: marker,
                event: event,
                entry: entry
            })
        }
    }

    // This hook works like ComponentWillMount
    // The  hook isn't really needed, this whole thing worked without it,
    // I added the hook so that I could implement a cleanup function
    useEffect(() => {
        if (map && markers) {
            const mapMarkers = markers.map((marker) => {
                    const entry = new google.maps.Marker({...marker})
                entry.addListener("click", () => {marker.onClick()});

                evtNames.forEach(e => {
                    entry.addListener(e, () => handleEvent({
                        event: e,
                        marker: marker,
                        entry: entry
                    }))
                })

                return entry
            })

            const clusterer = new MarkerClusterer(map, mapMarkers, {imagePath: '/img/map/m'});
            clusterer.setGridSize(50);

            // Cleanup function. Note, this is only returned if we create the markers
            return () => {
                //console.log('Cleaning up markers')
                clusterer.clearMarkers()
            }
        }
    }, [map, google, markers])


    // Do we need to render anything??
    return (null)

}

MarkerCluster.propTypes = {
    map: PropTypes.object,
    google: PropTypes.object,
    markers: PropTypes.arrayOf(PropTypes.shape({
        position: PropTypes.shape({
            lat: PropTypes.number.isRequired,
            lng: PropTypes.number.isRequired,
        }).isRequired,
        name: PropTypes.string.isRequired,
        label: PropTypes.object,
        icon: PropTypes.object,
        animation: PropTypes.object,
        onClick: PropTypes.func,
    })),
}

export default MarkerCluster