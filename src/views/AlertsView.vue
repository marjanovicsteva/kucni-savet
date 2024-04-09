<template>
    <div>
        <h1>Notifications</h1>
        
        <Card>
            <template #title>
                <div class="flex justify-between">
                    <span>{{ unreadNotifications.length }} unread notifications</span>
                    <Button label="Mark All as Read" severity="info" text @click="markAllAsRead" />
                </div>
            </template>
            
            <template #content>
                <div v-if="notifications.length > 0">
                    <div v-for="notification in notifications" class="flex items-center justify-between">
                        <p>
                            <span class="text-blue-500 mr-2" v-if="!notification.received_at">•</span>

                            <span :class="{ 'font-bold': !notification.received_at }">{{ user(notification.fired_by)?.name || 'Someone' }}</span>
                            reminded you to do
                            <span :class="{ 'font-bold': !notification.received_at }">{{ chore(notification.chore_id)?.name || 'something' }}</span>.
                            <br />
                            <span class="text-gray-500">{{ formatDate(notification.created_at) }}</span>
                        </p>

                        <Button v-if="!notification.received_at" icon="pi pi-envelope" severity="info" class="shrink-0" rounded outlined aria-label="Mark as Read" @click="markAsRead(notification)" />
                    </div>
                </div>
                <div v-else>
                    <p><em>You have no notifications.</em></p>
                </div>
            </template>
        </Card>
    </div>
</template>

<script>
import Card from "primevue/card"
import Button from "primevue/button"

import db from '../firebaseInit.js'
import { collection, getDocs, updateDoc, getDoc, doc, where, query, onSnapshot, Timestamp, increment } from 'firebase/firestore'

export default {
    props: [ 'notifications', 'currentUser' ],
    components: { Card, Button },
    data() {
        return {
            users: [],
            chores: []
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
        async getAllChores() {
            const querySnapshot = await getDocs(collection(db, 'chores'))

            querySnapshot.forEach(firestoreDoc => {
                this.chores.push({
                    id: firestoreDoc.id,
                    ...firestoreDoc.data()
                })
            })
        },
        async markAsRead(alert) {
            const alertRef = doc(db, 'alerts', alert.id)

            await updateDoc(alertRef, {
                received_at: Timestamp.fromDate(new Date())
            })

            const userRef = doc(db, 'users', this.currentUser.userData.id)

            await updateDoc(userRef, {
                alerts: increment(-1)
            })

            this.$toast.add({
                severity: 'success',
                summary: 'Marked as Read',
                detail: `Successfully marked as read.`,
                life: 1000
            })
        },
        async markAllAsRead() {
            for (let alert of this.unreadNotifications) {
                this.markAsRead(alert)
            }
        },
        user(userId) {
            return this.users.find(u => `users/${u.id}` === userId)
        },
        chore(choreId) {
            return this.chores.find(c => `chores/${c.id}` === choreId)
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
    computed: {
        unreadNotifications() {
            return this.notifications.filter(n => !n.received_at)
        }
    },
    async mounted() {
        await this.getAllUsers()
        await this.getAllChores()
    }
}
</script>