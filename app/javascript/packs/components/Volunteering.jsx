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

  render() {
    const { volunteers, loadingVolunteers } = this.state;
    
    // let { path, url } = this.props.match;

    
    const volunteersRows = volunteers.map((r)=> 
    <div key={ r.id } className="volunteer-row">
      <div><Moment format="YYYY.MM.DD H:mm">{ r.volunteer_date }</Moment></div>
      <div>
        {r.requester_avatar_50 && 
          <img src={r.requester_avatar_50} className="img-circle header-avatar-img"/>
        }
        {r.requester_avatar_50==null && 
          <Icon icon={userCircle} />
        }
      </div>
      <div>mark as fulfilled</div>
      <div>{ r.title }</div>
      <div>{ r.requester_username }</div>
      <div>message</div>

      <div></div>
    </div>
    );

    return (
      <section id="requests">
        <div className="container pt-5">
          <div className="row">
            <div className="col-md-10 offset-md-1">

            <div className="requests-header">
              <h4>My volunteering</h4>
            
            
            </div>

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


export default withRouter(Volunteering);