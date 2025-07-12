<script setup>
import ChoreCard from "./ChoreCard.vue"

defineProps([ 'chores' ])
</script>

<template>
    <div class="flex gap-4 flex-wrap">
        <ChoreCard v-for="chore in chores" :key="chore.id" :chore="chore" @choreUpdate="$emit('choreUpdate', $event)" />
    </div>
</template>