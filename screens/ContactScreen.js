import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  ActivityIndicator 
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

const ContactScreen = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [inputFocus, setInputFocus] = useState(null);
  
  // Animations
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleSendEmail = async () => {
    if (!name || !email || !message) {
      // Animated validation error
      animateShake();
      return;
    }

    setSending(true);
    
    const data = {
      name,
      email,
      message,
    };

    try {
      const response = await fetch('https://formspree.io/f/xwkgrbjl', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });

      setSending(false);
      
      if (response.ok) {
        animateSuccess();
        setName('');
        setEmail('');
        setMessage('');
      } else {
        animateError();
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setSending(false);
      animateError();
    }
  };
  
  // Animation functions
  const animateShake = () => {
    const shakeAnimation = new Animated.Value(0);
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };
  
  const animateSuccess = () => {
    const pulseAnim = new Animated.Value(1);
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.1, duration: 200, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true })
    ]).start();
  };
  
  const animateError = () => {
    // Implement error animation if needed
  };

  const getInputStyle = (inputName) => {
    return [
      styles.input,
      inputFocus === inputName ? styles.inputFocused : null,
    ];
  };

  return (
    <LinearGradient
      colors={['#121438', '#2A1B5D', '#121438']}
      style={styles.container}
    >
      <Animated.View 
        style={[
          styles.formContainer,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerContainer}>
          <Icon name="satellite-uplink" size={40} color="#8A85FF" style={styles.headerIcon} />
          <Text style={styles.title}>Neural Connect</Text>
          <Text style={styles.subtitle}>Send signal to our central intelligence</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <Icon name="account-outline" size={20} color="#8A85FF" style={styles.inputIcon} />
          <TextInput
            placeholder="Your identifier"
            placeholderTextColor="#6D6A8A"
            value={name}
            onChangeText={text => setName(text)}
            onFocus={() => setInputFocus('name')}
            onBlur={() => setInputFocus(null)}
            style={getInputStyle('name')}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Icon name="at" size={20} color="#8A85FF" style={styles.inputIcon} />
          <TextInput
            placeholder="Neural address"
            placeholderTextColor="#6D6A8A"
            value={email}
            onChangeText={text => setEmail(text)}
            onFocus={() => setInputFocus('email')}
            onBlur={() => setInputFocus(null)}
            style={getInputStyle('email')}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Icon name="message-text-outline" size={20} color="#8A85FF" style={styles.inputIcon} />
          <TextInput
            placeholder="Transmit your message"
            placeholderTextColor="#6D6A8A"
            value={message}
            onChangeText={text => setMessage(text)}
            multiline
            numberOfLines={4}
            onFocus={() => setInputFocus('message')}
            onBlur={() => setInputFocus(null)}
            style={[getInputStyle('message'), styles.messageInput]}
          />
        </View>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleSendEmail}
          disabled={sending}
        >
          <LinearGradient
            colors={['#5B4CFF', '#8A72FF']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.buttonGradient}
          >
            {sending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.buttonText}>Transmit</Text>
                <Icon name="send" size={18} color="#FFFFFF" style={styles.buttonIcon} />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        <View style={styles.altContactMethods}>
          <TouchableOpacity style={styles.altContactButton}>
            <Icon name="phone" size={22} color="#8A85FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.altContactButton}>
            <Icon name="video" size={22} color="#8A85FF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.altContactButton}>
            <Icon name="map-marker" size={22} color="#8A85FF" />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* Dynamic background element */}
      <View style={styles.glowCircle} />
      <View style={styles.gridOverlay} />
    </LinearGradient>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  formContainer: {
    backgroundColor: 'rgba(20, 20, 45, 0.8)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(138, 133, 255, 0.3)',
    shadowColor: '#8A85FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 5,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  headerIcon: {
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#6D6A8A',
    textAlign: 'center',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 60, 0.6)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingLeft: 45,
    paddingRight: 15,
    color: '#FFFFFF',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(138, 133, 255, 0.2)',
  },
  inputFocused: {
    borderColor: '#8A85FF',
    shadowColor: '#8A85FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  button: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#5B4CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    marginLeft: 4,
  },
  altContactMethods: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  altContactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 30, 60, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(138, 133, 255, 0.3)',
  },
  glowCircle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    backgroundColor: 'rgba(91, 76, 255, 0.03)',
    top: -width * 0.5,
    right: -width * 0.5,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#8A85FF',
  },
});

export default ContactScreen;