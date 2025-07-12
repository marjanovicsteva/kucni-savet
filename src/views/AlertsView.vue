<script setup>
import Card from "primevue/card"
import Button from "primevue/button"
import { useToast } from "primevue/usetoast"
import { computed, onMounted, ref } from "vue"
import { supabase } from "../../utils/supabase"
import { useAuthStore } from "../../utils/stores/auth"

const auth = useAuthStore()
const toast = useToast()

const notifications = ref([])

const getAllNotifications = async () => {
  if (!auth.user) {
    return []
  }

  const { data, error } = await
    supabase
      .from('alerts')
      .select(`
        *,
        by:users!alerts_by_fkey1(name),
        chore:chores(*)
      `)
      .eq('for', auth.user.id)

  if (error) {
    console.error('ERROR getAllNotifications')
    console.error(error)
    return
  }

  notifications.value = data
}

const markAsRead = async alert => {
  const { data, error } = await supabase
    .from('alerts')
    .update({ received: new Date() })
    .eq('id', alert.id)
    .select(`
      *,
      by:users!alerts_by_fkey1(name),
      chore:chores(*)
    `)
    .single()

  if (error) {
    console.error('ERROR markAsRead')
    console.error(error)
    return
  }

  notifications.value = notifications.value.map(notification => notification.id === alert.id ? data : notification )

  toast.add({
    severity: 'success',
    summary: 'Marked as Read',
    detail: `Successfully marked as read.`,
    life: 3000
  })
}

const markAllAsRead = async () => {
  for (let alert of unreadNotifications.value) {
    await markAsRead(alert)
  }
}

const formatDate = date => {
  date = new Date(date)
            
  const today = new Date()
  
  const diffTime = Math.abs(today - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  switch (diffDays) {
    case 1:
      return 'today'
    case 2:
      return 'yesterday'
    default:
      return `${diffDays} days ago`
  }
}

const unreadNotifications = computed(() => {
  return notifications.value.filter(n => !n.received_at)
})

onMounted(async () => {
  await getAllNotifications()
})

</script>

<template>
  <div>
    <h1>Notifications</h1>
    
    <Card>
      <template #title>
        <div class="flex justify-between">
          <span>{{ unreadNotifications.length }} unread notifications</span>
          <Button label="Mark All as Read" severity="info" text @click="markAllAsRead" />
        </div>
      </template>
        
      <template #content>
        <div v-if="notifications.length > 0">
          <div v-for="notification in notifications" class="flex items-center justify-between">
            <p>
              <span class="text-blue-500 mr-2" v-if="!notification.received">•</span>

              <span :class="{ 'font-bold': !notification.received }">{{ notification.by.name || 'Someone' }}</span>
              reminded you to do
              <span :class="{ 'font-bold': !notification.received }">{{ notification.chore.name || 'something' }}</span>.
              <br />
              <span class="text-gray-500">{{ formatDate(notification.created) }}</span>
            </p>

            <Button v-if="!notification.received" icon="pi pi-envelope" severity="info" class="shrink-0" rounded outlined aria-label="Mark as Read" @click="markAsRead(notification)" />
          </div>
        </div>
        <div v-else>
          <p><em>You have no notifications.</em></p>
        </div>
      </template>
    </Card>
  </div>
</template>
