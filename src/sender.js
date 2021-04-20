const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
  async notifier(title, message, notificationToken) {
    console.log('env', process.env.PORT);
    const bodyObj = {
      notification: {
        title: title,
        body: message,
        click_action: 'https://d3aqqqs7b090ob.cloudfront.net/',
        icon: 'https://d3aqqqs7b090ob.cloudfront.net/logo192.png',
      },
      to: notificationToken,
    };
    return await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${process.env.NOTIFICATIONS_TOKEN}`,
      },
      body: JSON.stringify(bodyObj),
    })
      .then((response) => {
        // console.log(response);
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  },
};
