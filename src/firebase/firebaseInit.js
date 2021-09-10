import {initializeApp} from "firebase/app";
import {getFirestore,collection,query} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC_MvFEtFH4TW8wORgYMw_HLmIGlYsMY0c",
  authDomain: "invoice-app-learning.firebaseapp.com",
  projectId: "invoice-app-learning",
  storageBucket: "invoice-app-learning.appspot.com",
  messagingSenderId: "530207370617",
  appId: "1:530207370617:web:01fca603e17fcbc83ad3a8"
};

  // Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig)
export const db = getFirestore(firebaseApp)
export const invoicesCollection = query(collection(db,'invoices'))

// export const invoiceCollection = addDoc(collection(db,'invoices'))










