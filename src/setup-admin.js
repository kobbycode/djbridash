import { auth } from './firebase.js';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const setupAdmin = async (email, password) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Admin user created successfully:', userCredential.user.email);
        alert('Admin account created: ' + userCredential.user.email);
        return true;
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        alert('Error: ' + error.message);
        return false;
    }
};

// Execute with provided credentials
setupAdmin("bookdjbridash@gmail.com", "admin123");
