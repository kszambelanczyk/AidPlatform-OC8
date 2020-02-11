import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
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

// import baselineDeleteForever from '@iconify/icons-ic/baseline-delete-forever';
// import baselineEdit from '@iconify/icons-ic/baseline-edit';
// import baselineVisibility from '@iconify/icons-ic/baseline-visibility';
// import baselineVisibilityOff from '@iconify/icons-ic/baseline-visibility-off';
// import baselineCheck from '@iconify/icons-ic/baseline-check';
// // import baselineClose from '@iconify/icons-ic/baseline-close';
// import bxUserCheck from '@iconify/icons-bx/bx-user-check';
// import Tooltip from 'rc-tooltip';


class DetailMessage extends React.Component {
  state = {
    loading: false,
    pushing: false,
    messages: [],
    currentMessage: '',
    messageValid: false,
    currentUserId: preloadedData.current_user_id,
    crf: '',
  };

  componentDidMount() {
    console.log('didmount');

    const crf =  document.getElementsByName("csrf-token")[0].getAttribute("content");
    this.setState(()=>({crf: crf}));

    const { currentUserId } = this.state;
    const pusher = new Pusher('9bee2ff5f008f8eb221f', {
      cluster: 'eu',
      encrypted: true
    });
    this.channel = pusher.subscribe(`chat_user_${currentUserId}`);
    this.channel.bind('new_message', data => {
      this.processNewMessage(data.sender_id);
    });

    this.preloadMessages();
  }

  componentDidUpdate(prevProps) {
    const { recipientId } = this.props.match.params;
    if (recipientId !== prevProps.match.params.recipientId) {
      this.preloadMessages();
    }
  }

  preloadMessages = () => {
    const { messagesReaded } = this.props;
    const { recipientId } = this.props.match.params;
    this.loadMessages().then((messages)=>{
      this.setState(()=>({messages: [...messages]}));
      messagesReaded(recipientId);
    });
  }

  processNewMessage = (messageSenderId) => {
    const { recipientId } = this.props.match.params;
    const { newUnreadMessage } = this.props;
    const { messages } = this.state;

    // if in conversation with that sender load ne message
    if(recipientId==messageSenderId){
      const lastId = messages.length>0 ? messages[messages.length-1].id : null;
      this.loadMessages(lastId).then((newMessages)=>{
        this.setState(()=>({ messages: [...messages, ...newMessages] }));
      });
    } else {
      // send information of unread message
      newUnreadMessage(messageSenderId);
    }
  }

  loadMessages = async (lastMessageId=null) => {
    const { recipientId } = this.props.match.params;
    this.setState(()=>({loading: true}));
    let messages;
    try {
      messages = await axios.get(`/api/messages/user/${recipientId}`, { params: { last_message_id: lastMessageId} })
      .then(res => {
        this.setState(()=>({loading: false}));
        return res.data.messages
      }, ()=>{
        this.setState(()=>({loading: false}));
        return [];
      });
    } 
    catch(error) {
      console.error(error);
    }
    return messages;
  }

  handleMessageChange = (event) => {
    const message = event.target.value;
    this.setState({currentMessage: message});
    if(message.length>0){
      this.setState({messageValid: true});
    } else {
      this.setState({messageValid: false});
    }
  }

  sendButtonClicked = () => {
    const { currentMessage, messageValid } = this.state;
    if(!messageValid){
      return;
    }
    this.pushMessage();
  }

  pushMessage = async () => {
    const { crf, currentMessage, messages } = this.state;
    const { recipientId } = this.props.match.params;
    const lastId = messages.length>0 ? messages[messages.length-1].id : null;
    this.setState(()=>({pushing: true}));
    let data;
    try {
      const result = await axios.post(`/api/messages`, {
        message: currentMessage,
        recipient_id: recipientId,
        last_message_id: lastId
      }, { headers: {'X-CSRF-Token': crf } })
      this.setState(()=>({
        messages: [...messages, ...result.data.messages],
        currentMessage: ''
      }))
    } 
    catch(error) {
      console.error(error);
    }
    finally {
      this.setState(()=>({pushing: false}));
    }
    return data;
  }


  render() {
    const { messages, loading, pushing, currentMessage, messageValid, currentUserId } = this.state;
    const { path, url } = this.props.match;

    const messagesRows = messages.map((r)=> 
      <div key={ r.id } className="message-row">
        { r.sender_id==currentUserId && 
          <div className="sender-place">
            <div>
              {r.message}
            </div>
          </div>      
        }
        { r.sender_id!=currentUserId && 
          <div className="recipient-place">
            <div>
              <div>
                {r.requester_avatar_50 && 
                  <img src={r.requester_avatar_50} className="img-circle header-avatar-img"/>
                }
                {r.requester_avatar_50==null && 
                  <Icon icon={userCircle} />
                }
              </div>
              <div>
                {r.message}
              </div>
            </div>
          </div>      
        }

      </div>
    );

    return (
      <section id="requests">
        <div className="container">

              <div className="recipient-list">
                {messagesRows}
              </div>

              <div className="input-place pt-3">
                <textarea value={currentMessage} onChange={this.handleMessageChange} disabled={pushing} />
                <button onClick={this.sendButtonClicked} type="button" disabled={!messageValid || pushing}>Sent</button>
              </div>


        </div>
      </section>
    );
  }
}

export default withRouter(DetailMessage);