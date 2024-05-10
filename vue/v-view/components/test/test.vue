<template>
  <div class="text">
    <RText
      :text="text"
      :maxLine="2"
      animation
      @fold="fold"
      @unfold="unfold"
      @click="(e) => click()"
    ></RText>
    <div></div>

    <RText :text="text" :maxLine="1" animation>
      <span>tag</span>
      <template #fold> 收起 </template>
      <template #unfold> 展开 </template>
    </RText>
    <div></div>

    <RText :text="text" :maxLine="1" @click="click" :isFold="false">
      <template #unfold> ....》 </template>
    </RText>
    <div></div>

    <RText></RText>
    <div></div>

    <RText2></RText2>
    <div></div>
    <TTT @expace="(p) => test(p)"></TTT>
  </div>
</template>

<script setup lang="tsx">
import { RText, RTextHoc } from "../text";
import { defineComponent } from "vue";

function test(p) {}

const tttHoc = (options: { props: Record<string, any>; emits?: string[]; className?: string }) => {
  const config: {
    props: Record<string, any>;
    emits?: string[];
    className?: string;
  } = {
    // props: {},
    // emits: [],
    // className: "",
    ...options,
  };

  const com = defineComponent({
    // emits: {
    //   expace: (type: Number) => 0,
    // },
    emits: ["expace", "flotew"],
    props: {
      adc: String,
      rty: { type: String, default: "ui" },
      ...config.props,
    },
    setup() {
      return () => <div></div>;
    },
  });

  return com;
};

const TTT = tttHoc({
  props: {
    bb: String,
  },
});

const RText2 = RTextHoc({
  props: {
    adc: String,
    bb: String,
  },
  emits: ["pase"],
  // emits: {
  //   pase: (type: Number) => 0,
  // },
});

function fold() {
  console.log("收起");
}

function unfold() {
  console.log("展开");
}

function click() {
  console.log("点击");
}
const text =
  "手电筒官方是大法官当事人发给对方是个手电筒官方是大法官当事人发给对方是个手电筒官方是大法官当事人发给对方是个手电筒官方是大法官当事人发给对方是个结束";
</script>

<style>
.text div {
  margin: 10px 0;
}
</style>
