<template>
  <div class="card">
    <Menubar :model="menuItems" class="flex justify-between items-center">
      <template #start>
        <img src="@/assets/kso.svg" height="40" alt="">
      </template>
      
      <template #item="{ item, props, root }">
        <RouterLink v-if="!!currentUser === !!item.requiresAuth && item.route" :to="item.route" v-slot="{ href, navigate }" custom>
          <a :href="href" v-bind="props.action" @click="navigate" class="flex align-items-center">
            <i v-if="item.icon" class="mr-2" :class="item.icon"></i>
            <span class="">{{ item.label }}</span>
            <Badge v-if="item.badge" :class="{ 'ml-auto': !root, 'ml-2': root }" :value="item.badge" />
          </a>
        </RouterLink>
        <a href="#!" v-else-if="!!currentUser === !!item.requiresAuth && item.action" @click="item.action" class="flex align-items-center" v-bind="props.action">
          <i v-if="item.icon" class="mr-2" :class="item.icon"></i>
          {{ item.label }}
        </a>
      </template>
    </Menubar>
  </div>
  
  <main class="w-full lg:w-4/5 xl:w-3/5 lg:mx-auto mt-12 px-3">
    <RouterView :currentUser="currentUser" :notifications="notifications" />
  </main>
  
  <Toast />
  <ConfirmDialog group="global" />
  
  <footer>
    <div class="w-full flex items-center justify-center p-4 text-gray-500 mt-8">
      2024
      &copy;&nbsp;
      <a class="no-underline text-gray-500" href="https://github.com/marjanovicsteva">Stevan Marjanovic</a>
    </div>
  </footer>
</template>

<script>
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth"
import { RouterView, RouterLink } from "vue-router"
import Menubar from "primevue/menubar"
import Badge from "primevue/badge"
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

import db from './firebaseInit.js'
import { collection, getDocs, updateDoc, getDoc, doc, where, query, onSnapshot } from 'firebase/firestore'

export default {
  components: { RouterView, RouterLink, Menubar, Toast, ConfirmDialog, Badge },
  data() {
    return {
      menuItems: [
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
            this.handleSignOut()
          },
          requiresAuth: true
        }
      ],
      currentUser: null,
      userData: null,
      notifications: []
    }
  },
  methods: {
    handleSignOut() {
      const auth = getAuth()
      signOut(auth).then(() => {
        this.$router.push('/login')
      }).catch((error) => {
        console.log(error)
      })
    },
    async getAllNotifications() {
      const q = query(collection(db, 'alerts'))

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        querySnapshot.forEach(doc => {
          this.notifications.push({
            id: doc.id,
            fired_by: doc.data().fired_by.path,
            user_id: doc.data().user_id.path,
            chore_id: doc.data().chore_id.path,
            received_at: doc.data().received_at?.toDate(),
            created_at: doc.data().created_at?.toDate()
          })
        })
      });
    }
  },
  mounted() {
    const auth = getAuth()
    onAuthStateChanged(auth, user => {
      this.currentUser = user

      const usersRef = collection(db, 'users')
      const q = query(usersRef, where('uid', '==', user.uid))
      const querySnapshot = getDocs(q).then(querySnapshot => {
        querySnapshot.forEach(doc => {
          this.currentUser.userData = doc.data()
        })
        this.menuItems.find(item => item.route === '/notifications').badge = this.currentUser.userData.alerts
      })

      if (user) {
        this.getAllNotifications()
      }
    })
  }
}
</script>

<style scoped>

</style>
