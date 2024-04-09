<template>
<div>
    <h2>My Chores</h2>
    
    <ChoresCardList :chores="myChores" :currentUser="currentUser" />
    
    <h2>Deductive Chores</h2>

    <ChoresCardList :chores="deductiveChores" :currentUser="currentUser" />

    <h2>Mutual Unfinished Chores</h2>
    
    <ChoresCardList :chores="unfinishedUnassignedChores" :currentUser="currentUser" />
    
    <h2>All Others' Unfinished Chores</h2>
    
    <ChoresCardList :chores="foreignUnfinishedChores" :currentUser="currentUser" />
</div>
</template>

<script>
// Firebase imports
import db from '../firebaseInit.js'
import { collection, getDocs, getDoc, query, onSnapshot } from 'firebase/firestore'

// Style imports
import ChoresCardList from "../components/ChoresCardList.vue";

export default {
    props: [ 'currentUser' ],
    components: { ChoresCardList },
    data() {
        return {
            chores: [],
            dummyChores: {
                myChores: new Array(3),
                deductiveChores: new Array(2),
                unfinishedUnassignedChores: new Array(1),
                foreignUnfinishedChores: new Array(2)
            }
        }
    },
    computed: {
        myChores() {
            return this.chores.filter(chore => chore.assignee?.uid === this.currentUser.uid)
        },
        deductiveChores() {
            return this.chores.filter(chore => {
                return !chore.frequency
            })
        },
        unfinishedUnassignedChores() {
            return this.chores.filter(chore => {
                return !chore.assignee && !this.isDone(chore) && chore.frequency
            })
        },
        foreignUnfinishedChores() {
            return this.chores.filter(chore => {
                const isSomeoneElses = chore.assignee?.uid !== this.currentUser.uid
                return chore.assignee && isSomeoneElses && !this.isDone(chore) && chore.frequency
            })
        }
    },
    methods: {
        async getAllChores() {
            const q = query(collection(db, "chores"))
            
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                this.chores = [];
                querySnapshot.forEach((firestoreDoc) => {
                    let chore = {
                        id: firestoreDoc.id,
                        name: firestoreDoc.data().name || firestoreDoc.id,
                    }

                    // Handle last done date
                    if (firestoreDoc.data().last_done) {
                        chore.last_done = firestoreDoc.data().last_done.toDate()
                    }

                    // Handle frequency
                    if (firestoreDoc.data().frequency) {
                        chore.frequency = firestoreDoc.data().frequency
                    }

                    // Handle categories
                    if (firestoreDoc.data().categories) {
                        chore.categories = firestoreDoc.data().categories
                    }

                    this.chores.push(chore)

                    // Handle assigned user reference
                    if (firestoreDoc.data().assignee) {
                        getDoc(firestoreDoc.data().assignee).then(docSnap => {
                            if (docSnap.exists()) {
                                let assignee = {
                                    id: docSnap.id,
                                    name: docSnap.data().name,
                                    uid: docSnap.data().uid,
                                    image: docSnap.data().image || null
                                }

                                this.chores.map(ch => ch.id === firestoreDoc.id ? ch.assignee = assignee : ch)
                            } else console.log('ERROR HomeView created assignee-fetch')
                        })
                    }
                })

            });
        },
        isDone(chore) {
            if (!chore.last_done) {
                return false    
            }
            
            const today = new Date()

            const diffTime = Math.abs(today - chore.last_done)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            
            switch (chore.frequency) {
                case 'daily':
                    return diffDays <= 1
                case 'weekly':
                    return diffDays <= 7
                case 'fortnightly':
                    return diffDays <= 14
                default:
                    return undefined
            }
        }
    },
    async created() {
        await this.getAllChores()
    }
}
</script>