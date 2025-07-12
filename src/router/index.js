import { createRouter, createWebHistory } from "vue-router"
import { supabase } from "../../utils/supabase"

const router = createRouter({
    history: createWebHistory(import.meta.VITE_ENV === 'production' ? '/kucni-savet/' : '/'),
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

const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        return !!user
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