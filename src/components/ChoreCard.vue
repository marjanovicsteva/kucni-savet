<template>
    <Card class="w-full md:w-fit flex-1 min-w-[33%] max-w-[50%] cursor-pointer hover:shadow-md" @click="onClick(chore)">
        <template #title>
            <div class="flex flex-row justify-between gap-4 items-center">
                <span>{{ chore.name }}</span>
                <div>
                    <Avatar v-if="chore.assignee?.image" :image="chore.assignee?.image" class="mr-2" shape="circle" />
                    <AvatarGroup v-else>
                        <Avatar v-for="image in images" :image="image" shape="circle" />
                    </AvatarGroup>
                </div>
            </div>
        </template>
    
        <template #content>
            <div class="flex flex-row justify-between gap-4 items-end">
                <span class="flex gap-1">
                    <span :class="colorIfDone(chore)" v-if="chore.last_done">{{ formatDate(chore.last_done) }}</span>
                    <span class="text-gray-500">{{ chore.frequency || 'deductively' }}</span>
                </span>
                <span class="flex gap-2" v-if="chore.categories"><Tag v-for="category in chore.categories" :value="category" /></span>
            </div>
        </template>
    </Card>
</template>

<script>
import Card from "primevue/card"
import Tag from "primevue/tag"
import Avatar from "primevue/avatar"
import AvatarGroup from "primevue/avatargroup"
import db from "../firebaseInit.js"
import { doc, updateDoc, getDocs, query, where, collection, arrayUnion, Timestamp } from "firebase/firestore"

export default {
    props: [ 'chore', 'currentUser' ],
    components: { Card, Tag, Avatar, AvatarGroup },
    data() {
        return {
            images: []
        }
    },
    methods: {
        onClick(chore) {
            this.$confirm.require({
                message: 'Are you sure you want to proceed?',
                header: 'Mark as Done',
                icon: 'pi pi-exclamation-triangle',
                rejectClass: 'p-button-secondary p-button-outlined',
                rejectLabel: 'No',
                acceptLabel: 'Yes',
                accept: async () => {
                    const choreRef = doc(db, 'chores', chore.id)
                    
                    const usersRef = collection(db, 'users')
                    const userQuery = query(usersRef, where('uid', '==', this.currentUser.uid))
                    const querySnapshot = await getDocs(userQuery);
                    let currentUserId = null
                    querySnapshot.forEach((doc) => {
                        // doc.data() is never undefined for query doc snapshots
                        currentUserId = doc.ref.path
                    });
                    
                    const currentTime = Timestamp.fromDate(new Date())
                    
                    await updateDoc(choreRef, {
                        last_done: currentTime,
                        activity: arrayUnion({
                            by: doc(db, currentUserId),
                            at: currentTime
                        })
                    })
                }
            });
        },
        colorIfDone(chore) {
            if (!chore.last_done) {
                return false    
            }

            const today = new Date()

            const diffTime = Math.abs(today - chore.last_done)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            
            let done = false

            switch (chore.frequency) {
                case 'daily':
                    done = diffDays === 1
                    break
                case 'weekly':
                    done = diffDays < 7
                    break
                case 'fortnightly':
                    done = diffDays < 14
                    break
                default:
                    done = false
            }
            
            return done ? 'text-green-500' : 'text-red-500'
        },
        formatDate(date) {
            const today = new Date()

            const diffTime = Math.abs(today - date)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

            switch (diffDays) {
                case 1:
                    return 'Today'
                case 2:
                    return 'Yesterday'
                default:
                    return `${diffDays} days ago`
            }
        },
        async getAllAvatars() {
            const querySnapshot = await getDocs(collection(db, 'users'))
            
            querySnapshot.forEach(firestoreDoc => {
                this.images.push(firestoreDoc.data().image)
            })
            
        }
    },
    async mounted() {
        await this.getAllAvatars()
    }
}
</script>