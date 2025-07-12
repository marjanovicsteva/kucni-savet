<script setup>
import Card from 'primevue/card'
import Dialog from 'primevue/dialog'
import FileUpload from 'primevue/fileupload'
import Button from 'primevue/button'

import { Cropper, CircleStencil } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import { useAuthStore } from '../../utils/stores/auth';
import { onMounted, onUpdated, ref } from 'vue';
import { supabase } from '../../utils/supabase';

const auth = useAuthStore()

const visible = ref(false)
const profile = ref(null)
const cropper = ref(null)
const user = ref(null)

const getUser = async () => {
  if (!auth.user) {
    return
  }

  const { data, error } = await supabase.from('users').select().eq('id', auth.user.id).single()

  if (error) {
    console.error("ERROR getUser")
    console.error(error)
    return
  }

  user.value = data
}

const customBase64Uploader = async event => {
  const file = event.files[0]
  const reader = new FileReader()
  let blob = await fetch(file.objectURL).then((r) => r.blob())

  reader.readAsDataURL(blob)

  reader.onloadend = () => {
    profile.value = reader.result
  }
}

const onSave = async () => {
  const result = cropper.value.getResult()

  visible.value = false
  profile.value = null

  // UPLOAD PHOTO SUPABASE
  console.log("CROPPER", result)
  const { data, error } = await supabase
    .from('users')
    .update({ image: result.canvas.toDataURL('image/jpeg', 0.9) })
    .eq('id', auth.user.id)
    .select()
    .single()

  user.value = data
}

onMounted(async () => {
  await getUser()
})

const dummyImageUrl = "https://www.dummyimage.com/150x150/000/fff&text=ADD+IMAGE"
</script>

<template>
<div>
  <h1>Profile</h1>

  <div class="flex lg:gap-x-4 lg:items-center lg:flex-row flex-col items-center gap-y-6 justify-stretch">
    <div class="image-wrapper max-w-[150px] w-[50%] lg:w-max">
      <img :src="user?.image || dummyImageUrl" :alt="user?.name" class="rounded-full" />
      <span class="image-overlay rounded-full cursor-pointer"  @click="visible = true">
        <i class="pi pi-pencil text-white"></i>
      </span>
    </div>
    <Card class="flex-1">
      <template #title>
        {{ user?.name }}
      </template>

      <template #content>
        <span class="text-gray-500">{{ user?.id }}</span>
      </template>
    </Card>
  </div>

  <Dialog v-model:visible="visible" modal header="Upload a new image">
    <div v-if="profile" id="crop-image" class="min-w-full max-w-full lg:max-w-[500px]">
      <Cropper
        class="cropper"
        :src="profile"
        :stencil-props="{
            handlers: {},
            movable: false,
            resizable: false,
            aspectRatio: 1,
            lines: {
                north: false,
                east: false,
                south: false,
                west: false
            }
        }"
        :stencil-component="CircleStencil"
        :resize-image="{
            adjustStencil: false
        }"
        :canvas="{
            height: 150,
            width: 150
        }"
        image-restriction="stencil"
        ref="cropper"
      />
    </div>
    <FileUpload v-else :auto="true" mode="basic" name="demo[]" url="/api/upload" accept="image/*" customUpload @uploader="customBase64Uploader" />

    <template #footer>
      <Button label="Cancel" text severity="secondary" @click="visible = false" autofocus />
      <Button label="Save" icon="pi pi-save" severity="success" @click="onSave" autofocus />
    </template>
  </Dialog>
</div>
</template>

<style>
.image-wrapper {
  position: relative;
}

.image-wrapper img {
  display: block;
  object-fit: cover;
  width: 100%;
  height: auto;
}

.image-overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: .2s ease;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper:hover .image-overlay {
  opacity: 1;
}

.cropper {
  height: 300px;
  width: 300px;
}

.vue-advanced-cropper__background, .vue-advanced-cropper__foreground {
  background-color: white;
}
</style>