<template>
  <div class="card">
    <Menubar :model="menuItems" class="flex justify-between items-center">
      <template #start>
        <img src="@/assets/kso.svg" height="40" alt="">
      </template>
      
      <template #item="{ item, props }">
        <RouterLink v-if="!!currentUser === !!item.requiresAuth && item.route" :to="item.route" v-slot="{ href, navigate }" custom>
          <a :href="href" v-bind="props.action" @click="navigate" class="flex align-items-center">
            <i v-if="item.icon" class="mr-2" :class="item.icon"></i>
            {{ item.label }}
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
    <RouterView :currentUser="currentUser" />
  </main>
  
  <Toast />
  <ConfirmDialog />
  
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
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'

export default {
  components: { RouterView, RouterLink, Menubar, Toast, ConfirmDialog },
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
      currentUser: null
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
    }
  },
  mounted() {
    const auth = getAuth()
    onAuthStateChanged(auth, user => {
      this.currentUser = user
    })
  }
}
</script>

<style scoped>

</style>
