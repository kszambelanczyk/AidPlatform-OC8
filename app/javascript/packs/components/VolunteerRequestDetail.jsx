import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Icon, InlineIcon } from '@iconify/react';
import userCircle from '@iconify/icons-fa-solid/user-circle';
import Moment from 'react-moment';
import baselineCheck from '@iconify/icons-ic/baseline-check';
import baselineClose from '@iconify/icons-ic/baseline-close';
import baselineVisibility from '@iconify/icons-ic/baseline-visibility';
import baselineVisibilityOff from '@iconify/icons-ic/baseline-visibility-off';


class VolunteerRequestDetail extends React.Component {
  state = {
    loading: false,
    isAsync: false,
    request: null,
  };

  componentDidMount() {
    // const crf =  document.getElementsByName("csrf-token")[0].getAttribute("content");
    // this.setState(()=>({crf: crf}));

    this.loadRequest();
  }

  loadRequest = () => {
    const { requestId } = this.props.match.params;

    this.setState(()=>({loading: true}));
    try {
      axios.get(`/api/requests/${requestId}/volunteering_request`)
      .then(res => {
        this.setState(()=>({
          request: res.data.request,
          loading: false
        }));
      }, ()=>{
        this.setState(()=>({loading: false}));
      });
    } 
    catch(error) {
      console.error(error);
    }
  }


  toggleFulfilled = (request) => {
    this.setState(()=>({isAsync:true}), ()=>{
      this.props.requestToggleFulfilled(request.id).then((request)=>{ 
        this.setState(()=>({
          isAsync:false,
          request: request
        }));
      },()=>{
        this.setState(()=>({isAsync:false}));
      });
    });
  }

  unvolunteerClicked = (request) => {
    this.setState(()=>({isAsync:true}), ()=>{
      this.props.requestUnvolunteerClicked(request).then(()=>{
        this.setState(()=>({isAsync:false}));
      },()=>{
        this.setState(()=>({isAsync:false}));
      });
    });
  }


  render() {
    const { request, loading, isAsync } = this.state;

    return (
      <>
        <p><Link to={'/volunteering'}>&lt;- all volunteering</Link></p>
        <div className="request-detail">
          { request && 
            <>
              <div className="request-menu">
                <a onClick={() => { this.toggleFulfilled(request) }} className={ request.volunteer_fulfilled ? 'text-success' : ''}>
                  <InlineIcon icon={ request.volunteer_fulfilled ? baselineCheck : baselineClose} /> Fulfilled
                </a>
                <a onClick={() => { this.unvolunteerClicked(request) }} className="text-danger">Unvolunteer</a>
              </div>

              <div className="row">
                <div className="col-md-8">
                  <p className="small-label">Request type:</p>
                  <p>{ request.request_type=='one_time_task' ? 'One time task' : 'Material need' }</p>

                  <p className="small-label">Request title:</p>
                  <p>{ request.title }</p>
  
                  <p className="small-label">Request description:</p>
                  <p>{ request.description }</p>
                </div>
                <div className="col-md-4">
                  <p className="small-label">Fulfilled by you:</p>
                  <p style={{fontSize: '1.1rem'}}>
                    { !request.volunteer_fulfilled && 
                      <InlineIcon icon={baselineClose} />
                    }
                    { request.volunteer_fulfilled && 
                      <span className="text-success"><InlineIcon icon={baselineCheck} /></span>
                    }
                  </p>

                  <p className="small-label">Fulfilled by requester:</p>
                  <p style={{fontSize: '1.1rem'}}>
                    { !request.fulfilled && 
                      <InlineIcon icon={baselineClose} />
                    }
                    { request.fulfilled && 
                      <span className="text-success"><InlineIcon icon={baselineCheck} /></span>
                    }
                  </p>

                  <p className="small-label">Published:</p>
                  <p style={{fontSize: '1.1rem'}}>
                    { !request.published && 
                      <InlineIcon icon={baselineVisibilityOff} />
                    }
                    { request.published && 
                      <span className="text-success"><InlineIcon icon={baselineVisibility} /></span>
                    }
                  </p>

                  <p className="small-label">Created at:</p>
                  <p><Moment format="YYYY.MM.DD H:mm">{ request.created_at }</Moment></p>

                </div>
              </div>

            </>
          }

          { loading && 
            <p>Loading...</p>
          }
          <div className={ isAsync ? 'async' : '' }></div>
        </div>
      </>
    );
  }
}


export default withRouter(VolunteerRequestDetail);