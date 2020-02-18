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
import baselineMessage from '@iconify/icons-ic/baseline-message';
import Tooltip from 'rc-tooltip';


class RequestDetail extends React.Component {
  state = {
    loading: false,
    isAsync: false,
    request: null,
    volunteers: [],
    can_be_republished: false
  };

  componentDidMount() {
    this.loadRequest();
  }

  loadRequest = () => {
    const { requestId } = this.props.match.params;

    this.setState(()=>({loading: true}));
    try {
      axios.get(`/api/requests/${requestId}`)
      .then(res => {
        this.setState(()=>({
          request: res.data.request,
          volunteers: res.data.volunteers,
          can_be_republished: res.data.can_be_republished,
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

  deleteClicked = (request) => {
    this.setState(()=>({isAsync:true}), ()=>{
      this.props.requestDeleteClicked(request).then(()=>{
        this.setState(()=>({isAsync:false}));
      },()=>{
        this.setState(()=>({isAsync:false}));
      });
    });
  }

  toggleFulfilled = (request) => {
    this.setState(()=>({isAsync:true}), ()=>{
      this.props.requestToggleFulfilled(request.id).then((data)=>{ 
        this.setState(()=>({
          isAsync:false,
          request: data.request,
          can_be_republished: data.can_be_republished,
        }));
      },()=>{
        this.setState(()=>({isAsync:false}));
      });
    });
  }

  requestRepublishClicked = (request) => {
    this.setState(()=>({isAsync:true}), ()=>{
      this.props.requestRepublish(request.id).then((data)=>{ 
        this.setState(()=>({
          isAsync:false,
          request: data.request,
          can_be_republished: data.can_be_republished,
        }));
      },()=>{
        this.setState(()=>({isAsync:false}));
      });
    });
  }

  render() {
    const { request, volunteers, loading, isAsync, can_be_republished } = this.state;
    const { requestEditClicked  } = this.props;

    const republishError = can_be_republished===true ? false : can_be_republished[0];

    const volunteerRows = volunteers.map((v)=> 
      <div key={ v.id } className="volunteers-list-row">
        <div><Moment format="YYYY.MM.DD H:mm">{ v.volunteer_date }</Moment></div>
        <div>
          {v.avatar_50 && 
            <img src={v.avatar_50} className="img-circle header-avatar-img"/>
          }
          {v.avatar_50==null && 
            <Icon icon={userCircle} />
          }
        </div>
        <div>{v.username}</div>
        <div>
          <Link to={`/messages/${v.id}`}>
            <Icon icon={baselineMessage} />
          </Link>
        </div>
      </div>
    );

    return (
      <>
        <Link to={'/requests'} className="link-black">&lt;- All requests</Link>
        <div className="request-detail">
          { request && 
            <>
              <div className="request-menu">
                { !request.published && 
                  <>
                  { can_be_republished===true &&
                    <a onClick={() => { this.requestRepublishClicked(request) }}>Republish</a>
                  }
                  { republishError &&
                    <Tooltip overlay={<span>{republishError}</span>}>
                      <span className="disabled-link">
                          Republish
                      </span>
                    </Tooltip>
                  }
                  </>
                }
                <a onClick={() => { this.toggleFulfilled(request) }} className={ request.fulfilled ? 'text-success' : ''}>
                  <InlineIcon icon={ request.fulfilled ? baselineCheck : baselineClose} /> Fulfilled
                </a>
                <a onClick={() => { requestEditClicked(request) }}>Edit</a>
                <a onClick={() => { this.deleteClicked(request) }} className="text-danger">Delete</a>
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
                  <p className="small-label">Fulfilled:</p>
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

              <h5 className="pb-2">Volunteers:</h5>
              <div className="row">
                <div className="col-md-6 offset-md-3">
                  <div className="volunteers-list">
                    { volunteerRows }
                    { volunteerRows.length==0 ? 'none' : ''}
                  </div>
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


export default withRouter(RequestDetail);