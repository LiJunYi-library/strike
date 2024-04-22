<template>
  <div class="curd">
    <template v-for="(item, index) in props.modelValue ?? []" :key="index">
      <div class="curd-item">
        <slot :item="item" :index="index"></slot>
        <el-icon
          class="pTB10 pL10"
          size="20"
          @click="remove(index)"
          v-if="isMin()"
        >
          <Delete />
        </el-icon>
        <el-icon
          v-if="
            props.modelValue.length === index + 1 &&
            props.modelValue.length < props.max
          "
          :class="['pTB10 pL10']"
          size="20"
          @click="add(index)"
        >
          <CirclePlus />
        </el-icon>
      </div>
    </template>
  </div>
</template>

<script setup>
import { CirclePlus, Delete } from "@element-plus/icons-vue";

const props = defineProps({
  max: Number,
  min: { type: Number, default: 1 },
  defaultData: [Object, Number, String],
  listHook: Object,
  modelValue: { type: Array, default: () => [] },
});
const events = defineEmits("update:modelValue");

function isMin() {
  return props.modelValue.length > props.min;
}

function add() {
  // eslint-disable-next-line vue/no-mutating-props
  props.modelValue.push(props.defaultData);
  //   events("update:modelValue",);
}

function remove(index) {
  // eslint-disable-next-line vue/no-mutating-props
  props.modelValue.splice(index, 1);
  //   events("update:modelValue");
}
</script>

<style>
.curd-item {
  display: flex;
  align-items: center;
}
</style>
