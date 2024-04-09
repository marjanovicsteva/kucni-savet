<template>
    <div>
        <h1>Notifications</h1>
        
        <Card>
            <template #title>
                Latest notifications
            </template>
            
            <template #content>
                <p v-for="notification in notifications">
                    <span class="text-blue-500 mr-2" v-if="!notification.received_at">•</span>
                    <strong>{{ notification.fired_by }}</strong>
                    reminded you
                    <strong>{{ formatDate(notification.created_at) }}</strong>
                    to do
                    <strong>{{ notification.chore_id }}</strong>
                </p>
            </template>
        </Card>
    </div>
</template>

<script>
import Card from "primevue/card"

import db from '../firebaseInit.js'
import { collection, getDocs, updateDoc, getDoc, doc, where, query, onSnapshot } from 'firebase/firestore'

export default {
    props: [ 'notifications' ],
    components: { Card },
    data() {
        return {
            users: []
        }
    },
    methods: {
        async getAllUsers() {
            const querySnapshot = await getDocs(collection(db, 'users'))
            
            querySnapshot.forEach(firestoreDoc => {
                this.users.push({
                    id: firestoreDoc.id,
                    ...firestoreDoc.data()
                })
            })
            
        },
        formatDate(date) {
            date = new Date(date)
            
            const today = new Date()
            
            const diffTime = Math.abs(today - date)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            switch (diffDays) {
                case 1:
                    return 'today'
                case 2:
                    return 'yesterday'
                default:
                    return `${diffDays} days ago`
            }
        }
    },
    async mounted() {
        await this.getAllUsers()
    }
}
</script>