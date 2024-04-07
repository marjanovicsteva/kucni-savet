<template>
    <div class="flex gap-4 flex-wrap">
        <ChoreCard v-for="chore in chores" :key="chore.id" :chore="chore" :currentUser="currentUser" />
    </div>
</template>

<script>
import ChoreCard from "./ChoreCard.vue"

export default {
    components: { ChoreCard },
    props: [ 'chores', 'currentUser' ]
}
</script>