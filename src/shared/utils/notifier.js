import fetch from 'node-fetch';
import '../../bootstrap';

// const token = 'AAAAhMf4yb0:APA91bELdGjHd--ZwCCCBnSAnqeS-FuVvhsbdSiQBNCKI18diYnMt5IPGBq-6iXm1xrrtM_FnnXJOAE9fya6yp2cxEjjpeMRPDQz8EbyFl3vNbQuzfT4MsE5Bu5NQqeE05mTr-P3QW5e';
const token = 'AAAAhMf4yb0:APA91bFekiSuCPyoVQf6jVSFvUoUXldQrY1ON2ke-zZDI3vPR0TdWdGGiUsgxBXYzAYJWbVLiJap6nEFhlpWiTrLd1_WYTU6UbiFZQM-rrpAMYkSEmNJn506w0CXOIkprKj1vpE7lAvC';

export const firebaseNotifier = async ({ title, message, notificationToken }) => {
  // await fetch('https://us-central1-notifications-web-agenda.cloudfunctions.net/sendMessage', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     token: process.env.NOTIFICATIONS_TOKEN,
  //   },
  //   body: JSON.stringify({
  //     notification_title: title,
  //     notification_message: message,
  //     notification_token: notificationToken,
  //   }),
  // });
  console.log('enviando notificação...');

  await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `key=${token}`,
    },
    body: JSON.stringify({
      data: {
        title: 'Um cliente acaba de fazer um agendamento!',
        message: 'Confira agora mesmo',
      },
      to: 'dDiLYxn6DbJOAfCMld-Isr:APA91bHjlpg5JdhQZVmTrfZ-Vcb3RdyzrhAxN9NemDTwf9mVq03JG6oOcqLgYqdhJQQ1GNRDg5hQAhK4ctjfnLrJ6jTFvM--GjYoNvEQ_XuAb11fEmSv22OvQ1lHh7ng0Ag46fC1pZNZ',
    }),
  })
    .then((response) => response.json())
    .then((body) => console.log(body))
    .catch((error) => console.log(error));
};

// firebaseNotifier({ title: 'test', message: 'test' });
