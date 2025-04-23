const { app } = require('@azure/functions');

app.setup({
    enableHttpStream: true,
});

// This function is triggered when a payment intent webhook is received
const paymentIntentWebHook = require('./functions/paymentIntentWebHook');

app.http('paymentIntentWebHook', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: paymentIntentWebHook,
});