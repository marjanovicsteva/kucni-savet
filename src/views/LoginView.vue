<template>
<div>
    <h1>Login</h1>
    
    <p v-if="error">{{ error }}</p>
    <input type="text" placeholder="email" v-model="email">
    <input type="password" placeholder="password" v-model="password">
    <button @click="login">Login</button>
</div>
</template>

<script>
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
export default {
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
                    console.log("Successfully logged in")
                    console.log(auth.currentUser)
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