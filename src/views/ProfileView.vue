<template>
<div>
    <h1>Profile</h1>

    <div class="flex lg:gap-x-4 lg:items-center lg:flex-row flex-col items-center gap-y-6 justify-stretch">
        <div class="image-wrapper max-w-[150px] w-[50%] lg:w-max">
            <img :src="user.image" :alt="user.name" class="rounded-full" />
            <span class="image-overlay rounded-full cursor-pointer"  @click="visible = true">
                <i class="pi pi-pencil text-white"></i>
            </span>
        </div>
        <Card class="flex-1">
            <template #title>
                {{ user.name }}
            </template>

            <template #content>
                <span class="text-gray-500">{{ user.uid }}</span>
            </template>
        </Card>
    </div>

    <Dialog v-model:visible="visible" modal header="Upload a new image">
        <div v-if="profile" id="crop-image" class="min-w-full max-w-full lg:max-w-[500px]">
            <Cropper
                class="cropper"
                :src="profile"
                :stencil-props="{
                    handlers: {},
                    movable: false,
                    resizable: false,
                    aspectRatio: 1,
                    lines: {
                        north: false,
                        east: false,
                        south: false,
                        west: false
                    }
                }"
                :stencil-component="$options.components.CircleStencil"
                :resize-image="{
                    adjustStencil: false
                }"
                :canvas="{
                    height: 150,
                    width: 150
                }"
                image-restriction="stencil"
                ref="cropper"
            />
        </div>
        <FileUpload v-else :auto="true" mode="basic" name="demo[]" url="/api/upload" accept="image/*" customUpload @uploader="customBase64Uploader" />

        <template #footer>
            <Button label="Cancel" text severity="secondary" @click="visible = false" autofocus />
            <Button label="Save" icon="pi pi-save" severity="success" @click="onSave" autofocus />
        </template>
    </Dialog>
</div>
</template>

<script>
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button'

import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';

import db from '../firebaseInit.js'
import { collection, updateDoc, doc, where, query, onSnapshot } from 'firebase/firestore'

export default {
    components: { Card, Dialog, FileUpload, Button, Cropper, CircleStencil },
    props: [ 'currentUser' ],
    data() {
        return {
            user: {},
            visible: false,
            profile: null,
            cropper: null
        }
    },
    methods: {
        async getUser() {
            const q = query(collection(db, 'users'), where('uid', '==', this.currentUser.uid))
            
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                querySnapshot.forEach(doc => {
                    this.user = {
                        id: doc.id,
                        ...doc.data()
                    }
                })
            });
        },
        async customBase64Uploader(event) {
            const file = event.files[0]
            const reader = new FileReader()
            let blob = await fetch(file.objectURL).then((r) => r.blob()) // blob:url

            reader.readAsDataURL(blob)

            reader.onloadend = () => {
                this.profile = reader.result
                this.$forceUpdate()
            }
        },
        async onSave() {
            const result = this.$refs.cropper.getResult()

            this.visible = false
            this.profile = null

            const userRef = doc(db, 'users', this.user.id)

            await updateDoc(userRef, {
                image: result.canvas.toDataURL('image/jpeg', 0.9)
            })
            // Export cropped image
//            this.croppie.result({
//                type: 'base64',
//                circle: true,
//                size: {
//                    height: 64,
//                    width: 64
//                }
//            }).then(async data => {
//                this.visible = false
//                this.profile = null
//
//                const userRef = doc(db, 'users', this.user.id)
//
//                await updateDoc(userRef, {
//                    image: data
//                })
//            })
        }
    },
    async created() {
        await this.getUser()
    },
    updated() {
        if (this.profile) {
            try {
                // Initialize cropper

            } catch (error) {
                console.error(error)
                this.profile = null
                this.visible = false
            }
        }
    }
}
</script>

<style>
.image-wrapper {
    position: relative;
}

.image-wrapper img {
    display: block;
    object-fit: cover;
    width: 100%;
    height: auto;
}

.image-overlay {
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: .2s ease;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
}

.image-wrapper:hover .image-overlay {
    opacity: 1;
}

.cropper {
    height: 300px;
    width: 300px;
}

.vue-advanced-cropper__background, .vue-advanced-cropper__foreground {
    background-color: white;
}
</style>