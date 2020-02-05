import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from 'react-router-dom';
import { withRouter } from 'react-router';

// import axios from 'axios';
// import SimpleBar from 'simplebar-react';
// import { Icon } from '@iconify/react';
// import userIcon from '@iconify/icons-el/user';
// import mapMarker from '@iconify/icons-mdi/map-marker';


import Header from './Header';
import Map from './Map';
import Requests from './Requests';
import NewRequest from './NewRequest';
import EditRequest from './EditRequest';
import Account from './Account';


class Main extends React.Component {
  state = {
    current_lng: 51,
    current_lat: 32,
    current_zoom: 13,
    geolocated_lat: 51,
    geolocated_lng: 32,
    geolocationFinished: false,
    notification: '',
    showNotification: false,
    avatarImg: null,
    avatarImgThumb25: null,
    avatarImgThumb50: null,
    avatarImgThumb128: null,
    avatarImg: preloadedData.avatar_img_url,
    avatarImgThumb25: preloadedData.avatar_img_25_url,
    avatarImgThumb50: preloadedData.avatar_img_50_url,
    avatarImgThumb128: preloadedData.avatar_img_128_url
};


  componentDidMount() {
    this.getCurrentLocation().then((pos) => {
      this.setState(() => ({ 
        current_lat: pos.lat, 
        current_lng: pos.lng,
        geolocated_lat: pos.lat, 
        geolocated_lng: pos.lng
      }))
    }).finally(()=>{
      this.setState(() => ({ geolocationFinished: true }));
    });
  }

  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      this.onRouteChanged();
    }
  }

  onRouteChanged() {
    this.setState(() => ({ 
      showNotification: false,
      notification: ''
    }));
  }  

  getCurrentLocation = () => {
    return new Promise(function(resolve, reject) {
      // Try HTML5 geolocation.
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          let pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          resolve(pos);
        }, function(e) {
          reject(new Error("geolocation error"));
        });
      } else {
        reject(new Error("geoloation not supported"));
      }
    });
  }

  storeLastPos = (lat, lng, zoom) => {
    this.setState(()=>({
      current_lat: lat, 
      current_lng: lng,
      current_zoom: zoom
    }));
  }

  handleNotification = (text) => {
    this.setState(()=>({
      showNotification: true,
      notification: text
    }));
  }

  closeNotification = () => {
    this.setState(()=>({showNotification: false}));
  }

  avatarChanged = (avatarData) => {
    const { avatar_img_url, avatar_img_25_url, avatar_img_50_url, avatar_img_128_url } = avatarData;
    this.setState(()=>({
      avatarImg: avatar_img_url,
      avatarImgThumb25: avatar_img_25_url,
      avatarImgThumb50: avatar_img_50_url,
      avatarImgThumb128: avatar_img_128_url 
    }));
  }

  render() {
    const { location } = this.props;
    const { current_lat, current_lng, geolocated_lat, geolocated_lng, current_zoom, geolocationFinished } = this.state; 
    const { notification, showNotification, avatarImgThumb128, avatarImgThumb50 } = this.state;

    let notificationEl;
    if(showNotification){
      notificationEl = (
        <div className="notification">
          {notification}
          <button onClick={this.closeNotification}>close</button>
        </div>
      )
    }

    return (
      <>
        <Header avatarUrl={avatarImgThumb50}/>
        {notificationEl}
        <Switch location={location}>
          <Route exact path="/">
            <Map current_lat={current_lat} 
                current_lng={current_lng} 
                current_zoom={current_zoom} 
                geolocationFinished={geolocationFinished}
                storeLastPos={this.storeLastPos} />
          </Route>
          <Route path="/requests">
            <Requests />
          </Route>
          <Route exact path="/new_request">
            <NewRequest geolocationFinished={geolocationFinished}
                    geolocated_lat={geolocated_lat}
                    geolocated_lng={geolocated_lng}
                    handleNotification={this.handleNotification}/>
          </Route>
          <Route exact path="/edit_request/:id">
            <EditRequest geolocationFinished={geolocationFinished}
                    geolocated_lat={geolocated_lat}
                    geolocated_lng={geolocated_lng}
                    handleNotification={this.handleNotification}/>
          </Route>
          <Route path="/messages">
            Messages
          </Route>

          <Route exact path="/account">
            <Account handleNotification={this.handleNotification} avatarChanged={this.avatarChanged} avatarUrl={avatarImgThumb128} />

          </Route>

        </Switch>
      </>
    );
  }
}


export default withRouter(Main);