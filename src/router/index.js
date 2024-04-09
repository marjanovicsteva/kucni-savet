import { createRouter, createWebHistory } from "vue-router"
import { getAuth, onAuthStateChanged } from "firebase/auth"

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('../views/HomeView.vue'),
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/notifications',
            component: () => import('../views/AlertsView.vue'),
            meta: {
                requiresAuth: true
            }
        },
        {
            path: '/login',
            component: () => import('../views/LoginView.vue')
        },
        {
            path: '/profile',
            component: () => import('../views/ProfileView.vue'),
            meta: {
                requiresAuth: true
            }
        }
    ]
})

const getCurrentUser = () => {
    return new Promise((resolve, reject) => {
        const removeListener = onAuthStateChanged(
            getAuth(),
            user => {
                removeListener()
                resolve(user)
            },
            reject
        )
    })
}

router.beforeEach(async (to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        if (await getCurrentUser()) {
            next()
        } else {
            next("/login")
        }
    } else {
        next()
    }
})

export default router