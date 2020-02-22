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
import userCircle from '@iconify/icons-fa-solid/user-circle';
import DetailMessage from './DetailMessage';


class Messages extends React.Component {
  state = {
    loadingRecipients: false,
    recipients: [],
    crf: '',
    currentUserId: preloadedData.current_user_id,
  };

  componentDidMount() {
    const crf =  document.getElementsByName("csrf-token")[0].getAttribute("content");
    this.setState(()=>({crf: crf}));

    this.loadRecipients();

  }

  componentDidUpdate(){
    // if exact path -> redirect to most recent conversation
    const { isExact } = this.props.match;
    const { history } = this.props;
    const { recipients } = this.state;
    if(isExact && recipients.length>0){
      history.push(`/messages/${recipients[0].id}`);
    }
  }

  loadRecipients = async () => {
    this.setState(()=>({loadingRecipients: true}));
    await axios.get(`/api/messages/get_recipients`)
      .then(res => {
        this.setState(()=>({recipients: [...res.data.recipients]}));
        this.setState(()=>({loadingRecipients: false}));
      }, (er)=>{
        console.error(error);
        this.setState(()=>({loadingRecipients: false}));
      });
    return
  }

  newUnreadMessage = (senderId) => {
    const { recipients } = this.state;
    recipients.forEach((r)=>{
      if(r.id==senderId){
        r.unreaded_messages = true;
      }
    });
    this.setState(()=>({ recipients: recipients}));
  }

  messagesReaded = (recipientId) => {
    const { recipients } = this.state;
    recipients.forEach((r)=>{
      if(r.id==recipientId){
        r.unreaded_messages = false;
      }
    });
    this.setState(()=>({ recipients: recipients}));
  }

  render() {
    const { recipients, loadingRecipients } = this.state;
    
    const { path, url } = this.props.match;

    const recipientsRows = recipients.map((r)=> 
      <div key={ r.id } className="recipient-row">
        <Link to={`/messages/${r.id}`} className={r.unreaded_messages ? 'unreaded' : ''}>
          {r.avatar_50 && 
            <img src={r.avatar_50} className="img-circle header-avatar-img"/>
          }
          {r.avatar_50==null && 
            <Icon icon={userCircle} />
          }
          {r.username}
        </Link>
      </div>
    );

    return (
      <section id="messages">
        <div className="container-md pt-5">
          <div className="row">
            <div className="col-md-2 offset-md-1 col-2 left-column">
              <div className="recipient-list">
                {recipientsRows}
              </div>

            </div>
            <div className="col-md-8 col-10">
              { recipients.length>0 && 
                <Switch>
                  <Route path={`${path}/:recipientId`}>
                    <DetailMessage newUnreadMessage={this.newUnreadMessage} 
                                  messagesReaded={this.messagesReaded} recipients={recipients}/>
                  </Route>
                </Switch>
              }

            </div>
          </div>
        </div>
      </section>
    );
  }
}

export default withRouter(Messages);