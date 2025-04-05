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

// Meme data - study-related humorous quotes
const MEMES = [
  "Padhai ka plan to perfect tha, bas execution ka mood nahi tha.",
  "Motivation aata hai, par zyada der rukta nahi.",
  "Books ka wazan badh raha hai, par knowledge wahi ka wahi hai.",
  "Nahi ho rahi padhai? Kyunki break khatam hone ka naam hi nahi le raha.",
  "Padhte waqt concentration: 404 Not Found.",
  "Syllabus se zyada to procrastination bada ho gaya hai.",
  "Revision ke naam pe pehle pura syllabus bhool jata hoon.",
  "Jab bhi padhna shuru karo, sab kuch interesting lagne lagta hai... except books.",
  "Reading speed exam se pehle hi sloth mode mein kyun chali jati hai?",
  "Brain: Sab yaad hai. Paper: Kabhi dekha bhi hai?",
  "Aaj se serious padhai shuru… kal se.",
  "Padho toh neend aati hai, na padho toh guilt aata hai.",
  "Syllabus complete karna ab ek impossible mission lagta hai.",
  "Exam aate hain, chhote chhote break lamba ho jata hai.",
  "Padhai mein focus karne se zyada to motivational quotes collect karne mein maza aata hai.",
  "Motivation aur mere beech mein bas ek nap ka farak hai.",
  "Padhai start karte hi sab kuch interesting lagne lagta hai... except padhai.",
  "Exam ke din hi sab kuch yaad aata hai... syllabus ko chhod kar.",
  "Padhai ki speed aur buffering speed me kabhi race hui to buffering hi jeetegi.",
  "Syllabus khatam karne ka plan to tha, bas time nahi tha.",
  "Padhai mein focus karne se zyada to phone mein settings explore karne mein maza aata hai.",
  "Padhai karne se pehle uska strategy plan karna hi pura din le leta hai.",
  "Books dekhte hi neend automatic activate ho jati hai.",
  "Kuch log kehte hain, 'Just do it.' Hum kehte hain, 'Kal karenge.'",
  "Study plan banane mein jitna time laga, usse kam mein syllabus khatam ho jata.",
  "Padhai aur motivation kabhi bhi ek hi jagah pe nahi milte.",
  "Exam time pe hi room clean karne ka shauk kyun chadh jata hai?",
  "Padhai mein concentration: Loading... Please wait.",
  "Books: Open karne se pehle hi heavy lagne lagti hain.",
  "Agar procrastination Olympic sport hota, to hum gold medalist hote."
];

// Storage keys
const SENT_MEMES_KEY = 'sent_memes_index';
const LAST_MEME_KEY = 'last_sent_meme';

// Get a random meme that hasn't been sent recently
const getRandomMeme = async () => {
  try {
    // Get the last sent meme to avoid immediate repetition
    const lastMemeText = await AsyncStorage.getItem(LAST_MEME_KEY);
    
    // Get the list of already sent meme indices
    const sentMemesJson = await AsyncStorage.getItem(SENT_MEMES_KEY);
    let sentMemes = sentMemesJson ? JSON.parse(sentMemesJson) : [];

    // If all memes have been sent, reset the sent list but keep the last one
    // to avoid immediate repetition
    if (sentMemes.length >= MEMES.length - 1) {
      sentMemes = lastMemeText ? [MEMES.indexOf(lastMemeText)] : [];
      await AsyncStorage.setItem(SENT_MEMES_KEY, JSON.stringify(sentMemes));
    }

    // Get available memes (ones that haven't been sent)
    const availableMemes = MEMES.filter((meme, index) => !sentMemes.includes(index));
    
    // Pick a random meme from available ones
    const randomIndex = Math.floor(Math.random() * availableMemes.length);
    const memeText = availableMemes[randomIndex];
    
    // Find the actual index in the original array
    const originalIndex = MEMES.indexOf(memeText);
    
    // Save this as the last sent meme
    await AsyncStorage.setItem(LAST_MEME_KEY, memeText);
    
    // Add this meme to the sent list
    sentMemes.push(originalIndex);
    await AsyncStorage.setItem(SENT_MEMES_KEY, JSON.stringify(sentMemes));
    
    return memeText;
  } catch (error) {
    console.error('Error getting random meme:', error);
    // Fallback: just return a random meme without tracking
    const randomIndex = Math.floor(Math.random() * MEMES.length);
    return MEMES[randomIndex];
  }
};

