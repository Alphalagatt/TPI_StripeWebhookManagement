const stripe = require('stripe')(process.env.SECRET_KEY); // Replace with your actual secret key

async function getRawBodyFromReadable(readable) {
    const chunks = [];
    for await (const chunk of readable) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf8'); // or 'ascii' if needed
  }

async function paymentIntentWebHook(request,context) {
    const webhookSecret = process.env.WEBHOOK_SECRET;
    const sig = request.headers.get('stripe-signature');
    
    const rawBody = await getRawBodyFromReadable(request.body);
    
   
    try {
        const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                context.log(`PaymentIntent was successful!`, paymentIntent.id);
                // Perform actions based on the successful payment intent, e.g., update your database

                break;
            case 'payment_intent.payment_failed':
                const paymentFailed = event.data.object;
                context.log(`PaymentIntent failed: ${paymentFailed.last_payment_error.message}`);
                break;
            default:
                context.log(`Unhandled event type: ${event.type}`);
        }
        // Return a response to acknowledge receipt of the event
        context.log(`Webhook processed successfully`);
        
        return {
            status: 200,
            body: event.data.object // Return the event object for further processing if needed
        };


    } catch (err) {
        context.log(`Webhook signature verification failed: ${err.message}`);
        return {
            status: 400,
            body: `Webhook signature verification failed: ${err.message}`
        };
    }


}


module.exports = paymentIntentWebHook;
