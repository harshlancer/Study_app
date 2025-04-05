import notifee, { 
  AndroidStyle, 
  EventType, 
  TriggerType, 
  RepeatFrequency, 
  AndroidImportance, 
  AndroidVisibility, 
  AndroidColor 
} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage key for tracking sent notifications
const SENT_NOTIFICATIONS_KEY = 'sent_news_notifications';

// Schedule a notification
const scheduleNotification = async (newsItem) => {
  try {
    // Validate news item
    if (!newsItem || !newsItem.title || !newsItem.summary) {
      console.warn('Invalid news item - missing title or summary');
      return null;
    }
    
    // Check if this exact notification has been sent before
    const sentNotificationId = await checkDuplicateNotification(newsItem);
    if (sentNotificationId) {
      return sentNotificationId;
    }
    
    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'news',
      name: 'News Updates',
      description: 'Get the latest news updates',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      vibration: true,
      vibrationPattern: [300, 500, 300, 500],
      lights: true,
      lightColor: AndroidColor.BLUE,
      sound: 'notification_sound', // Make sure this sound file exists in android/app/src/main/res/raw/
    });
    
    // For Android, make sure we have a valid icon
    const largeIcon = newsItem.imageUrl && newsItem.imageUrl.startsWith('http') 
      ? newsItem.imageUrl 
      : null;
    
    const picture = newsItem.imageUrl && newsItem.imageUrl.startsWith('http') 
      ? newsItem.imageUrl 
      : null;
    
    // Generate a unique ID for this notification based on content
    const notificationId = `news-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Calculate the next trigger time (3 hours from now)
    const triggerTimestamp = Date.now() + (3 * 60 * 60 * 1000);

    // Create the notification
    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: `📰 ${newsItem.title}`,
        subtitle: 'Latest Update',
        body: newsItem.summary,
        data: { 
          ...newsItem,
          type: 'news',
          timestamp: Date.now(),
          notificationId,
        },
        android: {
          channelId,
          smallIcon: 'ic_notification',
          largeIcon: largeIcon,
          color: '#4655F5',
          style: picture ? {
            type: AndroidStyle.BIGPICTURE,
            picture: picture,
          } : {
            type: AndroidStyle.BIGTEXT,
            text: newsItem.summary,
          },
          pressAction: {
            id: 'default',
          },
          showTimestamp: true,
          actions: [
            {
              title: '📖 Read More',
              pressAction: {
                id: 'read-more',
              },
            },
            {
              title: '✓ Mark as Read',
              pressAction: {
                id: 'dismiss',
              },
            },
          ],
          autoCancel: true,
          sound: 'notification_sound',
        },
        ios: {
          attachments: newsItem.imageUrl ? [{ url: newsItem.imageUrl }] : [],
          sound: 'notification.wav', // Make sure this file exists in your iOS project
          badgeCount: 1,
          categoryId: 'news',
          foregroundPresentationOptions: {
            badge: true,
            sound: true,
            banner: true,
            list: true,
          },
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerTimestamp,
        repeatFrequency: RepeatFrequency.HOURLY, // This will repeat every hour
        alarmManager: {
          allowWhileIdle: true,
        },
      }
    );
    
    // Save this notification to prevent duplicates
    await saveNotificationRecord(newsItem, notificationId);
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling news notification:', error);
    throw error;
  }
};

// Save notification record to prevent duplicates
const saveNotificationRecord = async (newsItem, notificationId) => {
  try {
    // Get existing notification records
    const existingRecordsJson = await AsyncStorage.getItem(SENT_NOTIFICATIONS_KEY);
    const existingRecords = existingRecordsJson ? JSON.parse(existingRecordsJson) : [];
    
    // Add new record
    const newRecord = {
      id: notificationId,
      title: newsItem.title,
      summary: newsItem.summary,
      timestamp: Date.now(),
    };
    
    // Keep only the last 20 notifications to prevent storage bloat
    const updatedRecords = [newRecord, ...existingRecords].slice(0, 20);
    
    // Save updated records
    await AsyncStorage.setItem(SENT_NOTIFICATIONS_KEY, JSON.stringify(updatedRecords));
  } catch (error) {
    console.error('Error saving notification record:', error);
  }
};

// Check if a notification with the same content has been sent before
const checkDuplicateNotification = async (newsItem) => {
  if (!newsItem || !newsItem.title || !newsItem.summary) return false;
  
  try {
    const existingRecordsJson = await AsyncStorage.getItem(SENT_NOTIFICATIONS_KEY);
    if (!existingRecordsJson) return false;
    
    const existingRecords = JSON.parse(existingRecordsJson);
    
    // Check for duplicates based on title and summary
    const duplicate = existingRecords.find(
      record => record.title === newsItem.title && record.summary === newsItem.summary
    );
    
    return duplicate ? duplicate.id : false;
  } catch (error) {
    console.error('Error checking for duplicate notifications:', error);
    return false;
  }
};

// Cancel all scheduled notifications
const cancelAllNotifications = async () => {
  try {
    await notifee.cancelAllNotifications();
  } catch (error) {
    console.error('Error canceling notifications:', error);
    throw error;
  }
};

// List all scheduled notifications for debugging
const listScheduledNotifications = async () => {
  try {
    const notifications = await notifee.getTriggerNotifications();
    return notifications;
  } catch (error) {
    console.error('Error listing scheduled notifications:', error);
    return [];
  }
};

// Set up notification listeners with improved handling
const setupNotificationListeners = (onNotificationPress) => {
  return notifee.onForegroundEvent(({ type, detail }) => {
    
    switch (type) {
      case EventType.DISMISSED:
        break;
      case EventType.PRESS:
        if (onNotificationPress && typeof onNotificationPress === 'function') {
          onNotificationPress(detail.notification);
        }
        break;
      case EventType.TRIGGER:
        break;
      case EventType.ACTION_PRESS:
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
    // Validate news item
    if (!newsItem || !newsItem.title || !newsItem.summary) {
      console.warn('Invalid news item for update - missing title or summary');
      return null;
    }
    
    // Get all scheduled notifications
    const scheduledNotifications = await notifee.getTriggerNotifications();
    
    // Find news notifications
    const newsNotifications = scheduledNotifications.filter(
      notification => notification.notification.data?.type === 'news'
    );
    
    // Cancel all existing news notifications
    for (const notification of newsNotifications) {
      await notifee.cancelTriggerNotification(notification.notification.id);
    }
    
    // Schedule a new one with updated content
    const notificationId = await scheduleNotification(newsItem);
    
    return notificationId;
  } catch (error) {
    console.error('Error updating news notification:', error);
    throw error;
  }
};

// Set up background handler (should be called in index.js)
const registerBackgroundHandler = (onNotificationPress) => {
  return notifee.onBackgroundEvent(async ({ type, detail }) => {
    
    if (type === EventType.PRESS) {
      if (onNotificationPress && typeof onNotificationPress === 'function') {
        onNotificationPress(detail.notification);
      }
    }
    
    if (type === EventType.ACTION_PRESS) {
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
      sound: 'notification_sound',
    });
    
    await notifee.displayNotification({
      id: 'test',
      title: '🔔 Test Notification',
      body: 'This is a test notification to verify notifications are working',
      android: {
        channelId,
        smallIcon: 'ic_notification',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        sound: 'notification_sound',
      },
      ios: {
        sound: 'notification.wav',
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
        },
      },
    });
    
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
};

// Validate news item before scheduling notification
const validateNewsItem = (newsItem) => {
  if (!newsItem) return false;
  if (!newsItem.title || newsItem.title.trim() === '') return false;
  if (!newsItem.summary || newsItem.summary.trim() === '') return false;
  
  return true;
};

export {
  scheduleNotification,
  cancelAllNotifications,
  updateNewsNotification,
  listScheduledNotifications,
  setupNotificationListeners,
  registerBackgroundHandler,
  sendTestNotification,
  validateNewsItem,
};