import React from 'react';
import { withRouter } from 'react-router';
import axios from 'axios';
import Pusher from 'pusher-js';

// import SimpleBar from 'simplebar-react';
// import { Icon } from '@iconify/react';
// import userIcon from '@iconify/icons-el/user';
// import mapMarker from '@iconify/icons-mdi/map-marker';

// import 'simplebar/dist/simplebar.min.css';

import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import Modal from 'simple-react-modal'


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
    requestForDetail: null,
    infoWindowOpen: false,
    requestsTotal: 0
  };


  componentDidMount() {
    const pusher = new Pusher('9bee2ff5f008f8eb221f', {
      cluster: 'eu',
      encrypted: true
    });
    this.channel = pusher.subscribe('map_status');
    this.channel.bind('reqest_count_change', data => {
      this.setState(()=>({ requestsTotal: data.message }));
    });
  }


  componentWillUnmount() {
    this.props.storeLastPos(this.map.getCenter().lat(), this.map.getCenter().lng(), this.map.getZoom());

    this.channel.unbind_all();
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
      this.setState(()=>({
        requests: result.data.requests,
        requestsTotal: result.data.requests_count
      }));
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
    if(!bounds) {
      return;
    }
    const b1 = { 
      lat_h: bounds.getNorthEast().lat(),
      lat_l: bounds.getSouthWest().lat(),
      lng_h: bounds.getNorthEast().lng(),
      lng_l: bounds.getSouthWest().lng()
    }
    const { bounds:b2 } = this.state;
    if(b1.lat_h===b2.lat_h && b1.lat_l===b2.lat_l && b1.lng_h===b2.lng_h && b1.lng_l===b2.lng_l){
      return;
    }
    this.loadRequests(b1).then(()=>{
      this.setState(()=>({
        bounds: {
          lat_h: bounds.getNorthEast().lat(),
          lat_l: bounds.getSouthWest().lat(),
          lng_h: bounds.getNorthEast().lng(),
          lng_l: bounds.getSouthWest().lng()
        }
      }));
    });
  }

  markerClicked = (request) => {
    this.setState(()=>({
      requestSelected: request,
      infoWindowOpen: true,
    }));
  }

  handleInfoWindowClose = () => {
    this.setState(()=>({infoWindowOpen: false}));
  }

  handleRequestDetail = (request) => {
    this.setState(()=>({requestForDetail: request}));
  }

  closeDetailsModal = () => {
    this.setState(()=>({requestForDetail: null}));
  }

  render() {
    const { requests, requestsTotal, requestSelected, requestForDetail, infoWindowOpen } = this.state;

    const markerList =  requests.map((r)=> 
      <Marker key={r.id} position={{ lat: r.lat, lng: r.lng }} onClick={()=>{ this.markerClicked(r) }}/>
    );

    let infoWindowContent;
    if(requestSelected) {
      infoWindowContent = (
        <div>{ requestSelected.title }</div>
      );
    }

    return (
      <>
        <div>
          <div className="map-menu">
            Map menu
            Unfulfilled requests: {requestsTotal}
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

            { (infoWindowOpen && requestSelected) &&
              <InfoWindow onCloseClick={this.handleInfoWindowClose} position={{ lat: requestSelected.lat, lng: requestSelected.lng }}>
                <>
                  <div>{requestSelected.title}</div>
                  <a onClick={ () => { this.handleRequestDetail(requestSelected) } }>details</a>
                </>
              </InfoWindow>
            }

            </GoogleMap>
          </LoadScript>
          
          <Modal style={{background: 'rgba(0, 0, 0, 0.5)'}} containerClassName="test" show={requestForDetail ? true : false} onClose={this.closeDetailsModal}>
            <div>hey, click outside of me to close me!</div>
          </Modal>

          
        </div>
      </>
    );
  }
}


export default withRouter(Map);