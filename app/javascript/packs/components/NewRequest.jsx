import React from 'react';
import RequestForm from './RequestForm';


class NewRequest extends React.Component {


  render() {
    const { geolocated_lat, geolocated_lng, handleNotification, geolocationFinished } = this.props;
    const newRequest = {
      title: "",
      description: "",
      address: "",
      lat: geolocated_lat,
      lng: geolocated_lng,
      request_type: 'one_time_task',
    }

    return (
      <>
        <section id="requests">
          <div className="container">
            <RequestForm request={newRequest}  
                          geolocationFinished={geolocationFinished}
                          geolocated_lat={geolocated_lat}
                          geolocated_lng={geolocated_lng}
                          handleNotification={handleNotification} />
          </div>
        </section>  
      </>
    );
  }
}


export default NewRequest;