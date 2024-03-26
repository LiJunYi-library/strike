<script lang="jsx">
import { onBeforeUnmount, provide, reactive, inject, defineComponent } from "vue";

export default defineComponent({
  inheritAttrs: false,
  props: {
    formatter: Function,
  },
  setup(props, ctx) {
    const data = reactive({
      attrs: ctx.attrs,
    });

    const SerieContext = inject("SerieContext") || {};
    // console.log("SerieContext", SerieContext);

    SerieContext?.data.push(data);

    onBeforeUnmount(() => {
      SerieContext.data = SerieContext?.data.filter((el) => el !== data);
    });

    return () => {
      return null;
    };
  },
});
</script>
