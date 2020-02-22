import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { confirmAlert } from 'react-confirm-alert';
// import 'react-confirm-alert/src/react-confirm-alert.css';
// import SimpleBar from 'simplebar-react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import Moment from 'react-moment'
import { Icon, InlineIcon } from '@iconify/react';
import baselineCheck from '@iconify/icons-ic/baseline-check';
import baselineMessage from '@iconify/icons-ic/baseline-message';
import bxUserCheck from '@iconify/icons-bx/bx-user-check';
import userCircle from '@iconify/icons-fa-solid/user-circle';

import VolunteerRequestDetail from './VolunteerRequestDetail';

class Volunteering extends React.Component {
  state = {
    loadingVolunteers: false,
    volunteers: [],
    crf: '',
  };

  componentDidMount() {
    const crf =  document.getElementsByName("csrf-token")[0].getAttribute("content");
    this.setState(()=>({crf: crf}));

    this.loadVolunteers();
  }

  loadVolunteers = () => {
    this.setState(()=>({loadingVolunteers: true}));
    try {
      axios.get(`/api/volunteering_requests`,{})
      .then(res => {
        this.setState(()=>({volunteers: [...res.data.requests]}));
        this.setState(()=>({loadingVolunteers: false}));
      }, ()=>{
        this.setState(()=>({loadingVolunteers: false}));
      });
    } 
    catch(error) {
      console.error(error);
    }
  }

  requestUnvolunteerClicked = (r) => {
    return new Promise((resolve, reject) => {
      confirmAlert({
        title: 'Please confirm',
        message: 'Are you sure you want to unvolunteer?',
        buttons: [
          {
            label: 'Yes',
            onClick: () => { 
              this.unvolunteerRequest(r.id).then(()=>{
                resolve();
              }, ()=>{
                reject(new Error("Unvolunteer failed"));
              })
            }
          },
          {
            label: 'No',
            onClick: () => { 
              resolve();
            }
          }
        ]
      });
    });
  }

  unvolunteerRequest = async (requestId) => {
    const { crf } = this.state;
    const { history, handleNotification } = this.props;
    this.setState(()=>({loadingVolunteers: true}));
    try {
      await axios.post(`/api/requests/${requestId}/unvolunteer`,{} , { headers: {'X-CSRF-Token': crf } })
        .then(res => {
          this.setState(()=>({loadingVolunteers: false}));
          this.loadVolunteers();
          // unvolunteering could be invoked from request detail page
          history.push('/volunteering');
          handleNotification("Successfully unvolunteer from request");
        }, ()=>{
          this.setState(()=>({loadingVolunteers: false}));
        });
    } 
    catch(error) {
      console.error(error);
    } 
  }


  requestToggleFulfilled = async (requestId) => {
    const { crf, volunteers } = this.state;
    const { handleNotification } = this.props;

    this.setState(()=>({loadingVolunteers: true}));
    let request;
    try {
      const result = await axios.post(`/api/requests/${requestId}/toggle_volunteer_fulfilled`, {}, { headers: {'X-CSRF-Token': crf } })
      request = result.data.request;
      if(request.volunteer_fulfilled){
        handleNotification("Successfully fulfilled request");
      } else {
        handleNotification("Successfully marked request as unfulfilled");
      }
      // updating previously loaded requests list
      const index = volunteers.findIndex((r) => r.id==request.id);
      if (index>-1){
        volunteers[index] = request;
        this.setState(()=>({volunteers: volunteers}));
      }
    } 
    catch(error) {
      console.error(error);
    }
    finally {
      this.setState(()=>({loadingVolunteers: false}));
    }
    return request;
  }

  render() {
    const { volunteers, loadingVolunteers } = this.state;
    const { path, url } = this.props.match;
    
    const volunteersRows = volunteers.map((r)=> 
    <div key={ r.id } className="volunteer-request-row" style={ r.fulfilled ? { backgroundColor: 'lightgreen' } : {}}>
      <div><Moment format="YYYY.MM.DD H:mm">{ r.volunteer_date }</Moment></div>
      <div>{ r.volunteer_fulfilled && <InlineIcon icon={bxUserCheck}/>} { r.fulfilled && <InlineIcon icon={baselineCheck}/> }</div>
      <div><Link to={`${url}/${r.id}`}>{ r.title }</Link></div>
      <div>
        {r.requester_avatar_50 && 
          <img src={r.requester_avatar_50} className="img-circle header-avatar-img"/>
        }
        {r.requester_avatar_50==null && 
          <Icon icon={userCircle} />
        }
      </div>
      <div>{ r.requester_username }</div>
      <div>
        <Link to={`/messages/${r.requester_id}`}>
          <Icon icon={baselineMessage} />
        </Link>
      </div>

      <div></div>
    </div>
    );

    return (
      <section id="volunteering">
        <div className="container pt-5">
          <div className="row">
            <div className="col-md-10 offset-md-1">

            <Switch>
              <Route exact path={path}>
                <div className="requests-header">
                  <h4>My volunteering</h4>
                </div>
                <div className="volunteers-request-grid">
                  { volunteersRows }
                  { !loadingVolunteers && volunteersRows.length==0 ? 'none' : ''}
                  { loadingVolunteers ? 'loading...' : '' }
                </div>
              </Route>

              <Route path={`${path}/:requestId`}>
                <VolunteerRequestDetail  
                  requestToggleFulfilled={this.requestToggleFulfilled}
                  requestUnvolunteerClicked={this.requestUnvolunteerClicked}
                  /> 
              </Route>


            </Switch>


            </div>
          </div>
        </div>
      </section>
    );
  }
}


export default withRouter(Volunteering);