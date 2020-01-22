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


class Main extends React.Component {
  state = {
    current_lng: 51,
    current_lat: 32,
    current_zoom: 13,
    geolocated_lat: 51,
    geolocated_lng: 32,
    geolocationFinished: false,
    notification: '',
    showNotifcation: false,
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
        }, function() {
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
      showNotifcation: false,
      notification: text
    }));
  }

  closeNotification = () => {
    this.setState(()=>({showNotifcation: false}));
  }

  render() {
    const { location } = this.props;
    const { current_lat, current_lng, geolocated_lat, geolocated_lng, current_zoom, geolocationFinished } = this.state; 
    const { notification, showNotifcation } = this.state;

    const contextValue = {
      handleFunc: this.contextFunc
    }

    let notificationEl;
    if(showNotifcation){
      notificationEl = (
        <div className="notification">
          {notification}
          <button onClick={this.closeNotification}>close</button>
        </div>
      )
    }

    return (
      <>
        <Header />
        {notificationEl}
        <Switch location={location}>
          <Route exact path="/">
            <Map current_lat={current_lat} 
                geolocationFinished={geolocationFinished}
                current_lng={current_lng} 
                current_zoom={current_zoom} 
                storeLastPos={this.storeLastPos} />
          </Route>
          <Route exact path="/requests">
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
          <Route exact path="/messages">
            Messages
          </Route>
        </Switch>
      </>
    );
  }
}


export default withRouter(Main);