// Add emoji to meme text to make it more visually appealing
const enhanceMemeText = (memeText) => {
  const emojis = ['😅', '😂', '🤣', '😄', '📚', '✏️', '🧠', '💭', '⏰', '💡', '🎓', '📝'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  return `${randomEmoji} ${memeText}`;
};

// Schedule a daily meme notification
const scheduleDailyMemeNotification = async () => {
  try {
    // Get a random meme
    const memeText = await getRandomMeme();
    
    if (!memeText || memeText.trim() === '') {
      console.warn('Empty meme text, skipping notification');
      return null;
    }
    
    const enhancedMemeText = enhanceMemeText(memeText);

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'memes',
      name: 'Daily Memes',
      description: 'Daily study memes to brighten your day',
      importance: AndroidImportance.HIGH,
      vibration: true,
      vibrationPattern: [300, 500, 300, 500],
      lights: true,
      lightColor: AndroidColor.YELLOW,
      sound: 'meme_notification', // Make sure this sound file exists in android/app/src/main/res/raw/
    });

    // Set trigger for 10 AM daily
    const date = new Date();
    date.setHours(10, 0, 0, 0); // Set to 10:00 AM

    // If it's already past 10 AM today, schedule for tomorrow
    if (date.getTime() < Date.now()) {
      date.setDate(date.getDate() + 1); // Move to tomorrow
    }

    // Generate a unique ID
    const notificationId = `meme-${Date.now()}`;

    // Create the notification
    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: '✍️ Study Break Meme!',
        body: enhancedMemeText,
        data: {
          type: 'meme',
          timestamp: Date.now(),
          text: memeText,
        },
        android: {
          channelId,
          smallIcon: 'ic_notification',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          style: {
            type: AndroidStyle.BIGTEXT,
            text: enhancedMemeText,
          },
          showTimestamp: true,
          color: '#FFD700', // Gold color for meme notifications
          actions: [
            {
              title: '🔔 Remind Later',
              pressAction: {
                id: 'remind-later',
              },
            },
            {
              title: '📲 Share',
              pressAction: {
                id: 'share',
              },
            },
          ],
          autoCancel: true,
          sound: 'meme_notification',
        },
        ios: {
          sound: 'meme.wav', // Make sure this file exists in your iOS project
          badgeCount: 1,
          categoryId: 'meme',
          foregroundPresentationOptions: {
            badge: true,
            sound: true,
            banner: true,
            list: true,
          },
          attachments: [{
            url: 'asset://meme_icon.png', // Make sure this image exists in your iOS project
            thumbnailHidden: false,
          }],
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: date.getTime(),
        repeats: true,
        alarmManager: {
          allowWhileIdle: true,
        },
      },
    );

    return notificationId;
  } catch (error) {
    console.error('Error scheduling meme notification:', error);
    throw error;
  }
};

