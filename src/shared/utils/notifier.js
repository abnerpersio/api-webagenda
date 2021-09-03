import fetch from 'node-fetch';
import '../../bootstrap';

export const firebaseNotifier = async ({ title, message, notificationToken }) => {
  await fetch('https://us-central1-notifications-web-agenda.cloudfunctions.net/sendMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      token: process.env.NOTIFICATIONS_TOKEN,
    },
    body: JSON.stringify({
      notification_title: title,
      notification_message: message,
      notification_token: notificationToken,
    }),
  });
};
