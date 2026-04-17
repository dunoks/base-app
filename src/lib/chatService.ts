import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp, 
  doc, 
  updateDoc,
  onSnapshot,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export interface ChatThread {
  id: string;
  userId: string;
  title: string;
  createdAt: any;
  lastModifiedAt: any;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  text: string;
  timestamp: any;
}

export async function createConversation(userId: string, firstMessage: string) {
  const path = 'conversations';
  try {
    const docRef = await addDoc(collection(db, path), {
      userId,
      title: firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : ''),
      createdAt: serverTimestamp(),
      lastModifiedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function addMessageToConversation(conversationId: string, role: 'user' | 'model', text: string) {
  const messagesPath = `conversations/${conversationId}/messages`;
  const convPath = `conversations/${conversationId}`;
  try {
    // Add the message
    await addDoc(collection(db, messagesPath), {
      role,
      text,
      timestamp: serverTimestamp()
    });

    // Update parent conversation timestamp
    await updateDoc(doc(db, convPath), {
      lastModifiedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, messagesPath);
  }
}

export function subscribeToConversations(userId: string, callback: (threads: ChatThread[]) => void) {
  const path = 'conversations';
  const q = query(
    collection(db, path),
    where('userId', '==', userId),
    orderBy('lastModifiedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const threads = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatThread[];
    callback(threads);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}

export function subscribeToMessages(conversationId: string, callback: (messages: ChatMessage[]) => void) {
  const path = `conversations/${conversationId}/messages`;
  const q = query(
    collection(db, path),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, path);
  });
}
