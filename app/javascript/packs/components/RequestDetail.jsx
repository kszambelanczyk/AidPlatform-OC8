import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { Icon, InlineIcon } from '@iconify/react';
import userCircle from '@iconify/icons-fa-solid/user-circle';
import Moment from 'react-moment';
import baselineCheck from '@iconify/icons-ic/baseline-check';
import baselineClose from '@iconify/icons-ic/baseline-close';



class RequestDetail extends React.Component {
  state = {
    loading: false,
    request: null,
    volunteers: []
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
      axios.get(`/api/requests/${requestId}`)
      .then(res => {
        this.setState(()=>({
          request: res.data.request,
          volunteers: res.data.volunteers,
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


  render() {
    const { request, volunteers, loading } = this.state;
    const { requestEditClicked, requestDeleteClicked } = this.props;

    const volunteerRows = volunteers.map((v)=> 
      <div key={ v.id } className="volunteers-list-row">
        <div>
          {v.avatar_50 && 
            <img src={v.avatar_50} className="img-circle header-avatar-img"/>
          }
          {v.avatar_50==null && 
            <Icon icon={userCircle} />
          }
        </div>
        <div>{v.username}</div>
        <div><Moment format="YYYY.MM.DD H:mm">{ v.volunteer_date }</Moment></div>
        <div><Link to={`/messages/${v.id}`}>messages</Link></div>

        {/* <div><Link to={`${url}/${r.id}`}>{ r.title }</Link></div> */}
        {/* <div>Volunteered: { r.volunteer_count } </div> */}
        {/* <div><Moment format="YYYY.MM.DD H:mm">{ r.created_at }</Moment></div> */}
        {/* <div>
          <a onClick={() => {this.requestEditClicked(r)}}><InlineIcon icon={baselineEdit} /></a>
          <a onClick={() => {this.requestDeleteClicked(r)}} className="text-danger"><InlineIcon icon={baselineDeleteForever} /></a>
        </div> */}
      </div>
    );

    return (
      <>
        <p><Link to={'/requests'}>&lt;- all requests</Link></p>
        <div className="request-detail">
          { request && 
            <>
              <div className="request-menu">
                <a href="d"><InlineIcon icon={baselineClose} /> Mark as fulfilled</a>
                <a onClick={() => { requestEditClicked(request) }}>Edit</a>
                <a onClick={() => { requestDeleteClicked(request) }} className="text-danger">Delete</a>
              </div>

              <p className="small-label">Request title</p>
              <p>{ request.title }</p>
              <p className="small-label">Request description</p>
              <p>{ request.description }</p>
              <h5 className="pb-2">Volunteers:</h5>
              <div className="row">
                <div className="col-md-10 offset-md-1">
                  <div className="volunteers-list">
                    { volunteerRows }
                  </div>
                </div>
              </div>
            </>
          }

          { loading && 
            <p>Loading...</p>
          }
        </div>
      </>
    );
  }
}


export default withRouter(RequestDetail);