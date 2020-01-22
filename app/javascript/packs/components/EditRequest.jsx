import React from 'react';
import RequestForm from './RequestForm';
import axios from 'axios';
import { withRouter } from 'react-router';


class EditRequest extends React.Component {
  state = {
    request: null,
  };

  componentDidMount() {
    const { id } = this.props.match.params;
    this.loadRequest(id);
  }

  loadRequest = async (id) => {
    try {
      let result = await axios.get(`/api/requests/${id}`);
      this.setState(()=>({request: result.data.request}));

    } 
    catch(error) {
      console.error(error);
    }
  }

  render() {
    const { request } = this.state;
    const { geolocated_lat, geolocated_lng, handleNotification, geolocationFinished } = this.props;

    if(!request){
      return (
        <section id="requests">
          <div className="container">
            Loading...
          </div>
      </section>  
      )
    } 
    return (
      <section id="requests">
        <div className="container">
          <RequestForm request={request} 
                      geolocationFinished={geolocationFinished}
                      geolocated_lat={geolocated_lat}
                      geolocated_lng={geolocated_lng}
                      handleNotification={handleNotification} />
        </div>
      </section>  
    );
  }
}


export default withRouter(EditRequest);