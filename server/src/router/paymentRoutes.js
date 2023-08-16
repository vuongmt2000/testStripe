const express = require('express');
const router = express.Router();
const stripe = require('stripe')(
  'sk_test_51NdpgiK25O68wrkz1LRJJcoMnliGotfVosSHc4ARpZiYkLtBBV1jAbx3tSq5fxu4MsNl7JX0MUyP8DPQ6I7oyGxy00iCJwLL5O',
);

// router endpoints
router.post('/intents', async (req, res) => {
  try {
    // create a PaymentIntent
    console.log('go to intents');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 10000, // Integer, usd -> pennies, eur -> cents
      currency: 'eur',
      payment_method_types: ['ideal'],
    });
    // Return the secret
    console.log('go to intents', paymentIntent);
    res.json({paymentIntent: paymentIntent.client_secret});
  } catch (e) {
    res.status(400).json({
      error: e.message,
    });
  }
  return null;
});
router.get('/i', async (req, res) => {
  // create a PaymentIntent
  console.log('go to intents');

  // Return the secret
  res.send('<h2>Hello world </h2>');
});

module.exports = router;
