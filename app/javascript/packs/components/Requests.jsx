import React from 'react';
import axios from 'axios';
import { withRouter } from 'react-router';


class Requests extends React.Component {
  state = {
    showFulfilled: false,
    loading: false,
    requests: [],
    volunteers: []
  };

  componentDidMount() {
    this.loadRequests();
  }

  loadRequests = () => {
    try {
      axios.get(`/api/requests`)
      .then(res => {
        this.setState(()=>({requests: [...res.data.requests]}));
      });
    } 
    catch(error) {
      console.error(error);
    }
  }

  loadVolunteers = () => {
    try {
      axios.get(`/api/volunteers`,{

      })
      .then(res => {
        this.setState(()=>({volunteers: [...res.data.volunteers]}));
      });
    } 
    catch(error) {
      console.error(error);
    }
  }

  requestClicked = (r) => {
    const { history } = this.props;
    history.push(`/edit_request/${r.id}`);
  }

  render() {
    const { requests } = this.state;
    const reqestRows = requests.map((r)=> 
      <div key={r.id} className="request-row">
        <div>{r.id}</div>
        <div><a onClick={() => {this.requestClicked(r)}}>{r.title}</a></div>
      </div>
    );
  
    const { location } = this.props;
    return (
      <>
        <section id="requests">
          <div className="container">
            <p>My requests</p>
            <div className="requests-grid">
              {reqestRows}
            </div>
            <p>My volunteering</p>


          </div>
        </section>
      </>
    );
  }
}


export default withRouter(Requests);