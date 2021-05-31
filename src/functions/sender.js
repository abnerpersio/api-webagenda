const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
  async notifier(title, message, notificationToken) {
    const bodyObj = {
      notification: {
        title: title,
        body: message,
        click_action: 'https://painel.webatom.com.br/',
        icon: 'https://painel.webatom.com.br/logo192.png',
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
        return;
      })
      .catch((err) => {
        console.error(err);
      });
  },
};
