const mailchimp = require("@mailchimp/mailchimp_marketing");
const nodeSchedule = require('node-schedule');

mailchimp.setConfig({
  apiKey: "9b64e3f83563c3954107e08b55bce4f5",
  server: "us22"
});

const emailJobs = {}; // Store references to scheduled jobs

async function addListMember(listId, memberInfo) {
  return await mailchimp.lists.addListMember(listId, {
    email_address: memberInfo.email,
    status_if_new: "subscribed",
    status: "subscribed",
    merge_fields: memberInfo.merge_fields
  });
}

async function removeListMember(listId, email) {
  try {
    const subscriberHash = mailchimp.utils.md5(email.toLowerCase());
    await mailchimp.lists.deleteListMember(listId, subscriberHash);
  } catch (error) {
    console.error(`Error removing ${email} from list ${listId}:`, error.message);
  }
}

function scheduleEmail(email, listId, delayInMinutes) {
  const jobId = `${email}-${listId}`;
  if (emailJobs[jobId]) {
    emailJobs[jobId].cancel();
  }
  emailJobs[jobId] = nodeSchedule.scheduleJob(new Date(Date.now() + delayInMinutes * 60000), async () => {
    await sendEmail(email, listId);
    delete emailJobs[jobId];
    // Update Mailchimp to indicate that the reminder email has been sent
    await mailchimp.lists.updateListMember(listId, mailchimp.utils.md5(email.toLowerCase()), {
      merge_fields: { REMINDER_SENT: 'yes' }
    });
  });
}

async function sendEmail(email, listId) {
  console.log(`Email sent to ${email} from list ${listId}`);
  // Implement email sending logic here
}


exports.handleBasicInquiry = async (req, res) => {
    const { name, email } = req.body;
    const [firstName, lastName] = name.split(' ');
  
    try {
      const memberInfo = {
        email: email,
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName || '',
          REMINDER_SENT: 'no'  // Initialize reminder sent status as 'no'
        }
      };
      await addListMember("basic_list_id", memberInfo);
      scheduleEmail(email, "basic_list_id", 30);  // Set to 30 minutes
      res.status(200).json({
        message: `Successfully added ${email} to the basic inquiry list and email scheduled.`,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to add contact", error: error.message });
    }
  };
  
  exports.handleDetailedInquiry = async (req, res) => {
    const { name, email, service, description } = req.body;
    const [firstName, lastName] = name.split(' ');
  
    try {
      await removeListMember("basic_list_id", email);
      const memberInfo = {
        email: email,
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName || '',
          SERVICE: service,
          DESC: description,
          REMINDER_SENT: 'no'
        }
      };
      await addListMember("detailed_list_id", memberInfo);
      scheduleEmail(email, "detailed_list_id", 30);
      res.status(200).json({
        message: `Successfully transitioned ${email} to detailed inquiry list.`,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to transition contact", error: error.message });
    }
  };
  

  exports.handleCompleteInquiry = async (req, res) => {
    const { name, email, service, description, appointmentTime, appointmentDate } = req.body;
    const [firstName, lastName] = name.split(' ');

    try {
        // Remove user from previous lists if they are present
        await removeListMember("basic_list_id", email);
        await removeListMember("detailed_list_id", email);
        const memberInfo = {
            email: email,
            merge_fields: {
                FNAME: firstName,
                LNAME: lastName || '',
                SERVICE: service,
                DESC: description,
                APPTIME: appointmentTime,
                APPDATE: appointmentDate,
                REMINDER_SENT: 'no'
            }
        };
        // Add user to the complete list
        await addListMember("complete_list_id", memberInfo);
        // Send a confirmation email immediately upon form completion
        await sendConfirmationEmail(email, memberInfo.merge_fields);
        res.status(200).json({
            message: `Successfully transitioned ${email} to complete inquiry list and sent confirmation email.`,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to transition contact or send confirmation email", error: error.message });
    }
};

async function sendConfirmationEmail(email, mergeFields) {
    console.log(`Sending confirmation email to ${email}`);
    // Implement the actual email sending logic here
    // The content of the email could be tailored based on the mergeFields content
    // Example: "Hello, {mergeFields.FNAME}, your appointment on {mergeFields.APPTIME} has been confirmed."
}