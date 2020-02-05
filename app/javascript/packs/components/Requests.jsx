import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import SimpleBar from 'simplebar-react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import Moment from 'react-moment'
import { Icon, InlineIcon } from '@iconify/react';
import baselineDeleteForever from '@iconify/icons-ic/baseline-delete-forever';
import baselineEdit from '@iconify/icons-ic/baseline-edit';
import baselineVisibility from '@iconify/icons-ic/baseline-visibility';
import baselineCheck from '@iconify/icons-ic/baseline-check';
import baselineClose from '@iconify/icons-ic/baseline-close';

import RequestDetail from './RequestDetail';

class Requests extends React.Component {
  state = {
    // showFulfilled: false,
    loadingRequests: false,
    loadingVolunteers: false,
    requests: [],
    volunteers: [],
    crf: '',
  };

  componentDidMount() {
    const crf =  document.getElementsByName("csrf-token")[0].getAttribute("content");
    this.setState(()=>({crf: crf}));

    this.loadRequests();
    this.loadVolunteers();
  }

  loadRequests = () => {
    // const { showFulfilled } = this.state;
    this.setState(()=>({loadingRequests: true}));
    try {
      axios.get(`/api/requests`)
      .then(res => {
        this.setState(()=>({requests: [...res.data.requests]}));
        this.setState(()=>({loadingRequests: false}));
      }, ()=>{
        this.setState(()=>({loadingRequests: false}));
      });
    } 
    catch(error) {
      console.error(error);
    }
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

  requestEditClicked = (r) => {
    const { history } = this.props;
    history.push(`/edit_request/${r.id}`);
  }

  requestDeleteClicked = (r) => {
    confirmAlert({
      title: 'Please confirm deletion',
      message: 'Are you sure to do this.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => { this.deleteRequest(r.id) }
        },
        {
          label: 'No',
        }
      ]
    });
  }

  deleteRequest = async (requestId) => {
    const { crf } = this.state;
    const { history } = this.props;
    this.setState(()=>({loadingRequests: true}));
    try {
      await axios.delete(`/api/requests/${requestId}`, { headers: {'X-CSRF-Token': crf } })
        .then(res => {
          this.setState(()=>({loadingRequests: false}));
          this.loadRequests();
          // deletion could be invoked from request detail page
          history.push('/requests');
        }, ()=>{
          this.setState(()=>({loadingRequests: false}));
        });
    } 
    catch(error) {
      console.error(error);
    } 
  }

  // toggleShowFulfilled = () => {
  //   const { showFulfilled } = this.state;
  //   this.setState(()=>({showFulfilled: !showFulfilled}), () => {
  //     this.loadRequests();
  //   });
  // }

  requestToggleFulfilledClicked = () => {
    // const { crf } = this.state;
    // const { history } = this.props;
    // this.setState(()=>({loadingRequests: true}));
    // try {
    //   await axios.delete(`/api/requests/${requestId}`, { headers: {'X-CSRF-Token': crf } })
    //     .then(res => {
    //       this.setState(()=>({loadingRequests: false}));
    //       this.loadRequests();
    //       // deletion could be invoked from request detail page
    //       history.push('/requests');
    //     }, ()=>{
    //       this.setState(()=>({loadingRequests: false}));
    //     });
    // } 
    // catch(error) {
    //   console.error(error);
    // } 
  }

  render() {
    const { requests, loadingRequests, volunteers, loadingVolunteers } = this.state;
    
    let { path, url } = this.props.match;

    const reqestRows = requests.map((r)=> 
      <div key={ r.id } className="request-row">
        <div><Moment format="YYYY.MM.DD H:mm">{ r.created_at }</Moment></div>
        <div><Link to={`${url}/${r.id}`}>{ r.title }</Link></div>
        <div>Volunteered: { r.volunteer_count } </div>
        <div>
          <InlineIcon icon={baselineVisibility} className="text-success"/>
          <a onClick={() => {this.requestEditClicked(r)}}><InlineIcon icon={baselineEdit} /></a>
          <a onClick={() => {this.requestDeleteClicked(r)}} className="text-danger"><InlineIcon icon={baselineDeleteForever} /></a>
        </div>
      </div>
    );

    
    const volunteersRows = volunteers.map((r)=> 
    <div key={ r.id } className="volunteer-row">
      <div>{ r.title }</div>
      <div><a onClick={() => {this.volunteerDetailClicked(r)}}>details</a></div>
    </div>
    );

    return (
      <section id="requests">
        <div className="container pt-5">
          <div className="row">
            <div className="col-md-10 offset-md-1">

            <Switch>

              <Route exact path={path}>
                <div className="requests-header">
                  <h4>My requests</h4>
                  {/* { showFulfilled && 
                    <button type="button" className="btn btn-sm btn-success" onClick={this.toggleShowFulfilled}> 
                      <InlineIcon icon={baselineCheck} /> Fulfilled
                    </button>
                  }
                  { !showFulfilled && 
                    <button type="button" className="btn btn-sm btn-secondary" onClick={this.toggleShowFulfilled}>
                      <InlineIcon icon={baselineClose} /> Fulfilled
                    </button>
                  } */}
                </div>
                <SimpleBar style={{ maxHeight: 400, minHeight: 400 }} className="requests-list-wrapper">
                  <div className="requests-grid">
                    { reqestRows }
                    { loadingRequests ? 'loading' : '' }
                  </div>
                </SimpleBar>
              </Route>

              <Route path={`${path}/:requestId`}>
                <RequestDetail requestEditClicked={this.requestEditClicked} 
                  requestDeleteClicked={this.requestDeleteClicked}
                  requestToggleFulfilledClicked={this.requestToggleFulfilledClicked}
                  /> 
              </Route>

            </Switch>

            <p>My volunteering</p>

            <div className="volunteers-grid">
              { volunteersRows }
              { loadingVolunteers ? 'loading' : '' }
            </div>



            </div>
          </div>
        </div>
      </section>
    );
  }
}


export default withRouter(Requests);