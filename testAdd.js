const mailchimpClient = require("@mailchimp/mailchimp_transactional")(
    "9b64e3f83563c3954107e08b55bce4f5"
  );
  
  const run = async () => {
    const response = await mailchimpClient.allowlists.add({
      email: "Erwin_DuBuque78@gmail.com",
    });
    console.log(response);
  };
  
  run();



 