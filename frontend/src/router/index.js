import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import RequesterDashboard from '@/views/RequesterDashboard.vue'
import ValidatorDashboard from '@/views/ValidatorDashboard.vue'
import UserManagement from '@/views/UserManagement.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: {
            title: 'Vacation Management System'
        }
    },
    {
        path: '/requester',
        name: 'RequesterDashboard',
        component: RequesterDashboard,
        meta: {
            title: 'My Vacation Requests',
            role: 'requester'
        }
    },
    {
        path: '/requester/:userId',
        name: 'RequesterDashboardWithUser',
        component: RequesterDashboard,
        props: true,
        meta: {
            title: 'My Vacation Requests',
            role: 'requester'
        }
    },
    {
        path: '/validator',
        name: 'ValidatorDashboard',
        component: ValidatorDashboard,
        meta: {
            title: 'Manage Vacation Requests',
            role: 'validator'
        }
    },
    {
        path: '/validator/:validatorId',
        name: 'ValidatorDashboardWithUser',
        component: ValidatorDashboard,
        props: true,
        meta: {
            title: 'Manage Vacation Requests',
            role: 'validator'
        }
    },
    {
        path: '/users',
        name: 'UserManagement',
        component: UserManagement,
        meta: {
            title: 'User Management',
            role: 'admin'
        }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/views/NotFound.vue'),
        meta: {
            title: 'Page Not Found'
        }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
            return savedPosition
        } else {
            return { top: 0 }
        }
    }
})

// Navigation guards
router.beforeEach((to, from, next) => {
    // Update document title
    if (to.meta.title) {
        document.title = `${to.meta.title} | Vacation Management`
    }

    next()
})

export default router