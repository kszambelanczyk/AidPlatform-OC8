import React, { useEffect, useRef, useState }  from 'react';
import { useFormikContext } from 'formik';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const FormikAddress = (props) => {

  const { values, errors, handleChange, setFieldValue } = useFormikContext();

  const mapInstance = useRef({map: null, geocoder: null});

  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    // geolocation finished and request is a new record and map loaded
    if(props.geolocationFinished && !values.id && mapInstance.current.map){
      console.log(`Effect on ${values.lat} ${values.lng}`);
      console.log(`Center after effect`);
      centerMap({lat: values.lat, lng: values.lng});
      updateAddressFromLocation({lat: values.lat, lng: values.lng});
    }
  }, [props.geolocationFinished]);

  const onClick = (e) => {
    updateAddressFromLocation({lat: e.latLng.lat(), lng: e.latLng.lng()});
    setFieldValue('lat', e.latLng.lat());
    setFieldValue('lng', e.latLng.lng());
  }

  const updateAddressFromLocation = ({lat, lng}) => {
    if(!mapInstance.current.geocoder){
      return;
    }
    doReverseGeocode({lat: lat, lng: lng}).then((result)=>{
      setFieldValue('address', result);
    });
  }

  const doReverseGeocode = ({lat, lng}) => {
    setGeocoding(true);
    console.log(`Geocoding on ${lat} ${lng}`);

    return new Promise((resolve, reject) => {
      mapInstance.current.geocoder.geocode({location: {lat: lat, lng: lng}}, (results, status)=>{
        setGeocoding(false);
        if (status === 'OK') {
          if (results[0]) {
            resolve(results[0].formatted_address);
          }
        }
        reject(new Error("Reverse geocoding failed"));
      });
    });
  }

  const centerMap = (latLng) => {
    if(!mapInstance.current.map){
      return;
    }
    mapInstance.current.map.setCenter({lat: latLng.lat, lng: latLng.lng});
    // updateAddressFromLocation(latLng);
  }

  const mapLoaded = (m) => {
    mapInstance.current.map = m;
    mapInstance.current.geocoder = new google.maps.Geocoder;

    if(props.geolocationFinished && !values.id){
      console.log(`Center after map loaded for new`);
      centerMap({lat: values.lat, lng: values.lng});
      if(!values.id){
        updateAddressFromLocation({lat: values.lat, lng: values.lng});
      }
    } 
    if(values.id) {
      console.log(`Center after map loaded for edit`);
      centerMap({lat: values.lat, lng: values.lng});
    }
  }

  return (
    <>
      <label htmlFor="Address">Location / Address</label>
      <div className="form-address-container">
        <div className="row">
          <div className="col-md-8">
            <LoadScript id="script-loader"
              googleMapsApiKey={ process.env.MAP_API }>
              <GoogleMap id='example-MAP'
                mapContainerStyle={{
                  height: "600px",
                  width: "100%"
                }}
                zoom={13}
                options={{streetViewControl:false}}
                onClick={onClick}
                onLoad={ (m) => {mapLoaded(m)} }
              >
              <Marker
                position={ {lat: values.lat, lng: values.lng} }
              />
              </GoogleMap>
            </LoadScript>

          </div>
          <div className="col-md-4">
            <div className="form-group">
              <textarea
                name="address"
                type="email"
                value={values.address}
                onChange={handleChange}
                className="form-control"
              />
              {errors.address && <div className="text-danger">{errors.address}</div>}
            </div>
          </div>
        </div>
        <div className={ geocoding ? 'overlay' : '' }></div>
      </div>
    </>
  );
}


export default FormikAddress;