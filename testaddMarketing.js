const mailchimp = require("@mailchimp/mailchimp_marketing");

mailchimp.setConfig({
  apiKey: "9b64e3f83563c3954107e08b55bce4f5",  // Replace with your actual Mailchimp API key
  server: "us22"  // Replace with your Mailchimp server prefix (e.g., 'us1', 'us2', etc.)
});

const footerContactInfo = {
  company: "Christopher Snowden",
  address1: "Specific Address Here",  // Replace with your actual street address
  city: "Alexandria",
  state: "VA",
  zip: "Specific ZIP Here",  // Replace with your actual ZIP code
  country: "US"
};

const campaignDefaults = {
  from_name: "Christopher Snowden",
  from_email: "hello@chrissnowden.com",
  subject: "Welcome to Christopher Snowden Shopify Development Services",
  language: "EN_US"
};

async function createAudience(name, description) {
  try {
    const response = await mailchimp.lists.createList({
      name: name,
      contact: footerContactInfo,
      permission_reminder: "You are receiving this email because you filled out an inquiry form on our website.",
      email_type_option: true,
      campaign_defaults: campaignDefaults
    });
    console.log(`Successfully created '${name}' audience. The audience id is ${response.id}.`);
  } catch (error) {
    console.error(`Failed to create '${name}' audience: ${error.message}`);
  }
}

async function run() {
  await createAudience("Shopify Inquiry - Basic Info", "Thank you for your interest! We look forward to helping you enhance your Shopify store.");
  await createAudience("Shopify Inquiry - Detailed Info", "Thanks for sharing details about your project! We'll tailor our solutions to your specific needs.");
  await createAudience("Shopify Inquiry - Complete Info and Meeting Scheduled", "We appreciate your thorough information and scheduling a meeting. We're excited to discuss your Shopify needs in detail.");
}

run();
