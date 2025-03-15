import notifee, { AndroidStyle, EventType } from '@notifee/react-native';

// Schedule and display a notification
const scheduleNotification = async (newsItem) => {
  try {
    if (!newsItem) return;

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
    });

    // Display the notification
    await notifee.displayNotification({
      title: newsItem.title,
      body: newsItem.summary,
      android: {
        channelId,
        largeIcon: newsItem.imageUrl, // Use the image as the large icon
        style: {
          type: AndroidStyle.BIGPICTURE, // Use BIGPICTURE style for Android
          picture: newsItem.imageUrl, // Set the image as the big picture
        },
      },
      ios: {
        attachments: [
          {
            url: newsItem.imageUrl, // Use the image as an attachment for iOS
          },
        ],
      },
    });

    console.log('Notification sent successfully!');

    // Schedule the next notification for 2 minutes later
    await scheduleNextNotification(newsItem); // Pass the newsItem to the next notification
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Schedule the next notification
const scheduleNextNotification = async (newsItem) => {
  try {
    await notifee.createTriggerNotification(
      {
        title: newsItem.title, // Use the real title from the news item
        body: newsItem.summary, // Use the real summary from the news item
        android: {
          channelId: 'default',
          largeIcon: newsItem.imageUrl, // Use the image as the large icon
          style: {
            type: AndroidStyle.BIGPICTURE, // Use BIGPICTURE style for Android
            picture: newsItem.imageUrl, // Set the image as the big picture
          },
        },
        ios: {
          attachments: [
            {
              url: newsItem.imageUrl, // Use the image as an attachment for iOS
            },
          ],
        },
      },
      {
        type: 0, // TIMESTAMP trigger type
        timestamp: Date.now() + 2 * 60 * 1000, // 2 minutes from now
      },
    );

    console.log('Next notification scheduled for 2 minutes later!');
  } catch (error) {
    console.error('Error scheduling next notification:', error);
  }
};

// Subscribe to notification events
const setupNotificationListeners = () => {
  return notifee.onForegroundEvent(({ type, detail }) => {
    switch (type) {
      case EventType.DISMISSED:
        console.log('User dismissed notification', detail.notification);
        // Reschedule the next notification
        scheduleNextNotification(detail.notification.data); // Pass the newsItem from the dismissed notification
        break;
      case EventType.PRESS:
        console.log('User pressed notification', detail.notification);
        // Reschedule the next notification
        scheduleNextNotification(detail.notification.data); // Pass the newsItem from the pressed notification
        break;
    }
  });
};

export { scheduleNotification, scheduleNextNotification, setupNotificationListeners };