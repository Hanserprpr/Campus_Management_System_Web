import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/student',
    name: 'StudentLayout',
    component: () => import('@/layouts/StudentLayout.vue'),
    meta: { requiresAuth: true, identity: 2 },
    redirect: '/student/home',
    children: [
      {
        path: 'home',
        name: 'StudentHome',
        component: () => import('@/views/student/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'personal',
        name: 'StudentPersonal',
        component: () => import('@/views/common/Personal.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'schedule',
        name: 'StudentSchedule',
        component: () => import('@/views/common/Schedule.vue'),
        meta: { title: '课表查询' }
      },
      {
        path: 'course-selection',
        name: 'CourseSelection',
        component: () => import('@/views/student/CourseSelection.vue'),
        meta: { title: '选课系统' }
      },
      {
        path: 'grades',
        name: 'StudentGrades',
        component: () => import('@/views/student/Grades.vue'),
        meta: { title: '成绩查询' }
      }
    ]
  },
  {
    path: '/teacher',
    name: 'TeacherLayout',
    component: () => import('@/layouts/TeacherLayout.vue'),
    meta: { requiresAuth: true, identity: 1 },
    redirect: '/teacher/home',
    children: [
      {
        path: 'home',
        name: 'TeacherHome',
        component: () => import('@/views/teacher/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'personal',
        name: 'TeacherPersonal',
        component: () => import('@/views/common/Personal.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'schedule',
        name: 'TeacherSchedule',
        component: () => import('@/views/common/Schedule.vue'),
        meta: { title: '课表查询' }
      },
      {
        path: 'course-management',
        name: 'CourseManagement',
        component: () => import('@/views/teacher/CourseManagement.vue'),
        meta: { title: '课程管理' }
      },
      {
        path: 'score-input',
        name: 'ScoreInput',
        component: () => import('@/views/teacher/ScoreInput.vue'),
        meta: { title: '成绩录入' }
      }
    ]
  },
  {
    path: '/admin',
    name: 'AdminLayout',
    component: () => import('@/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, identity: 0 },
    redirect: '/admin/home',
    children: [
      {
        path: 'home',
        name: 'AdminHome',
        component: () => import('@/views/admin/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'personal',
        name: 'AdminPersonal',
        component: () => import('@/views/common/Personal.vue'),
        meta: { title: '个人中心' }
      },
      {
        path: 'student-management',
        name: 'StudentManagement',
        component: () => import('@/views/admin/StudentManagement.vue'),
        meta: { title: '学生管理' }
      },
      {
        path: 'teacher-management',
        name: 'TeacherManagement',
        component: () => import('@/views/admin/TeacherManagement.vue'),
        meta: { title: '教师管理' }
      },
      {
        path: 'course-management',
        name: 'AdminCourseManagement',
        component: () => import('@/views/admin/CourseManagement.vue'),
        meta: { title: '课程管理' }
      },
      {
        path: 'class-management',
        name: 'ClassManagement',
        component: () => import('@/views/admin/ClassManagement.vue'),
        meta: { title: '班级管理' }
      }
    ]
  },
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    if (!userStore.isLoggedIn) {
      // 未登录，跳转到登录页
      next('/login')
      return
    }
    
    // 检查身份权限
    if (to.meta.identity !== undefined && to.meta.identity !== userStore.identity) {
      // 权限不足，跳转到对应的首页
      switch (userStore.identity) {
        case 0:
          next('/admin')
          break
        case 1:
          next('/teacher')
          break
        case 2:
          next('/student')
          break
        default:
          next('/login')
      }
      return
    }
  }
  
  // 已登录用户访问登录页，跳转到对应的首页
  if (to.path === '/login' && userStore.isLoggedIn) {
    switch (userStore.identity) {
      case 0:
        next('/admin')
        break
      case 1:
        next('/teacher')
        break
      case 2:
        next('/student')
        break
      default:
        next()
    }
    return
  }
  
  next()
})

export default router

