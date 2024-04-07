<template>
<div class="flex items-center justify-center my-10">
    <Card>
        <template #title>
            Login
        </template>

        <template #content>
            <Message v-if="error" severity="error" :closable="false">{{ error }}</Message>

            <FloatLabel class="mt-8">
                <InputText id="email" v-model="email" type="email" class="w-full" />
                <label for="email">Email</label>
            </FloatLabel>

            <FloatLabel class="mt-8">
                <Password id="password" v-model="password" :feedback="false" toggleMask class="w-full" />
                <label for="password">Password</label>
            </FloatLabel>
        </template>

        <template #footer>
            <Button label="Login" class="w-full" @click="login" />
        </template>
    </Card>
</div>
</template>

<script>
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'

import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
export default {
    components: { Card, InputText, FloatLabel, Password, Button, Message },
    data() {
        return {
            email: '',
            password: '',
            error: ''
        }
    },
    methods: {
        login() {
            const auth = getAuth()
            signInWithEmailAndPassword(auth, this.email, this.password)
                .then(data => {
                    this.error = ''
                    this.$router.push('/')
                })
                .catch(error => {
                    console.log(error.code)
                    this.error = error.message
                })
        }
    }
}
</script>