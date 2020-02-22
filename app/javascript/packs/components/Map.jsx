import React from 'react';
import { withRouter } from 'react-router';
import axios from 'axios';
import Pusher from 'pusher-js';
import {
  BrowserRouter as Router,
  Link,
} from "react-router-dom";
import { Icon } from '@iconify/react';
import userCircle from '@iconify/icons-fa-solid/user-circle';
import Moment from 'react-moment'

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
    requestsTotal: 0,
    currentUserId: preloadedData.current_user_id,
    isAsync: false,
  };


  componentDidMount() {

    const pusher = new Pusher(process.env.PUSHER_API, {
      cluster: 'eu',
      encrypted: true
    });
    this.channel = pusher.subscribe('map_status');
    this.channel.bind('reqest_count_change', data => {
      this.setState(()=>({ requestsTotal: data.message }));
    });

    const crf =  document.getElementsByName("csrf-token")[0].getAttribute("content");
    this.setState(()=>({crf: crf}));

  }


  componentWillUnmount() {
    this.props.storeLastPos(this.map.getCenter().lat(), this.map.getCenter().lng(), this.map.getZoom());

    this.channel.unbind();
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
    // this.setState(()=>({
    //   requestSelected: request,
    //   infoWindowOpen: true,
    // }));
    this.setState(()=>({requestForDetail: request}));

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

  volunteerToRequest = (request) => {
    const { crf } = this.state;
    const { handleNotification } = this.props;
    const url = `/api/requests/${request.id}/sign_to_volunteer`;

    const config = {
      headers: {
        'X-CSRF-Token': crf,
      }
    }

    this.setState(()=>({isAsync: true}));
    axios.post(url, {}, config)
      .then(res => {
        handleNotification('Succefully volunteered to request');
        const { history } = this.props;
        this.setState(()=>({isAsync: false}));
        history.push(`/volunteering/${request.id}`);
    
      }, (error)=>{
        this.setState(()=>({isAsync: false}));
        handleNotification('Volunteer failed');
        console.error(error);
      });
    
   }

  render() {
    const { requests, requestsTotal, requestSelected, requestForDetail, infoWindowOpen, isAsync } = this.state;
    const markerList =  requests.map((r)=> {
      let url;
      if(r.request_type=='one_time_task'){
        url = 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      } else {
        url = 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
      }
      let size = 40;
      if(r.is_my_request){
        size = 30;
      }
      return (
        <Marker key={r.id} 
          position={{ lat: r.lat, lng: r.lng }} 
          onClick={()=>{ this.markerClicked(r) }}
          icon={{  
            url: url, 
            scaledSize: new google.maps.Size(size, size),
            }} />
      );
    });


    let infoWindowContent;
    if(requestSelected) {
      infoWindowContent = (
        <div>{ requestSelected.title }</div>
      );
    }

    return (
      <section id="map">
        <div>
          
          <div className="map-menu">
            Unfulfilled requests: {requestsTotal}
          </div>
          <LoadScript id="script-loader"
            googleMapsApiKey={ process.env.MAP_API }>

            <GoogleMap id='google-map'
              options={{ streetViewControl:false }}
              onLoad={ (m) => {this.mapLoaded(m)} }
              onIdle={ () => {this.onMapIdle()} }
            >

            {markerList}

            { infoWindowOpen && requestSelected &&
              <InfoWindow onCloseClick={this.handleInfoWindowClose} position={{ lat: requestSelected.lat, lng: requestSelected.lng }}>
                <>
                  <div>{requestSelected.title}</div>
                  <a onClick={ () => { this.handleRequestDetail(requestSelected) } } className="tooltip-link">more</a>
                </>
              </InfoWindow>
            }

            </GoogleMap>
          </LoadScript>
          
          { requestForDetail && 
            <Modal style={{background: 'rgba(0, 0, 0, 0.5)'}} 
              containerClassName="request-detail-modal"
              show={requestForDetail ? true : false}
              onClose={this.closeDetailsModal}
              // containerStyle={{width: '600px'}}
              >
              <div className="header">
                <div className="title">
                  {requestForDetail.title}
                </div>
                <button className="close-btn" onClick={this.closeDetailsModal}>x</button>
              </div>

              <div className="content">
                { requestForDetail.is_my_request &&
                  <div className="text-center text-success mb-2">This is your own request</div>
                } 
                { requestForDetail.volunteered &&
                  <div className="text-center text-success mb-2">You already volunteered to this request</div>
                } 
                  
                <div className="row">
                  <div className="col-sm-7">
                    <p className="small-label">Request type:</p>
                    <p>{ requestForDetail.request_type=='one_time_task' ? 'One time task' : 'Material need' }</p>

                    <p className="small-label">Place:</p>
                    <p>{requestForDetail.address}</p>

                  </div>
                  <div className="col-sm-5">
                    <p className="small-label">Requester:</p>
                    <p className="requester-name">
                      { requestForDetail.requester_avatar_50 && 
                        <img src={requestForDetail.requester_avatar_50} className="img-circle header-avatar-img"/>
                      }
                      { requestForDetail.requester_avatar_50==null && 
                        <Icon icon={userCircle} />
                      }
                      { requestForDetail.requester_username }
                    </p>

                    <p className="small-label">Published:</p>
                    <p><Moment format="YYYY.MM.DD H:mm">{ requestForDetail.created_at }</Moment></p>

                  </div>
                </div>


                <p className="small-label">Description:</p>
                <p>{requestForDetail.description}</p>

              </div>

              <div className="footer">
                { requestForDetail.is_my_request &&
                  <Link to={`/requests/${requestForDetail.id}`} className="btn btn-my">Details</Link>
                }
                { !requestForDetail.is_my_request && !requestForDetail.volunteered && 
                  <button className="btn btn-my" disabled={ isAsync ? true : false } onClick={ () => { this.volunteerToRequest(requestForDetail) } }>Lets do it!</button>
                }
                { !requestForDetail.is_my_request && requestForDetail.volunteered && 
                  <Link to={`/volunteering/${requestForDetail.id}`} className="btn btn-my">Details</Link>
                }
                
                <button className="btn btn-cancel" onClick={this.closeDetailsModal}>Close</button>
              </div>
            </Modal>
          }
        </div>
        
      </section>
    );
  }
}


export default withRouter(Map);