// Don't put any keys in code. See https://docs.stripe.com/keys-best-practices.
// La clave secreta se define como variable de entorno STRIPE_SECRET_KEY en Netlify.
   const StripeModule = require("stripe");
   const Stripe = StripeModule.Stripe || StripeModule.default || StripeModule;

// Precios de Stripe (IDs de precio de pago único) por plan.
const PRICES = {
  foundations: "price_1UZHuLRxcKMtTYD3fueyOOSa",
  complete: "price_1UZHulRxcKMtTYD38OVUwgyI",
};

exports.handler = async (event) => {
  const plan = event.queryStringParameters && event.queryStringParameters.plan;
  const price = PRICES[plan];
  if (!price || price === "price_...") {
    return { statusCode: 400, body: "Plan no disponible" };
  }

  // DOMAIN es opcional; Netlify define URL con la dirección principal del sitio.
  const domain = process.env.DOMAIN || process.env.URL;

  try {
    const session = await stripe.checkout.sessions.create({
      ui_mode: "hosted_page",
      mode: "payment",
      success_url: `${domain}/gracias.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domain}/#planes`,
      line_items: [{ price, quantity: 1 }],
      billing_address_collection: "auto",
      name_collection: { individual: { enabled: true, optional: true } },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: false,
      automatic_tax: { enabled: true },
      submit_type: "auto",
      integration_identifier: "hosted_web_0003",
      origin_context: "web",
    });

    return { statusCode: 303, headers: { Location: session.url }, body: "" };
  } catch (err) {
    console.log("Error creando la sesión de Checkout:", err.message);
    return { statusCode: 500, body: "No se pudo iniciar el pago" };
  }
};
