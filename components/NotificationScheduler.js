import notifee, { AndroidStyle, EventType, TriggerType, RepeatFrequency, AndroidImportance, AndroidVisibility, AndroidColor } from '@notifee/react-native';
import { scheduleDailyMemeNotification } from './MemeScheduler';

// Schedule a notification every 3 hours
const scheduleNotification = async (newsItem) => {
  try {
    if (!newsItem) {
      console.warn('No news item provided for notification');
      return;
    }
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'news',
      name: 'News Updates',
      description: 'Get the latest news updates',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      vibration: true,
      vibrationPattern: [300, 500],
      // Add lights for better visibility
      lights: true,
      lightColor: AndroidColor.BLUE,
    });
    
    // Calculate the next 3-hour interval
    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: getNext3HourTimestamp(), // First trigger at the next 3-hour mark
      repeatFrequency: RepeatFrequency.HOURLY, // Use hourly repeat
      interval: 3, // Repeat every 3 hours
      alarmManager: true, // Use AlarmManager for more precise timing (Android only)
    };
    
    const notificationId = await notifee.createTriggerNotification(
      {
        id: 'news-notification', // Unique ID for the repeating notification
        title: newsItem.title,
        body: newsItem.summary,
        data: { 
          ...newsItem,
          type: 'news',
          timestamp: Date.now(), // Store timestamp for our tracking
        },
        android: {
          channelId,
          largeIcon: newsItem.imageUrl,
          style: {
            type: AndroidStyle.BIGPICTURE,
            picture: newsItem.imageUrl,
          },
          pressAction: {
            id: 'default',
            launchActivity: '.default',
            mainComponent: 'App',
          },
          // Add timestamp to show time
          showTimestamp: true,
          // Add actions for better user engagement
          actions: [
            {
              title: 'Read More',
              pressAction: {
                id: 'read-more',
                launchActivity: '.MainActivity',
              },
            },
            {
              title: 'Dismiss',
              pressAction: {
                id: 'dismiss',
              },
            },
          ],
          // Make notifications auto-cancel when tapped
          autoCancel: true,
        },
        ios: {
          attachments: [{ url: newsItem.imageUrl }],
          categoryId: 'news',
          // Add timestamp for iOS
          sound: 'default',
          // Add badge count
          badgeCount: 1,
          // Improve interaction options
          categoryId: 'news-category',
        },
      },
      trigger,
    );
    console.log('News notification scheduled with ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling news notification:', error);
    throw error; // Propagate error for better error handling
  }
};

// Helper function to get the next 3-hour interval timestamp
const getNext3HourTimestamp = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const milliseconds = now.getMilliseconds();
  
  // Calculate how many hours until the next 3-hour mark
  const hoursUntilNext = 3 - (hours % 3);
  const nextTrigger = new Date(now);
  nextTrigger.setHours(hours + hoursUntilNext, 0, 0, 0); // Set to next 3-hour mark (e.g., 3:00, 6:00)
  
  // If we're exactly at a 3-hour mark, set for the next one
  if (minutes === 0 && seconds === 0 && milliseconds === 0 && hours % 3 === 0) {
    nextTrigger.setHours(hours + 3, 0, 0, 0);
  }
  
  return nextTrigger.getTime();
};

// Cancel all scheduled notifications
const cancelAllNotifications = async () => {
  try {
    await notifee.cancelAllNotifications();
    console.log('All notifications canceled');
  } catch (error) {
    console.error('Error canceling notifications:', error);
    throw error;
  }
};

// List all scheduled notifications for debugging
const listScheduledNotifications = async () => {
  try {
    const notifications = await notifee.getTriggerNotifications();
    console.log('Scheduled notifications:', notifications);
    return notifications;
  } catch (error) {
    console.error('Error listing scheduled notifications:', error);
    return [];
  }
};

// Set up notification listeners with improved handling
const setupNotificationListeners = () => {
  return notifee.onForegroundEvent(({ type, detail }) => {
    switch (type) {
      case EventType.DISMISSED:
        console.log('User dismissed notification', detail.notification);
        break;
      case EventType.PRESS:
        console.log('User pressed notification', detail.notification);
        
        // Handle navigation based on notification type
        const notificationType = detail.notification?.data?.type;
        const pressActionId = detail.pressAction?.id;
        
        if (notificationType === 'news') {
          // Handle news notification press
          console.log('News notification pressed:', detail.notification.data);
          // Different actions based on which button was pressed
          if (pressActionId === 'read-more') {
            // Navigate to full article
            console.log('User wants to read more');
          } else if (pressActionId === 'dismiss') {
            // Do nothing, notification is automatically dismissed
          }
        } else if (notificationType === 'meme') {
          // Handle meme notification press
          console.log('Meme notification pressed:', detail.notification.data);
          // You could handle deep linking to the current affairs screen here
        }
        break;
      case EventType.TRIGGER:
        console.log('Notification triggered', detail.notification);
        break;
      case EventType.ACTION_PRESS:
        console.log('Action pressed on notification', detail.pressAction);
        // Handle specific action buttons
        break;
    }
  });
};

// Update notification with new content
const updateNewsNotification = async (newsItem) => {
  try {
    // Cancel the existing notification
    await notifee.cancelTriggerNotification('news-notification');
    
    // Schedule a new one with updated content
    await scheduleNotification(newsItem);
    console.log('News notification updated');
  } catch (error) {
    console.error('Error updating news notification:', error);
    throw error;
  }
};

// Set up background handler (should be called in index.js)
const registerBackgroundHandler = () => {
  return notifee.onBackgroundEvent(async ({ type, detail }) => {
    const { notification } = detail;
    
    if (type === EventType.PRESS) {
      // Handle notification press in background
      console.log('Background notification pressed:', notification);
    }
    
    // Handle background action presses
    if (type === EventType.ACTION_PRESS) {
      const { pressAction } = detail;
      console.log('Action pressed in background:', pressAction.id);
    }
  });
};

export {
  scheduleNotification,
  cancelAllNotifications,
  updateNewsNotification,
  listScheduledNotifications,
  setupNotificationListeners,
  registerBackgroundHandler,
};