import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';


class Requests extends React.Component {
  state = {
    showFulfilled: false,
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
  }

  loadRequests = () => {
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
    try {
      axios.get(`/api/volunteers`,{})
      .then(res => {
        this.setState(()=>({volunteers: [...res.data.volunteers]}));
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
    this.deleteRequest(r.id);
  }

  deleteRequest = async (requestId) => {
    const { crf } = this.state;
    this.setState(()=>({loadingRequests: true}));
    try {
      await axios.delete(`/api/requests/${requestId}`, { headers: {'X-CSRF-Token': crf } })
        .then(res => {
          this.setState(()=>({loadingRequests: false}));
          this.loadRequests();
        }, ()=>{
          this.setState(()=>({loadingRequests: false}));
        });
    } 
    catch(error) {
      console.error(error);
    } 
  }

  render() {
    const { requests, loadingRequests } = this.state;

    const reqestRows = requests.map((r)=> 
      <div key={ r.id } className="request-row">
        <div>{ r.id }</div>
        <div><a onClick={() => {this.requestEditClicked(r)}}>{ r.title }</a></div>
        <div><a onClick={() => {this.requestDeleteClicked(r)}}>delete</a></div>
      </div>
    );
  
    // const { location } = this.props;
    return (
      <>
        <section id="requests">
          <div className="container">
            <p>My requests</p>
            <div className="requests-grid">
              { reqestRows }
              { loadingRequests ? 'loading' : '' }
            </div>
            <p>My volunteering</p>


          </div>
        </section>
      </>
    );
  }
}


export default withRouter(Requests);