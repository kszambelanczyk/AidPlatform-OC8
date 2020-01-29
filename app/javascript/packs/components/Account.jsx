import React from 'react';
import { useFormikContext, Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

import { withRouter } from 'react-router';


const PasswordSchema = Yup.object().shape({
  current_password: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  password: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required'),
  password_confirmation: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .required('Required')
    .test('passwords-match', 'Passwords do not match', function(value) {
      const { password } = this.parent;
      return password === value;
    })
});

const AvatarSchema = Yup.object().shape({
  // filename: Yup.string().required('Required'),
  remove_avatar: Yup.boolean(),
  filename: Yup.string()
    .when('remove_avatar', {
      is: true, 
      then: Yup.string(),
      otherwise: Yup.string().required(),
    })
});


const AutoSave = ({ avatarUrl }) => {
  const formik = useFormikContext();

  React.useEffect(() => {
    if((formik.values.filename && formik.values.filename.length>0) || formik.values.remove_avatar){
      formik.submitForm();
    }
  }, [formik.values]);


  const removeAvatarCallback = React.useCallback(
    () => {
      formik.setFieldValue('filename','');
      formik.setFieldValue('remove_avatar',true);
    },
    [formik.values],
  );

  const button = (
    <button type="button" onClick={ ()=>{ removeAvatarCallback() } }>Remove avatar image</button>
  );

  return (
    <>     
      {
        avatarUrl ? button : ''
      }
    </>
  );
};


class Account extends React.Component {

  state = {
    loading: false,
    isSubmitting: false,
    isFileSubmitting: false,
    errors: {}
  };

  componentDidMount() {
    const crf =  document.getElementsByName("csrf-token")[0].getAttribute("content");
    this.setState(()=>({crf: crf}));
  }

  onSubmit = (values, actions) => {
    const { crf } = this.state;
    const { handleNotification } = this.props;
    this.setState(() => ({ isSubmitting: true, successfullySubmitted: false }),()=>{
      const user = { ...values };
      axios.patch('/api/user/update_password', { user: user }, {
        headers: {'X-CSRF-Token': crf}
      }
      )
      .then(res => {
        this.setState(()=>({
          isSubmitting: false, 
          successfullySubmitted: true,
          errors: {}
        }));
        actions.setSubmitting(false);
        handleNotification('Password succefully updated');
      }, (error)=>{
        actions.setSubmitting(false);
        handleNotification('Password change failed');
        this.setState(()=>({isSubmitting: false}));
        console.error(error);
        if(error.response.data.errors){
          this.setState(()=>({errors: error.response.data.errors}));
        }
      });
    });
  }

  onFileSubmit = (values, actions) => {
    const { crf } = this.state;
    const { handleNotification, avatarChanged } = this.props;

    this.setState(() => ({ isFileSubmitting: true }),()=>{
      const url = '/api/user/avatar';
      const formData = new FormData();
      const imagefile = document.querySelector('#file-input');
      formData.append("file", imagefile.files[0]);
      formData.append("remove_avatar", values.remove_avatar);

      const config = {
          headers: {
            'X-CSRF-Token': crf,
            'content-type': 'multipart/form-data'
          }
      }
      axios.post(url, formData, config)
        .then(res => {
          avatarChanged(res.data);
          this.setState(()=>({
            isFileSubmitting: false, 
          }));
          actions.setSubmitting(false);
          handleNotification('Avatar succefully changed');
          actions.resetForm();
        }, (error)=>{
          actions.setSubmitting(false);
          handleNotification('Avatar change failed');
          this.setState(()=>({isFileSubmitting: false}));
          console.error(error);
        });

    });
  }


  render() {
    const user = {
      password: '',
      password_confirmation: '',
      current_password: ''
    }

    const file = {
      filename: '',
      remove_avatar: false,
    }

    const { isSubmitting, isFileSubmitting, errors } = this.state;
    const { avatarUrl } = this.props;

    const errorMessages = [];
    for (let key in errors) {
      let message = (
        <div key={key}>{key} {errors[key]}</div>
      )
      errorMessages.push(message);
    }



    return (
      <>
        <section id="requests">
          <div className="container">
            <p>Account</p>

            <p>Avatar image</p>
            <img src={avatarUrl} className="img-circle" />

            <Formik
              initialValues={ file }
              validationSchema={ AvatarSchema }
              onSubmit={(values, { setSubmitting, resetForm }) => {
                this.onFileSubmit(values, { setSubmitting, resetForm })
              }} >
                <Form>
                  <AutoSave avatarUrl={avatarUrl} />
                  <div className="form-group">
                    <label htmlFor="filename">Select avatar image</label>
                    <Field name="filename" type="file" className="form-control-file" id="file-input" disabled={ isFileSubmitting ? true : false } />
                    <ErrorMessage name="filename" component="div" className="text-danger"/>
                  </div>

                </Form>
            </Formik>

            <p>Set new password</p>
            {errorMessages}

            <Formik
              initialValues={ user }
              validationSchema={ PasswordSchema }
              onSubmit={(values, { setSubmitting, resetForm }) => {
                this.onSubmit(values, { setSubmitting, resetForm })
              }} >
              <Form>
                <div className="form-group">
                  <label htmlFor="current_password">Old password</label>
                  <Field name="current_password" type="password" className="form-control" />
                  <ErrorMessage name="current_password" component="div" className="text-danger"/>
                </div>
                <div className="form-group">
                  <label htmlFor="password">New password</label>
                  <Field name="password" type="password" className="form-control" />
                  <ErrorMessage name="password" component="div" className="text-danger"/>
                </div>
                <div className="form-group">
                  <label htmlFor="password_confirmation">Repeat new password</label>
                  <Field name="password_confirmation" type="password" className="form-control" />
                  <ErrorMessage name="password_confirmation" component="div" className="text-danger"/>
                </div>


                <div className="text-center">
                  <button type="submit" className="submit-button" disabled={isSubmitting} >{ isSubmitting ? 'Saving...' : 'Save' }</button>
                </div>
              </Form>
            </Formik>


          </div>
        </section>
      </>
    );
  }
}


export default withRouter(Account);