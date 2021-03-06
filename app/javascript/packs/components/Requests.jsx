import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { confirmAlert } from 'react-confirm-alert';
// import 'react-confirm-alert/src/react-confirm-alert.css';
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
import baselineVisibilityOff from '@iconify/icons-ic/baseline-visibility-off';
import baselineCheck from '@iconify/icons-ic/baseline-check';
import bxUserCheck from '@iconify/icons-bx/bx-user-check';
import Tooltip from 'rc-tooltip';
import Pusher from 'pusher-js';

import RequestDetail from './RequestDetail';

class Requests extends React.Component {
  state = {
    // showFulfilled: false,
    loadingRequests: false,
    requests: [],
    crf: '',
    currentUserId: preloadedData.current_user_id,

  };

  componentDidMount() {

    const crf =  document.getElementsByName("csrf-token")[0].getAttribute("content");
    this.setState(()=>({crf: crf}));

    this.loadRequests();
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

  requestEditClicked = (r) => {
    const { history } = this.props;
    history.push(`/edit_request/${r.id}`);
  }

  requestDeleteClicked = (r) => {
    return new Promise((resolve, reject) => {
      confirmAlert({
        title: 'Please confirm deletion',
        message: 'Are you sure to do this?',
        buttons: [
          {
            label: 'Yes',
            onClick: () => { 
              this.deleteRequest(r.id).then(()=>{
                resolve();
              }, ()=>{
                reject(new Error("Deletion failed"));
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

  deleteRequest = async (requestId) => {
    const { crf } = this.state;
    const { history, handleNotification } = this.props;
    this.setState(()=>({loadingRequests: true}));
    try {
      await axios.delete(`/api/requests/${requestId}`, { headers: {'X-CSRF-Token': crf } })
        .then(res => {
          this.setState(()=>({loadingRequests: false}));
          this.loadRequests();
          // deletion could be invoked from request detail page
          history.push('/requests');
          handleNotification("Successfully deleted the request");
        }, ()=>{
          this.setState(()=>({loadingRequests: false}));
        });
    } 
    catch(error) {
      console.error(error);
    } 
  }

  requestToggleFulfilled = async (requestId) => {
    const { crf, requests } = this.state;
    const { handleNotification } = this.props;
    this.setState(()=>({loadingRequests: true}));
    let data;
    try {
      const result = await axios.post(`/api/requests/${requestId}/toggle_fulfilled`, {}, { headers: {'X-CSRF-Token': crf } })
      data = result.data;
      if(data.request.fulfilled){
        handleNotification("Successfully fulfilled the request");
      } else {
        handleNotification("Successfully marked the request as unfulfilled");
      }
      // updating previously loaded requests list
      const index = requests.findIndex((r) => r.id==data.request.id);
      if (index>-1){
        requests[index] = data.request;
        this.setState(()=>({requests: requests}));
      }
    } 
    catch(error) {
      console.error(error);
    }
    finally {
      this.setState(()=>({loadingRequests: false}));
    }
    return data;
  }

  requestRepublish = async (requestId) => {
    const { crf, requests } = this.state;
    const { handleNotification } = this.props;

    this.setState(()=>({loadingRequests: true}));
    let data;
    try {
      const result = await axios.post(`/api/requests/${requestId}/republish`, {}, { headers: {'X-CSRF-Token': crf } })
      data = result.data;
      if(data.request.published){
        handleNotification("Successfully published the request");
      }

      // updating previously loaded requests list
      const index = requests.findIndex((r) => r.id==data.request.id);
      if (index>-1){
        requests[index] = data.request;
        this.setState(()=>({requests: requests}));
      }
    } 
    catch(error) {
      console.error(error);
    }
    finally {
      this.setState(()=>({loadingRequests: false}));
    }
    return data;
  }


  render() {
    const { requests, loadingRequests } = this.state;
    
    const { path, url } = this.props.match;

    const reqestRows = requests.map((r)=> 
      <div key={ r.id } className="request-row" style={ r.fulfilled ? { backgroundColor: 'lightgreen' } : {}}>
        <div className="date"><Moment format="YYYY.MM.DD H:mm">{ r.created_at }</Moment></div>
        <div>{ r.volunteer_fulfilled && <InlineIcon icon={bxUserCheck}/>} { r.fulfilled && <InlineIcon icon={baselineCheck}/> }</div>
        <div><Link to={`${url}/${r.id}`}>{ r.title }</Link></div>
        <div>Volunteered: { r.volunteer_count } </div>
        <div>
          <Tooltip overlay={r.published ? <span>Published</span> : <span>Unpublished</span>}>
            <span><InlineIcon icon={ r.published ? baselineVisibility : baselineVisibilityOff } className={ r.published ? 'text-success' : '' }/></span>
          </Tooltip>
          <a onClick={() => {this.requestEditClicked(r)}}><InlineIcon icon={baselineEdit} /></a>
          <a onClick={() => {this.requestDeleteClicked(r)}} className="text-danger"><InlineIcon icon={baselineDeleteForever} /></a>
        </div>
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
                </div>
                <div className="requests-grid">
                  { reqestRows }
                  { !loadingRequests && reqestRows.length==0 ? 'none' : ''}

                  { loadingRequests ? 'loading...' : '' }
                </div>
              </Route>

              <Route path={`${path}/:requestId`}>
                <RequestDetail requestEditClicked={this.requestEditClicked} 
                  requestDeleteClicked={this.requestDeleteClicked}
                  requestToggleFulfilled={this.requestToggleFulfilled}
                  requestRepublish={this.requestRepublish}
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


export default withRouter(Requests);