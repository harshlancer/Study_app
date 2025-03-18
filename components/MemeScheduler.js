import notifee, { AndroidStyle, EventType, TriggerType, RepeatFrequency, AndroidImportance, AndroidVisibility, AndroidColor } from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Meme data
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

// Track which memes have been sent to avoid repeats until all are used
const STORAGE_KEY = 'sent_memes_index';

// Get a random meme that hasn't been sent recently
const getRandomMeme = async () => {
  try {
    // Get the list of already sent meme indices
    const sentMemesJson = await AsyncStorage.getItem(STORAGE_KEY);
    let sentMemes = sentMemesJson ? JSON.parse(sentMemesJson) : [];

    // If all memes have been sent, reset the sent list
    if (sentMemes.length >= MEMES.length) {
      sentMemes = [];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sentMemes));
      console.log('Reset meme tracking - all memes have been used');
    }

    // Get available memes (ones that haven't been sent)
    const availableMemes = MEMES.filter((_, index) => !sentMemes.includes(index));
    
    // Pick a random meme from available ones
    const randomIndex = Math.floor(Math.random() * availableMemes.length);
    const memeText = availableMemes[randomIndex];
    
    // Find the actual index in the original array
    const originalIndex = MEMES.indexOf(memeText);
    
    // Add this meme to the sent list
    sentMemes.push(originalIndex);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sentMemes));
    
    console.log(`Selected meme ${originalIndex + 1}/${MEMES.length}: ${memeText.substring(0, 30)}...`);
    return memeText;
  } catch (error) {
    console.error('Error getting random meme:', error);
    // Fallback: just return a random meme without tracking
    const randomIndex = Math.floor(Math.random() * MEMES.length);
    return MEMES[randomIndex];
  }
};

// Schedule a daily meme notification
const scheduleDailyMemeNotification = async () => {
  try {
    // Get a random meme
    const memeText = await getRandomMeme();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'memes',
      name: 'Daily Memes',
      description: 'Daily study memes to brighten your day',
      importance: AndroidImportance.HIGH,
      vibration: true,
      vibrationPattern: [300, 500],
      lights: true,
      lightColor: AndroidColor.YELLOW,
    });

    // Set trigger for 10 AM daily
    const date = new Date();
    date.setHours(10, 0, 0, 0); // Set to 10:00 AM

    // If it's already past 10 AM today, schedule for tomorrow
    if (date.getTime() < Date.now()) {
      date.setDate(date.getDate() + 1); // Move to tomorrow
    }

    const trigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(), // Trigger at 10 AM
      repeatFrequency: RepeatFrequency.DAILY, // Repeat daily
      alarmManager: true, // Use AlarmManager for precise timing (Android only)
    };

    // Create the notification
    const notificationId = await notifee.createTriggerNotification(
      {
        id: 'daily-meme',
        title: 'Study Break ✍️',
        body: memeText,
        data: {
          type: 'meme',
          deepLink: 'editorial://currentaffairs',
          timestamp: Date.now(),
        },
        android: {
          channelId,
          smallIcon: 'ic_notification', // Use your app icon
          largeIcon: "ic_launcher",
          color: '#4655F5FF', // Amber color for meme notifications
          pressAction: {
            id: 'default',
            launchActivity: '.MainActivity',
          },
          style: {
            type: AndroidStyle.BIGTEXT,
            text: memeText,
          },
          showTimestamp: true,
          actions: [
            {
              title: 'Share',
              pressAction: {
                id: 'share',
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
          categoryId: 'currentAffairs',
          sound: 'default',
          badgeCount: 1,
          categoryId: 'meme-category',
        },
      },
      trigger,
    );

    console.log('Daily meme notification scheduled for 10 AM');
    return notificationId;
  } catch (error) {
    console.error('Error scheduling meme notification:', error);
    throw error;
  }
};
// For testing: Send an immediate meme notification
const sendImmediateMemeNotification = async () => {
  try {
    // Get a random meme
    const memeText = await getRandomMeme();

    // Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'memes',
      name: 'Daily Memes',
      description: 'Daily study memes to brighten your day',
      importance: AndroidImportance.HIGH,
      vibration: true,
      vibrationPattern: [300, 500],
      lights: true,
      lightColor: AndroidColor.YELLOW,
    });

    // Display the notification immediately
    await notifee.displayNotification({
      id: 'immediate-meme',
      title: 'Study Break ✍️',
      body: memeText,
      data: {
        type: 'meme',
        deepLink: 'editorial://currentaffairs',
        timestamp: Date.now(),
      },
      android: {
        channelId,
        smallIcon: 'ic_notification',
        largeIcon: "ic_launcher",
        color: '#FFC107',
        pressAction: {
          id: 'default',
          launchActivity: '.MainActivity',
        },
        style: {
          type: AndroidStyle.BIGTEXT,
          text: memeText,
        },
        showTimestamp: true,
        actions: [
          {
            title: 'Share',
            pressAction: {
              id: 'share',
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
        categoryId: 'currentAffairs',
        sound: 'default',
        badgeCount: 1,
        categoryId: 'meme-category',
      },
    });

    console.log('Immediate meme notification sent');
    return 'immediate-meme';
  } catch (error) {
    console.error('Error sending immediate meme notification:', error);
    throw error;
  }
};

// Initialize meme notifications system
const initializeMemeNotifications = async () => {
  try {
    // Clear any existing daily meme notifications
    await notifee.cancelTriggerNotification('daily-meme');
    
    // This will schedule the daily meme notification
    await scheduleDailyMemeNotification();
    console.log('Meme notifications initialized');
    return true;
  } catch (error) {
    console.error('Error initializing meme notifications:', error);
    return false;
  }
};

// Handler for share action
const handleShareMeme = async (memeText) => {
  try {
    // This requires react-native-share to be installed
    import('react-native-share').then((Share) => {
      const shareOptions = {
        message: memeText,
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

export {
  scheduleDailyMemeNotification,
  sendImmediateMemeNotification,
  initializeMemeNotifications,
  handleShareMeme
};