import React, {useEffect, useState} from 'react';
import { useParams } from "react-router-dom";
import '../assets/css/style.scss';
import HarborFilter from '../components/HarborFilter'
import DeviationComponent from '../components/Deviation'
import DepartureList from "../containers/DepartureList";
import FerryRoutesInformation from '../assets/json/FerryRoutesInformation.json'

function Ferry(props) {
    const { ferryRouteName } = useParams()
    const [FerryRouteId, setFerryRouteId] = useState('')
    const [FerryRouteInformation, setFerryRouteInformation] = useState('')

    useEffect(() => {
        props.chooseFerryRoute(FerryRouteId)

        setFerryRouteInformation(FerryRoutesInformation[ferryRouteName])
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [FerryRouteId]);
    
    useEffect(() => {
        if(FerryRouteId !== props.getFerryRouteIdByName(ferryRouteName)){
            setFerryRouteId(props.getFerryRouteIdByName(ferryRouteName))
        }
        if(props.FerryRoute !== null) document.title = 'Tidtabell för ' + props.FerryRoute.Name + ' - Gulafärjan'
    }, [FerryRouteId, ferryRouteName, props])
    return (
        <div>
            { props.FerryRoute !== null ? (
            <>
            <div className={"ChosenFerryRoute"}>
                { !props.isLoading  ?
                    props.Deviations.map((Deviation) => {
                        if (Deviation.Id === props.FerryRoute.DeviationId) {
                            return <DeviationComponent key={Deviation.Message} Deviation={Deviation}/>
                        }
                    })
                    :
                    null}
                { props.FerryRoute.Type.Id === 2 ? <HarborFilter Harbors={props.FerryRoute.Harbor} changeHarbor={props.changeHarbor.bind(this)}/> : null}
                { props.Departures.length > 0 ? <DepartureList Departures={props.Departures} FerryRoute={props.FerryRoute} filter={props.filter} updateDepartures={props.updateDepartures.bind(this)}/>: null }
                { props.Departures.length === 0 && props.isLoading ? 
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
            <div className={"FerryRouteInformation box"}>
                {
                    FerryRouteInformation ? (
                        <div>
                            {
                                FerryRouteInformation.img ? (
                                    <div className={"FerryRouteImage"}>
                                        <img src={FerryRouteInformation.img} />
                                    </div>
                                ) : null
                            }
                            <div className={"FerryRouteText"}>
                            <h1>{ props.FerryRoute.Name }</h1>
                            <h2>{ FerryRouteInformation.secondaryHeadline }</h2>
                            { FerryRouteInformation.text.map((t, index) => (
                                <p key={index}>{t}</p>
                            )) }
                            {
                                FerryRouteInformation.help ? (
                                <p>
                                    <i>
                                        Hjälp gärna till med att fylla på med mer information eller om du har någon fin bild att dela. Skicka ett mail till <a href={"mailto:martin@fokusiv.com?subject="+ props.FerryRoute.Name }>martin@fokusiv.com</a>
                                    </i>
                                </p>
                                ) : null
                            }
                            </div>
                        </div>
                    ) : (
                        <div  className={"FerryRouteText"}>
                            <h1>{ props.FerryRoute.Name }</h1>
                            <p>
                                Med gulafärjans tidtabell ser du enkelt när nästa färja går. Missa aldrig en färja igen!
                            </p>
                            <p>
                                <i>Denna färjeled saknar information. Vill du skriva en liten text eller visa en fin bild på färjeleden?</i>
                            </p>
                            <p>
                                <i>
                                Skicka ett mail till <a href={"mailto:martin@fokusiv.com?subject="+ props.FerryRoute.Name }>martin@fokusiv.com</a>
                                </i>
                            </p>
                        </div>
                    )
                }
            </div>
            </>
            ) : null }
        </div>
    )
}

export default Ferry
