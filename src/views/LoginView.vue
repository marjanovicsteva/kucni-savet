<script setup>
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import FloatLabel from 'primevue/floatlabel'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { supabase } from '../../utils/supabase'
import router from '../router'
import { onMounted, ref } from 'vue'
import { useAuthStore } from '../../utils/stores/auth'

const auth = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')

const login = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (error) {
    error.value = error
    console.log(error)
    return
  }

  // This is here instead if router.push('/') because on login the notification badge doesn't load
  // TODO fix this so the whole app works without any reloads
  location.reload()
}

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    router.push('/')
  }
})

</script>

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
