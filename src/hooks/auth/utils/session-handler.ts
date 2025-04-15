
import CryptoJS from "crypto-js";

export const createUserSession = (
  user: any, 
  profile: any, 
  userMetadata: any
) => {
  // Store user metadata directly in localStorage
  console.log("Storing user metadata in localStorage:", userMetadata);
  localStorage.setItem('user_metadata', JSON.stringify(userMetadata));

  // Also keep the encrypted session for backward compatibility
  const encryptedSession = CryptoJS.AES.encrypt(JSON.stringify({
    user: {
      ...user,
      user_metadata: userMetadata
    },
    profile: profile || {
      id: user.id,
      email: user.email,
      user_type: 'member',
      user_group: 7
    }
  }), 'secret-key').toString();
  
  localStorage.setItem('session', encryptedSession);
  
  // Log the metadata to verify it's being set correctly
  console.log("Session stored with metadata:", userMetadata);
};
