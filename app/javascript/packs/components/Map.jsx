import React from 'react';
import { withRouter } from 'react-router';
import axios from 'axios';

// import SimpleBar from 'simplebar-react';
// import { Icon } from '@iconify/react';
// import userIcon from '@iconify/icons-el/user';
// import mapMarker from '@iconify/icons-mdi/map-marker';

// import 'simplebar/dist/simplebar.min.css';

import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'

class Map extends React.Component {
  state = {
    map: null,
    requests: [],
    bounds: {
      lat_h: null,
      lat_l: null,
      lng_h: null,
      lng_l: null
    },
    requestSelected: null,

  };

  componentWillUnmount() {
    this.props.storeLastPos(this.map.getCenter().lat(), this.map.getCenter().lng(), this.map.getZoom());
  }

  componentDidUpdate(prevProps) {
    const { geolocationFinished, current_lat, current_lng } = this.props;
    // if geolocation has been performed and map exist
    if (geolocationFinished !== prevProps.geolocationFinished && this.map) {
      this.map.setCenter({lat: current_lat, lng: current_lng});
    }
  }


  loadRequests = async (bounds) => {
    try {
      let result = await axios.get(`/api/map_requests`, { params: {
        lat_h: bounds.lat_h,
        lat_l: bounds.lat_l,
        lng_h: bounds.lng_h,
        lng_l: bounds.lng_l
      }});
      this.setState(()=>({requests: result.data.requests}));
    } 
    catch(error) {
      console.error(error);
    }
  }


  mapLoaded = (m) => {
    this.map = m;

    const { current_lat, current_lng, current_zoom } = this.props;
    this.map.setCenter({lat: current_lat, lng: current_lng});
    this.map.setZoom(current_zoom);
  }

  onMapIdle = () => {
    const bounds = this.map.getBounds();
    const b1 = { 
      lat_h: bounds.pa.h,
      lat_l: bounds.pa.g,
      lng_h: bounds.ka.h,
      lng_l: bounds.ka.g
    }
    const { bounds:b2 } = this.state;
    if(b1.lat_h===b2.lat_h && b1.lat_l===b2.lat_l && b1.lng_h===b2.lng_h && b1.lng_l===b2.lng_l){
      return;
    }
    this.loadRequests(b1).then(()=>{
      this.setState(()=>({
        bounds: {
          lat_h: bounds.pa.h,
          lat_l: bounds.pa.g,
          lng_h: bounds.ka.h,
          lng_l: bounds.ka.g    
        }
      }));
    });
  }

  markerClicked = (request) => {
    this.setState(()=>({requestSelected: request}));
  }

  openInfoWindow = (request) => {
    if(this.infoWindow) {
      this.infoWindow.position = { lat: request.lat, lng: request.lng };
      this.infoWindow.open();
    }
  }
  // infoWindowCloseBtnClicked = () => {
  //   setState(()=>({requestSelected: null}));
  // }

  infoWindowOnLoad = (infoWindow) => {
    this.infoWindow = infoWindow;
    this.infoWindow.close();
  }

  render() {
    const { requests, requestSelected } = this.state;

    const markerList =  requests.map((r)=> 
      <Marker key={r.id} position={{ lat: r.lat, lng: r.lng }} onClick={()=>{ this.markerClicked(r) }}/>
    );

    // let infoWindowContent;
    // if(requestSelected){
    //   infoWindowContent = (
    //     <div>
    //       <h4>{requestSelected.title}</h4>
    //     </div>
    //   );
    // }

    return (
      <>
        <div>
          <div className="map-menu">
            Map menu
          </div>
          <LoadScript id="script-loader"
            googleMapsApiKey={ process.env.MAP_API }>

            <GoogleMap id='example-map'
              mapContainerStyle={{
                height: "600px",
                width: "100%"
              }}
              onLoad={ (m) => {this.mapLoaded(m)} }
              onIdle={ () => {this.onMapIdle()} }
            >

            {markerList}

            {/* <InfoWindow onLoad={()=>{this.infoWindowOnLoad()}}>
              <div>title</div>
            </InfoWindow> */}

            </GoogleMap>
          </LoadScript>

        </div>
      </>
    );
  }
}


export default withRouter(Map);