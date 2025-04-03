// NotificationScheduler.js
import notifee, { 
  AndroidStyle, 
  EventType, 
  TriggerType, 
  RepeatFrequency, 
  AndroidImportance, 
  AndroidVisibility, 
  AndroidColor 
} from '@notifee/react-native';

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
      lights: true,
      lightColor: AndroidColor.BLUE,
    });
    
    // For Android, make sure we have a valid icon
    const largeIcon = newsItem.imageUrl && newsItem.imageUrl.startsWith('http') 
      ? newsItem.imageUrl 
      : null;
    
    const picture = newsItem.imageUrl && newsItem.imageUrl.startsWith('http') 
      ? newsItem.imageUrl 
      : null;
    
    // Calculate the next trigger time (immediate + repeating)
    const now = new Date();
    const triggerDate = new Date(now.getTime() + 10000); // Start in 10 seconds for testing
    
    // Create the notification
    const notificationId = await notifee.createTriggerNotification(
      {
        id: 'news-notification',
        title: newsItem.title || 'News Update',
        body: newsItem.summary || 'Check out the latest news',
        data: { 
          ...newsItem,
          type: 'news',
          timestamp: Date.now(),
        },
        android: {
          channelId,
          smallIcon: 'ic_notification', // Make sure this icon exists in your project
          largeIcon: largeIcon,
          color: '#4655F5',
          style: picture ? {
            type: AndroidStyle.BIGPICTURE,
            picture: picture,
          } : undefined,
          pressAction: {
            id: 'default',
          },
          showTimestamp: true,
          actions: [
            {
              title: 'Read More',
              pressAction: {
                id: 'read-more',
              },
            },
            {
              title: 'Dismiss',
              pressAction: {
                id: 'dismiss',
              },
            },
          ],
          autoCancel: true,
        },
        ios: {
          attachments: newsItem.imageUrl ? [{ url: newsItem.imageUrl }] : [],
          sound: 'default',
          badgeCount: 1,
          categoryId: 'news',
        },
      },
      {
        type: TriggerType.INTERVAL,
        timeUnit: 'hours',
        interval: 3,
      },
    );
    
    // Also display an immediate notification for testing
    
    
    console.log('Notification scheduled with ID:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling news notification:', error);
    throw error;
  }
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
const setupNotificationListeners = (onNotificationPress) => {
  return notifee.onForegroundEvent(({ type, detail }) => {
    console.log('Foreground event received:', type, detail);
    
    switch (type) {
      case EventType.DISMISSED:
        console.log('User dismissed notification', detail.notification);
        break;
      case EventType.PRESS:
        console.log('User pressed notification', detail.notification);
        if (onNotificationPress && typeof onNotificationPress === 'function') {
          onNotificationPress(detail.notification);
        }
        break;
      case EventType.TRIGGER:
        console.log('Notification triggered', detail.notification);
        break;
      case EventType.ACTION_PRESS:
        console.log('User pressed action', detail.pressAction);
        // Handle specific action buttons
        if (detail.pressAction.id === 'read-more' && onNotificationPress) {
          onNotificationPress(detail.notification);
        }
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
const registerBackgroundHandler = (onNotificationPress) => {
  return notifee.onBackgroundEvent(async ({ type, detail }) => {
    console.log('Background event received:', type, detail);
    
    if (type === EventType.PRESS) {
      console.log('User pressed notification in background', detail.notification);
      if (onNotificationPress && typeof onNotificationPress === 'function') {
        onNotificationPress(detail.notification);
      }
    }
    
    if (type === EventType.ACTION_PRESS) {
      console.log('User pressed action in background', detail.pressAction);
      if (detail.pressAction.id === 'read-more' && onNotificationPress) {
        onNotificationPress(detail.notification);
      }
    }
    
    return Promise.resolve();
  });
};

// Test function to send an immediate notification
const sendTestNotification = async () => {
  try {
    const channelId = await notifee.createChannel({
      id: 'test',
      name: 'Test Channel',
      importance: AndroidImportance.HIGH,
    });
    
    await notifee.displayNotification({
      id: 'test',
      title: 'Test Notification',
      body: 'This is a test notification to verify notifications are working',
      android: {
        channelId,
        smallIcon: 'ic_notification',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
      },
      ios: {
        sound: 'default',
      },
    });
    
    console.log('Test notification sent');
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
};

export {
  scheduleNotification,
  cancelAllNotifications,
  updateNewsNotification,
  listScheduledNotifications,
  setupNotificationListeners,
  registerBackgroundHandler,
  sendTestNotification,
};