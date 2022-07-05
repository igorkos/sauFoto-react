import * as React from 'react';
import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TextInput,
  Button,
  TouchableOpacity,
  StatusBar,
} from "react-native";

import { authenticate } from '../stacks/auth';
import { userSession } from '../stacks/auth';
import { styles } from '../components/Styles';

export default function SigninScreen(){
  	return (
		<View style={styles.container}>
        		  <Image style={styles.image} source={require("../assets/images/icon.png")} />

        		  <TouchableOpacity style={styles.loginBtn}
        			  onPress={() => authenticate()}>
        			<Text style={styles.buttonText}>Signin</Text>
        		  </TouchableOpacity>
  		</View>
		);
};
