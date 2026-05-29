import Vue from 'vue'
import VueRouter from 'vue-router'
import NewTemplate from '../views/NewTemplate.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'NewTemplate',
    component: NewTemplate
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
