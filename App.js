// App.ts
import {StripeProvider, useConfirmPayment} from '@stripe/stripe-react-native';
import {useStripe} from '@stripe/stripe-react-native';
import {
  Text,
  Alert,
  TouchableOpacity,
  View,
  Linking,
  Modal,
  Platform,
} from 'react-native';
import {Provider} from 'react-redux';
import {store} from './src/store';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useState, useEffect} from 'react';

var client_secret = '';

export default function App() {
  return (
    <Provider store={store}>
      <StripeProvider
        publishableKey="pk_live_NWAwnaHBojtjLi7q22WvpZaG00cTFpPzLD"
        merchantIdentifier="merchant.au.com.jmango.JMango360" // required for Apple Pay
        urlScheme="testStripe://testStripe" // required for 3D Secure and bank redirects
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
  const {initPaymentSheet, presentPaymentSheet} = useStripe();
  const {confirmPayment} = useConfirmPayment();
  const [state, setState] = useState();
  const [visible, setVisible] = useState(false);
  console.log('state outside', state);

  useEffect(() => {
    Alert.alert('save data');
    setState('state');
    storeData();
  }, []);

  const submit = async () => {
    setVisible(false);
    const response = await confirmPayment(client_secret, {
      paymentMethodType: 'Ideal',
      paymentMethodData: {
        bankName: 'ing',
      },
    });
    if (response.error) {
      Alert.alert('Something went wrong');
      return;
    }
  };
  const modalCustomPayment = () => {
    setVisible(true);
  };

  async function onCheckout() {
    // 1. Create a payment intent
    const response = await axios.post(
      'https://elbrus-stripe-agent.jmango360.com/stripe/payment-intent',
      {
        appKey: '5aa6b7bc32d71613b8b03cbe',
        jmAPIKey: 'da8179fa-3b7c-11ee-be56-0242ac120002',
        platform: Platform.OS,
      },
    );
    console.log('response', response);
    if (response.error) {
      Alert.alert('Something went wrong');
      return;
    }
    client_secret = response.data.client_secret;
    // 2. Initialize the Payment sheet
    const initResponse = await initPaymentSheet({
      merchantDisplayName: 'merchant.au.com.jmango.JMango360',
      paymentIntentClientSecret: response.data.client_secret,
      allowsDelayedPaymentMethods: true,
      returnURL: 'testStripe://testStripe',
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

    // 3. custom payment method
    // modalCustomPayment();
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
      <Modal style={{flex: 1, backgroundColor: 'red'}} visible={visible}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text>payments</Text>
          <Text>ING bank</Text>
          <TouchableOpacity
            onPress={submit}
            style={{
              height: 30,
              width: 60,
              backgroundColor: 'blue',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text>Submit</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
