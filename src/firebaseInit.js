import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import firebaseConfig from './firebaseConfig'

const firebaseApp = initializeApp(firebaseConfig)

export default getFirestore(firebaseApp)