<script setup>
import ChoresCardList from "../components/ChoresCardList.vue";
import { supabase } from "../../utils/supabase";
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../utils/stores/auth";

const auth = useAuthStore()

const chores = ref([])

const sortById = (a, b) => {
  return a.id - b.id
}

const myChores = computed(() => {
  return chores.value.filter(chore => chore.assignee?.id === auth.user.id).sort(sortById)
})

const deductiveChores  = computed(() => {
  return chores.value.filter(chore => {
    return !chore.frequency
  }).sort(sortById)
})

const unfinishedUnassignedChores = computed(() => {
  return chores.value.filter(chore => {
    return !chore.assignee && !isDone(chore) && chore.frequency
  }).sort(sortById)
})

const foreignUnfinishedChores = computed(() => {
  return chores.value.filter(chore => {
    const isSomeoneElses = chore.assignee?.id !== auth.user.id
    return chore.assignee && isSomeoneElses && !isDone(chore) && chore.frequency
  }).sort(sortById)
})

const getAllChores = async () => {
  const { data } = await supabase.from('chores').select('*, assignee:users (*), tags (name)')

  chores.value = data ?? []
}

const isDone = chore => {
  if (!chore.last_done) {
    return false    
  }

  const today = new Date()

  const diffTime = Math.abs(today - chore.last_done)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  switch (chore.frequency) {
    case 'daily':
      return diffDays <= 1
    case 'weekly':
      return diffDays <= 7
    case 'fortnightly':
      return diffDays <= 14
    default:
      return undefined
  }
}

onMounted(async () => {
  await getAllChores()
})

const onChoreUpdate = chore => {
  console.log("CHORE EMIT", chore)
  chores.value = chores.value.map(c => c.id === chore.id ? chore : c)
}
</script>

<template>
<div>
  <div v-if="myChores.length">
    <h2>My Chores</h2>
    <ChoresCardList :chores="myChores" @choreUpdate="onChoreUpdate" />
  </div>
  
  <div v-if="deductiveChores.length">
    <h2>Deductive Chores</h2>
    <ChoresCardList :chores="deductiveChores" @choreUpdate="onChoreUpdate" />
  </div>

  <div v-if="unfinishedUnassignedChores.length">
    <h2>Mutual Unfinished Chores</h2>
    <ChoresCardList :chores="unfinishedUnassignedChores" @choreUpdate="onChoreUpdate" />
  </div>
  
  <div v-if="foreignUnfinishedChores.length">
    <h2>All Others' Unfinished Chores</h2>
    <ChoresCardList :chores="foreignUnfinishedChores" @choreUpdate="onChoreUpdate" />
  </div>
</div>
</template>