// For testing: Send an immediate meme notification
const sendImmediateMemeNotification = async () => {
  try {
    // Get a random meme that hasn't been sent recently
    const memeText = await getRandomMeme();
    
    if (!memeText || memeText.trim() === '') {
      console.warn('Empty meme text, skipping notification');
      return null;
    }
    
    const enhancedMemeText = enhanceMemeText(memeText);

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'memes',
      name: 'Daily Memes',
      description: 'Daily study memes to brighten your day',
      importance: AndroidImportance.HIGH,
      vibration: true,
      vibrationPattern: [300, 500, 300, 500],
      lights: true,
      lightColor: AndroidColor.YELLOW,
      sound: 'meme_notification', // Make sure this sound file exists
    });

    // Generate a unique ID
    const notificationId = `immediate-meme-${Date.now()}`;

    // Display the notification immediately
    await notifee.displayNotification({
      id: notificationId,
      title: '✍️ Study Break Meme!',
      body: enhancedMemeText,
      data: {
        type: 'meme',
        timestamp: Date.now(),
        text: memeText,
      },
      android: {
        channelId,
        smallIcon: 'ic_notification',
        importance: AndroidImportance.HIGH,
        pressAction: {
          id: 'default',
        },
        style: {
          type: AndroidStyle.BIGTEXT,
          text: enhancedMemeText,
        },
        showTimestamp: true,
        color: '#FFD700', // Gold color
        actions: [
          {
            title: '📲 Share',
            pressAction: {
              id: 'share',
            },
          },
          {
            title: '👍 Thanks!',
            pressAction: {
              id: 'dismiss',
            },
          },
        ],
        autoCancel: true,
        sound: 'meme_notification',
      },
      ios: {
        sound: 'meme.wav',
        badgeCount: 1,
        categoryId: 'meme',
        foregroundPresentationOptions: {
          badge: true,
          sound: true,
          banner: true,
        },
        attachments: [{
          url: 'asset://meme_icon.png',
          thumbnailHidden: false,
        }],
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error sending immediate meme notification:', error);
    throw error;
  }
};

// Schedule a "remind later" notification for 1 hour from now
const scheduleRemindLaterMeme = async (originalMemeText) => {
  try {
    if (!originalMemeText || originalMemeText.trim() === '') {
      console.warn('Empty meme text for remind later, skipping');
      return null;
    }
    
    // Create a channel
    const channelId = await notifee.createChannel({
      id: 'memes',
      name: 'Daily Memes',
      description: 'Daily study memes to brighten your day',
      importance: AndroidImportance.HIGH,
      sound: 'meme_notification',
    });
    
    // Set trigger for 1 hour from now
    const triggerTimestamp = Date.now() + (1 * 60 * 60 * 1000);
    
    // Generate a unique ID
    const notificationId = `remind-meme-${Date.now()}`;
    
    // Create the notification
    await notifee.createTriggerNotification(
      {
        id: notificationId,
        title: '⏰ Your Reminder: Study Break!',
        body: enhanceMemeText(originalMemeText),
        data: {
          type: 'meme',
          timestamp: Date.now(),
          text: originalMemeText,
        },
        android: {
          channelId,
          smallIcon: 'ic_notification',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
          style: {
            type: AndroidStyle.BIGTEXT,
            text: enhanceMemeText(originalMemeText),
          },
          sound: 'meme_notification',
        },
        ios: {
          sound: 'meme.wav',
          badgeCount: 1,
        },
      },
      {
        type: TriggerType.TIMESTAMP,
        timestamp: triggerTimestamp,
        alarmManager: {
          allowWhileIdle: true,
        },
      },
    );
    
    return notificationId;
  } catch (error) {
    console.error('Error scheduling remind later meme:', error);
    return null;
  }
};

// Initialize meme notifications system
const initializeMemeNotifications = async () => {
  try {
    // Clear any existing daily meme notifications
    await notifee.cancelTriggerNotification('daily-meme');
    
    // List all scheduled notifications
    const scheduledNotifications = await notifee.getTriggerNotifications();
    const memeNotifications = scheduledNotifications.filter(
      notification => notification.notification.data?.type === 'meme'
    );
    
    // Cancel all existing meme notifications
    for (const notification of memeNotifications) {
      await notifee.cancelTriggerNotification(notification.notification.id);
    }
    
    // This will schedule the daily meme notification
    await scheduleDailyMemeNotification();
    
    // Also send an immediate meme notification for testing
    await sendImmediateMemeNotification();
    
    return true;
  } catch (error) {
    console.error('Error initializing meme notifications:', error);
    return false;
  }
};

// Handler for share action
const handleShareMeme = async (memeText) => {
  try {
    if (!memeText) return;
    
    // This requires react-native-share to be installed
    import('react-native-share').then((Share) => {
      const shareOptions = {
        message: `Study Break Meme: ${memeText} #StudyBreak #StudentLife`,
        title: 'Share this Study Meme',
      };
      Share.default.open(shareOptions);
    }).catch((err) => {
      console.error('Error importing Share module:', err);
    });
  } catch (error) {
    console.error('Error sharing meme:', error);
  }
};

// Handle notification actions
const handleMemeNotificationAction = async (actionId, notification) => {
  const memeText = notification?.data?.text;
  
  if (actionId === 'share' && memeText) {
    await handleShareMeme(memeText);
  } else if (actionId === 'remind-later' && memeText) {
    await scheduleRemindLaterMeme(memeText);
  }
};

export {
  scheduleDailyMemeNotification,
  sendImmediateMemeNotification,
  initializeMemeNotifications,
  handleShareMeme,
  handleMemeNotificationAction,
  scheduleRemindLaterMeme
};