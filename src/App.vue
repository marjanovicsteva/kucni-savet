<script setup>
import { RouterView, RouterLink } from "vue-router"
import Menubar from "primevue/menubar"
import Badge from "primevue/badge"
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

import { supabase } from '../utils/supabase'
import router from "./router"
import { onMounted, ref } from "vue"
import { useAuthStore } from "../utils/stores/auth"

const auth = useAuthStore()

const menuItems = ref([
  {
    label: 'Home',
    route: '/',
    icon: 'pi pi-home',
    requiresAuth: true
  },
  {
    label: 'Notifications',
    route: '/notifications',
    icon: 'pi pi-bell',
    requiresAuth: true
  },
  {
    label: 'Profile',
    route: '/profile',
    icon: 'pi pi-user',
    requiresAuth: true
  },
  {
    label: 'Login',
    route: '/login',
    icon: 'pi pi-lock'
  },
  {
    label: 'Sign out',
    icon: 'pi pi-power-off',
    action: () => {
      handleSignOut()
    },
    requiresAuth: true
  }
])

const unreadNotifications = ref(0)

const handleSignOut = async () => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error(error)
    return
  }

  auth.$patch({
    user: null
  })
  router.push('/login')
}

const getNotifications = async () => {
  if (!auth.user) {
    unreadNotifications.value = 0
    return
  }

  const { count, error } = await supabase.from('alerts').select('*', { count: 'exact', head: true }).eq('for', auth.user.id).is('received', null)

  if (error) {
    console.error("ERROR getNotifications")
    console.error(error)
    return
  }

  unreadNotifications.value = count
}

onMounted(async () => {
  const { data } = await supabase.auth.getUser()

  auth.$patch({
    user: data.user
  })
  
  if (auth.user === null) {
    router.push("/login")
  } else {
    await getNotifications()
    menuItems.value.find(item => item.route === '/notifications').badge = unreadNotifications.value

    // Subscripbe to notification changes
    const channels = supabase.channel('alert-channel')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'alerts' },
        async (payload) => {
          console.log("UPDATE", payload)
          await getNotifications()
          menuItems.value.find(item => item.route === '/notifications').badge = unreadNotifications.value
        }
      )
      .subscribe()
  }
})
</script>

<template>
  <div class="flex flex-col justify-between min-h-screen">
    <div>
      <div class="card m-2">
        <Menubar :model="menuItems" class="flex justify-between items-center">
          <template #start>
            <img src="@/assets/kso.svg" height="40" alt="">
          </template>
          
          <template #item="{ item, props, root }">
            <RouterLink v-if="!!auth.user === !!item.requiresAuth && item.route" :to="item.route" v-slot="{ href, navigate }" custom>
              <a :href="href" v-bind="props.action" @click="navigate" class="flex align-items-center">
                <i v-if="item.icon" class="mr-2" :class="item.icon"></i>
                <span class="">{{ item.label }}</span>
                <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
              </a>
            </RouterLink>
            <a href="#!" v-else-if="!!auth.user === !!item.requiresAuth && item.action" @click="item.action" class="flex align-items-center" v-bind="props.action">
              <i v-if="item.icon" class="mr-2" :class="item.icon"></i>
              {{ item.label }}
            </a>
          </template>
        </Menubar>
      </div>

      <main class="w-full lg:w-4/5 xl:w-3/5 lg:mx-auto mt-12 px-3">
        <RouterView />
      </main>
    </div>
    
    <footer>
      <div class="w-full flex items-center justify-center p-4 text-gray-500 mt-8">
        2024
        &copy;&nbsp;
        <a class="no-underline text-gray-500" href="https://github.com/marjanovicsteva">Stevan Marjanovic</a>
      </div>
    </footer>
  </div>

  <Toast />
  <ConfirmDialog group="global" />
</template>
