// App.ts
import {StripeProvider} from '@stripe/stripe-react-native';
import {useStripe} from '@stripe/stripe-react-native';
import {Text, Alert, TouchableOpacity, View, Linking} from 'react-native';
import {Provider} from 'react-redux';
import {store} from './src/store';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState, useEffect} from 'react';

export default function App() {
  return (
    <Provider store={store}>
      <StripeProvider
        publishableKey="pk_test_51NdpgiK25O68wrkzze2wsggPPYFQ5RNRWqd3NKeowZLE4GaTMoR2PrJMgSyI6Gt7Yi6kI9Bsy1T0WOEnQOiWIgRc00rdm78NrB"
        merchantIdentifier="merchant.au.com.jmango.JMango360" // required for Apple Pay
        urlScheme="testStripe" // required for 3D Secure and bank redirects
      >
        <PaymentScreen />
      </StripeProvider>
    </Provider>
  );
}

// PaymentScreen.ts
const storeData = async () => {
  try {
    await AsyncStorage.setItem('dataStorage', 'storage');
  } catch (e) {
    // saving error
  }
};
function PaymentScreen() {
  const {confirmPayment, initPaymentSheet, presentPaymentSheet} = useStripe();
  const [state, setState] = useState();
  console.log('state outside', state);

  useEffect(() => {
    Alert.alert('save data');
    setState('state');
    storeData();
  }, []);

  const onCreateOrder = async () => {};

  async function onCheckout() {
    // 1. Create a payment intent
    const response = await axios.post(
      'https://1931-118-70-16-17.ngrok-free.app/payments/intents',
      {
        amount: 10000,
      },
    );
    console.log('response', response);
    if (response.error) {
      Alert.alert('Something went wrong');
      return;
    }

    // 2. Initialize the Payment sheet
    const initResponse = await initPaymentSheet({
      merchantDisplayName: 'test.vuong.com',
      paymentIntentClientSecret: response.data.paymentIntent,
      allowsDelayedPaymentMethods: true,
    });
    if (initResponse.error) {
      console.log(initResponse.error);
      Alert.alert('Something went wrong');
      return;
    }

    // 3. Present the Payment Sheet from Stripe
    const paymentResponse = await presentPaymentSheet();

    if (paymentResponse.error) {
      Alert.alert(
        `Error code: ${paymentResponse.error.code}`,
        paymentResponse.error.message,
      );
      return;
    }
  }

  const getData = async () => {
    try {
      const value = await AsyncStorage.getItem('dataStorage');
      Alert.alert(value, state);
    } catch (e) {
      // saving error
    }
  };
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <TouchableOpacity
        style={{
          height: 60,
          width: 120,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'blue',
        }}
        onPress={onCheckout}>
        <Text style={{color: 'white'}}>Press checkout</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          height: 60,
          width: 120,
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 20,
          backgroundColor: 'blue',
        }}
        onPress={getData}>
        <Text style={{color: 'white'}}>show data</Text>
      </TouchableOpacity>
    </View>
  );
}
