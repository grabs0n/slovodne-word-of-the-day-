import { initializeApp } from "firebase/app";
import { getDatabase, ref, update, set, get, push, orderByChild, equalTo, query, child, onChildChanged, onValue } from "firebase/database";
import firebaseConfig from "../consts/firebase_config.js";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const chatsRef = ref(db, 'chats');

// Export functions and references
export { db, chatsRef, update, set, get, push, orderByChild, equalTo, query, child, onChildChanged, onValue };

// Function to get chat snapshot by ID
export async function getChatSnapshotById(chatId) {
    let chatQuery = query(chatsRef, orderByChild('chatId'), equalTo(chatId));
    return get(chatQuery).then((snapshot) => {
        let chatSnapshot = null;
        snapshot.forEach((childSnapshot) => {
            chatSnapshot = childSnapshot;
            return true;
        });
        return chatSnapshot;
    });
}