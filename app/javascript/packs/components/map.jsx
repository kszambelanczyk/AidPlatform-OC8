import React from 'react';
// import axios from 'axios';
// import SimpleBar from 'simplebar-react';
// import { Icon } from '@iconify/react';
// import userIcon from '@iconify/icons-el/user';
// import mapMarker from '@iconify/icons-mdi/map-marker';

// import 'simplebar/dist/simplebar.min.css';

import { GoogleMap, LoadScript } from '@react-google-maps/api'

class Map extends React.Component {
  state = {
    lat: -3.745,
    lng: -38.523
  };

  componentDidMount() {
    // axios.get(`/api/riders`)
    //   .then(res => {
    //     const {riders, bounds} = res.data;
    //     // this.setState({ riders });
    //     this.props.setRiders([...riders], {...bounds});
    //     this.setState(() => ({ filteredRiders: [...riders] }));
    //   });
    this.getCurrentLocation().then((pos) => {
      this.setState(() => ({ lat: pos.lat, lng: pos.lng }));
    })
  }

  getCurrentLocation = () => {
    return new Promise(function(resolve, reject) {
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
    

    // Try HTML5 geolocation.
    return pos;
  }

  zoomTo(pos, zoom=13) {

  }


  render() {
    const { lat, lng } = this.state; 

    return (
      <>
        <div>
          <LoadScript id="script-loader"
            googleMapsApiKey={ process.env.MAP_API }>
            <GoogleMap id='example-map'
              mapContainerStyle={{
                height: "600px",
                width: "100%"
              }}
              zoom={13}
              center={{
                lat: lat,
                lng: lng
              }}
            >

            </GoogleMap>
          </LoadScript>

        </div>
      </>
    );
  }
}


export default Map;