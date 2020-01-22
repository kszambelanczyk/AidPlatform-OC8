// Run this example by adding <%= javascript_pack_tag 'hello_react' %> to the head of your layout file,
// like app/views/layouts/application.html.erb. All it does is render <div>Hello React</div> at the bottom
// of the page.
require('dotenv').config()

import React from 'react'
import ReactDOM from 'react-dom'
// import PropTypes from 'prop-types'
import { BrowserRouter as Router } from 'react-router-dom';
import Main from './components/Main'


document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
    <Router basename="/main">
      <Main />
    </Router>,
    document.getElementById('main-app'),
  )
})
