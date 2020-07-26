/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import {View, TextInput, StyleSheet, TouchableOpacity} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import API_KEY from './src/constants/google_map_key';
import {List, ListItem, Text} from 'native-base';
import {Dimensions} from 'react-native';
import Carousel from 'react-native-snap-carousel';
const {width: screenWidth} = Dimensions.get('window');
import _ from 'lodash';
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: '',
      latitude: 0,
      longitude: 0,
      destination: '',
      predictions: [],
      region: {
        latitude: 0,
        longitude: 0,
      },
      visitedPlaces: [],
    };
  }

  componentDidMount() {
    Geolocation.getCurrentPosition(
      (position) => {
        console.log(position);
        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        console.log(this.state);
      },
      (error) => this.setState({error: error.message}),
      {enableHighAccuracy: true, maximumAge: 2000, timeout: 20000},
    );
    //Geolocation.getCurrentPosition((info) => console.log(info));
  }

  async onChangeDestionation(destination) {
    this.setState({destination});
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${API_KEY}&input=${destination}&location=${this.state.latitude}, ${this.state.longitude}&radius=2000`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({
        predictions: json.predictions,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async onPress(location) {
    let {visitedPlaces} = this.state;
    visitedPlaces.push(location);
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${location.description}&key=${API_KEY}`;
    const result = await fetch(geoUrl);
    const json = await result.json();
    const latlng = json.results[0].geometry.location;
    this.setState({
      latitude: latlng.lat,
      longitude: latlng.lng,
      destination: '',
      predictions: [],
      region: {
        latitude: latlng.lat,
        longitude: latlng.lng,
      },
      visitedPlaces: visitedPlaces,
    });
    console.log(this.state);
  }

  _renderItem({item, index}) {
    return (
      <View style={styles.card}>
        <Text style={styles.text}>{item.description}</Text>
      </View>
    );
  }

  render() {
    const predictions = this.state.predictions.map((prediction) => {
      return (
        <List>
          <ListItem block light style={styles.predictions} key={prediction.id}>
            <TouchableOpacity
              style={styles.button}
              onPress={this.onPress.bind(this, prediction)}>
              <Text>{prediction.description}</Text>
            </TouchableOpacity>
          </ListItem>
        </List>
      );
    });
    return (
      <View style={styles.container}>
        <MapView
          style={styles.mapStyle}
          region={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.0121,
          }}
          showsUserLocation={true}>
          <Marker coordinate={this.state.region} />
        </MapView>
        <TextInput
          style={styles.input}
          placeholder="Enter your place!"
          value={this.state.destination}
          onChangeText={(destination) => this.onChangeDestionation(destination)}
        />
        {predictions}
        <Carousel
          sliderWidth={screenWidth}
          sliderHeight={screenWidth}
          itemWidth={250}
          data={this.state.visitedPlaces}
          renderItem={this._renderItem}
          hasParallaxImages={true}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  mapStyle: {
    ...StyleSheet.absoluteFillObject,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginTop: 40,
    backgroundColor: '#FFFFFF',
    marginBottom: 0,
    marginLeft: 15,
    marginRight: 15,
    padding: 10,
    borderRadius: 5,
  },
  predictions: {
    backgroundColor: '#FFFFFF',
    paddingLeft: 10,
    fontSize: 18,
    marginLeft: 15,
    marginRight: 15,
  },
  card: {
    backgroundColor: '#2196f3',
    borderRadius: 5,
    height: 150,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    paddingLeft: 10,
    paddingRight: 10,
  },
  text: {
    fontSize: 15,
    marginTop: 0,
    fontWeight: 'bold',
  },
});
export default App;
