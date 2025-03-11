// HeadlessTask.js
import notifee from '@notifee/react-native';

export default async (taskData) => {
  console.log('Headless task triggered:', taskData);

  // Schedule notifications
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Channel',
  });

  await notifee.createTriggerNotification(
    {
      title: 'Background Notification',
      body: 'This notification was scheduled in the background!',
      android: {
        channelId,
      },
    },
    {
      timestamp: new Date().getTime() + 10 * 1000, // 10 seconds from now
    },
  );
};