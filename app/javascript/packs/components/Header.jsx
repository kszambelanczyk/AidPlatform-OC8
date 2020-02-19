import React from 'react';
// import axios from 'axios';
import { Icon, InlineIcon } from '@iconify/react';
import userCircle from '@iconify/icons-fa-solid/user-circle';

import {
  Link
} from "react-router-dom";

class Header extends React.Component {
  // state = {
  //   crf: null
  // }

  // componentDidMount() {
  //   const crf =  document.getElementsByName("csrf-token")[0].getAttribute("content");
  //   this.setState(()=>({crf: crf}));
  // }

  // logOut = () => {
  //   const { crf } = this.state;
  //   axios.delete(`/users/sign_out`,{headers: {'X-CSRF-Token': crf}}).then(res => {
  //     debugger;
  //   });
  // }


  render() {
    const { avatarUrl } = this.props; 
    let userIcon;
    if(avatarUrl){
      userIcon = (
        <img src={avatarUrl} className="img-circle header-avatar-img"/>
      )
    } else {
      userIcon = (
        <Icon icon={userCircle} />
      )
    }
  
    return (
      <section id="header">
        <div className="header">      
          <nav className="navbar navbar-expand-md">
            <div className="container">
              <a className="navbar-brand" href="/">
                Thank.You
              </a>
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#Navbar">
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="Navbar">
                <ul className="navbar-nav ml-auto ">
                  <li className="nav-item"><Link to="/" className="nav-link">Map</Link></li>
                  {/* <li className="nav-item"><Link to="/requests" className="nav-link">Requests</Link></li> */}
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      Requests
                    </a>
                    <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                      <Link to="/requests" className="dropdown-item">Requests</Link>
                      <Link to="/new_request" className="dropdown-item">New request</Link>
                      <div className="dropdown-divider"></div>
                      <Link to="/volunteering" className="dropdown-item">Volunteering</Link>
                    </div>
                  </li>
                  <li className="nav-item"><Link to="/messages" className="nav-link">Messages</Link></li>

                  <li className="nav-item dropdown">
                    <a  className="nav-link" href="#" id="navbarDropdown2" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                      {userIcon}
                    </a>

                    <div className="dropdown-menu" aria-labelledby="navbarDropdown2">
                      <Link to="/account" className="dropdown-item">Account</Link>
                      <a className="dropdown-item" rel="nofollow" data-method="delete" href="/users/sign_out">
                        Log out
                      </a>
                    </div>

                  </li>

                </ul>
              </div>
            </div>
          </nav>
        </div>
      </section>
    );
  }
}


export default Header;