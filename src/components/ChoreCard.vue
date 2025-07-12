<script setup>
import Card from "primevue/card"
import Tag from "primevue/tag"
import Avatar from "primevue/avatar"
import AvatarGroup from "primevue/avatargroup"
import Button from "primevue/button"
import OverlayPanel from "primevue/overlaypanel"
import Dropdown from "primevue/dropdown"
import { useConfirm } from "primevue/useconfirm"
import { useToast } from "primevue/usetoast"
import { onMounted, ref } from "vue"
import { supabase } from "../../utils/supabase"
import { useAuthStore } from "../../utils/stores/auth"

const confirm = useConfirm()
const toast = useToast()
const auth = useAuthStore()

const props = defineProps([ 'chore' ])
const emit = defineEmits([ 'choreUpdate' ])

const users = ref([])
const userToAlert = ref(null)
const op = ref()

const markAsDone = chore => {
  confirm.require({
    message: 'Are you sure you want to proceed?',
    group: 'global',
    header: 'Mark as Done',
    icon: 'pi pi-exclamation-triangle',
    rejectClass: 'p-button-secondary p-button-outlined',
    rejectLabel: 'No',
    acceptLabel: 'Yes',
    accept: async () => {
      const { data, error } = await
        supabase
          .from('chores')
          .update({
            'last_done': new Date()
          })
          .eq('id', chore.id)
          .select('*, assignee:users (*), tags (name)')
          .single()

      if (error) {
        console.error("ERROR markAsDone")
        console.error(error)
        return
      }

      emit('choreUpdate', data)
    }
  });
}

const confirmAlert = (event, chore) => {
  if (chore.assignee) {
    confirm.require({
      message: `Do you want to remind ${chore.assignee.name} to finish this task?`,
      group: 'global',
      header: 'Ping inactive commune participants',
      icon: 'pi pi-bell',
      rejectClass: 'p-button-secondary p-button-outlined',
      rejectLabel: 'No',
      acceptClass: 'p-button-warning',
      acceptLabel: 'Yes',
      accept: async () => {
        await alertUser(event, chore)
      }
    });
  } else {
    op.value.toggle(event)
  }
}

const alertUser = async (event, chore) => {
  const { data, error } = await
    supabase
      .from('alerts')
      .insert({
        chore: chore.id,
        by: auth.user.id,
        for: chore.assignee?.id ?? userToAlert.value.id,
      })
      .select()

  if (error) {
    console.error('ERROR alertUser')
    console.error(error)
    return
  }

  toast.add({
      severity: 'success',
      summary: 'Pinged',
      detail: `Successfully pinged ${chore.assignee?.name ?? userToAlert.value.name}.`,
      life: 3000
  })

  userToAlert.value = null
  op.value.hide()
}

const colorIfDone = chore => {
  if (!chore.last_done) {
    return false    
  } else if (typeof chore.last_done === 'string') {
    chore.last_done = new Date(chore.last_done)
  }

  const today = new Date()

  const diffTime = Math.abs(today - chore.last_done)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  let done = false

  switch (chore.frequency) {
    case 'daily':
      done = diffDays === 1
      break
    case 'weekly':
      done = diffDays < 7
      break
    case 'fortnightly':
      done = diffDays < 14
      break
    default:
      done = diffDays === 1
  }
  
  return done ? 'text-green-500' : 'text-red-500'
}

const formatDate = date => {
  if (!date) {
    return false
  } else if (typeof date === 'string') {
    date = new Date(date)
  }

  const today = new Date()

  const diffTime = Math.abs(today - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  switch (diffDays) {
    case 1:
      return 'Today'
    case 2:
      return 'Yesterday'
    default:
      return `${diffDays} days ago`
  }
}

const getAllUsers = async () => {
  const { data, error } = await supabase.from('users').select('*')

  if (error) {
    console.error("ERROR getAllUsers")
    console.error(error)
    return
  }

  users.value = data
}

onMounted(async () => {
  if (!props.chore.assignee) {
    await getAllUsers()
  }
})
</script>

<template>
  <Card class="w-full md:w-fit flex-1 md:min-w-[33%] md:max-w-[50%] cursor-pointer hover:shadow-md" @click="markAsDone(chore)">
    <template #title>
      <div class="flex flex-row justify-between gap-4 items-center">
        <span>{{ chore.name }}</span>
        <div>
          <Avatar v-if="chore.assignee" :image="chore.assignee.image" class="mr-2" shape="circle" />
          <AvatarGroup v-else>
            <Avatar v-for="user in users" :image="user.image" shape="circle" />
          </AvatarGroup>
        </div>
      </div>
    </template>

    <template #content>
      <div class="flex flex-row justify-between gap-4 items-center">
        <span class="flex gap-1">
          <span :class="colorIfDone(chore)" v-if="chore.last_done">{{ formatDate(chore.last_done) }}</span>
          <span class="text-gray-500">{{ chore.frequency || 'deductively' }}</span>
        </span>
        <span class="flex gap-2 items-center">
          <Tag v-for="tag in chore.tags" :value="tag.name" />

          <span v-if="chore.assignee?.id !== auth.user.id">
            <Button icon="pi pi-bell" severity="warning" rounded outlined @click.stop="confirmAlert($event, chore)" />
            <OverlayPanel ref="op">
              <Dropdown v-model="userToAlert" :options="users" optionLabel="name" placeholder="Select user to alert" class="w-full md:w-14rem" />
              <Button class="mt-2 w-full" :disabled="!userToAlert" severity="warning" label="Alert" @click="alertUser($event, chore)" />
            </OverlayPanel>
          </span>
        </span>
      </div>
    </template>
  </Card>
</template>
