import React from 'react';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import FormikAddress from './FormikAddress';
import { withRouter } from 'react-router';


const RequestSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  description: Yup.string()
    .min(2, 'Too Short!')
    .max(300, 'Too Long!')
    .required('Required'),
  address: Yup.string()
    .min(2, 'Too Short!')
    .max(300, 'Too Long!')
    .required('Required'),
  request_type: Yup.string().oneOf(['one_time_task', 'material_need'])
});

class RequestForm extends React.Component {
  state = {
    crf: '',
    isSubmitting: false,
  };

  componentDidMount() {
    const crf =  document.getElementsByName("csrf-token")[0].getAttribute("content");
    this.setState(()=>({crf: crf}));
  }

  componentDidUpdate(prevProps) {
    const { geolocated_lat, geolocated_lng, request } = this.props;
    // if geolocation has been performed and there is a new request
    if (geolocated_lat !== prevProps.geolocated_lat && !request.id) {
      // update request object
      const { request } = this.props;
      request.lat = geolocated_lat;
      request.lng = geolocated_lng;
    }
  }


  onSubmit = (values, actions) => {
    // const isNew = values.id ? false : true;
    let url, method, message;
    if(values.id){
      url = `/api/requests/${values.id}`;
      method = 'put';
      message = "Request successfully updated";
    } else {
      url = `/api/requests`;
      method = 'post';
      message = "Request successfully created";
    }
    const { crf } = this.state;
    const { history, handleNotification } = this.props;
    this.setState(() => ({isSubmitting: true, successfullySubmitted: false}), ()=>{
      try {
        let params = { ...values };
        axios({
          url: url,
          method: method,
          data: {
            request: params
          },
          headers: {'X-CSRF-Token': crf}
        })
        .then(res => {
          this.setState(()=>({isSubmitting: false, successfullySubmitted: true}));
          actions.setSubmitting(false);
          history.push('/requests');
          handleNotification(message);
        });
      } 
      catch(error) {
        console.error(error);
      }
    });
  }

  render() {
    console.log('rerender');

    const { isSubmitting } = this.state;
    const { request, geolocationFinished } = this.props;

    return (
      <>
        <div>
          <Formik
            enableReinitialize={true}
            initialValues={ request }
            validationSchema={ RequestSchema }
            onSubmit={(values, { setSubmitting, resetForm }) => {
              this.onSubmit(values, { setSubmitting, resetForm })
            }} >
            <Form>
              <div className="form-group">
                <label htmlFor="title">Title (50 characters max)</label>
                <Field name="title" type="text" className="form-control" />
                <ErrorMessage name="title" component="div" className="text-danger"/>
              </div>
              <div className="form-group">
                <label htmlFor="description">Description (300 characters max)</label>
                <Field name="description" component="textarea" className="form-control" />
                <ErrorMessage name="description" component="div" className="text-danger"/>
              </div>

              <div className="form-group">
                <label htmlFor="description">Request type</label>
                <Field name="request_type" component="select" className="custom-select">
                  <option value="one_time_task">One time task</option>
                  <option value="material_need">Material need</option>
                </Field>
                <ErrorMessage name="description" component="div" className="text-danger"/>
              </div>

              <FormikAddress geolocationFinished={geolocationFinished} />

              <div className="text-center">
                <button type="submit" className="submit-button" disabled={isSubmitting} >{ isSubmitting ? 'Submitting...' : 'Submit' }</button>
              </div>
            </Form>
          </Formik>
        </div>
      </>
    );
  }
}


export default withRouter(RequestForm);