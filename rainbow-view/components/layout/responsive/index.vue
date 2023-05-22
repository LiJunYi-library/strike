<script>
// export default {
//   components: { Context, Resize },
//   interceptDraw: true,
//   render(ctx) {
//     console.log("------render ----ctx ", ctx);
//     // const vNodes = <div> {this.$slots.default()} </div>;
//     // console.log(vNodes);
//     // return [renderSlot(this.$slots, "default", {}), h(Context, { ref: "context" })];
//     const vNode = renderSlot(this.$slots, "default", {}); // this.$slots.default()  //renderSlot(this.$slots, "default", {})
//     // vNode.children.forEach((element) => {
//     //   if(!element.props) element.props={}
//     //   if(!element.props.style) element.props.style={}
//     //   element.props.style.position = 'absolute'
//     // });

//     // console.log(vNodes);
//     return (
//       <div class="responsive" style={{ position: "relative", width: "100%", height: "1px" }}>
//         {vNode}
//       </div>
//     );
//   },
//   renderContext() {
//     // console.log("Context", this);
//     // console.log("Context", this.children.length);
//     return (
//       <div ref="root" class="responsive">
//         <div> Context </div>
//         {/* {this.children.map((el) => {
//           return renderSlot(el.$slots, "default");
//         })} */}
//       </div>
//     );
//   },
//   data() {
//     return { children: [] };
//   },
//   created() {
//     console.log(this);
//   },
//   mounted() {
//     console.log("group ------------- mounted", this);
//     // const vNodes = this.$slots.default();
//     // vNodes.props = {
//     //   staticClass: "sss",
//     //   class: "ttttt",
//     // };
//     // vNodes.appContext = this._.appContext;
//     // vNodes.children.forEach((element) => {
//     //   element.appContext = this._.appContext;
//     // });
//     // console.log(vNodes);
//     // render(vNodes, this.$el);
//     // this.children.map((el) => {
//     //   return renderSlot(el.$slots, "default");
//     // });
//     // this.children.forEach((el) => {
//     //   const vNode = <div> {el.$slots.default()} </div>;
//     //   console.log(vNode);
//     //   console.log(this);

//     //   render(vNode, this.$refs.context.$refs.root);
//     // });
//   },
// };
import { mergeEvent } from "@rainbow_ljy/rainbow-js/package/promise";
import { renderSlot, h, render } from "vue";
import resizeMixin from "../../resize/index";

const Context = {
  render() {
    console.log("Context render");
    if (!this.$parent || !this.$parent.$options || !this.$parent.$options.renderContext) {
      return null;
    }
    return this.$parent.$options.renderContext.call(this.$parent);
  },
  mounted() {
    console.log("Context mounted");
  },
};

export default {
  mixins: [resizeMixin],
  components: {},
  interceptDraw: true,
  data() {
    return {
      offset: {},
      children: [],
      cache: [],
      mergeEvent: mergeEvent(0),
      style: {
        position: "relative",
      },
    };
  },
  props: {
    space: { type: Number, default: 20 },
    stretch: { type: Boolean, default: false },
    minItemWidth: { type: Number, default: 300 },
    alignContent: { type: String, default: "stretch" }, ///start end center stretch
  },
  render(ctx) {
    const vNode = renderSlot(this.$slots, "default", {});
    console.log("responsive ------------- render", vNode);
    return (
      <div class="responsive" style={this.style}>
        {vNode}
      </div>
    );
  },
  renderContext() {
    //
  },
  created() {
    // console.log(this);
  },
  async measureChildren() {
    await this.mergeEvent;
    console.log("responsive ------------- measureChildren");
    let columnNum = this.offset.width / this.minItemWidth;
    columnNum = Math.floor(columnNum);
    const itemW = this.measureChildWidth(this.offset.width);
    const alignContent = {
      start: (child, { pTop }) => {
        child.style.top = pTop + "px";
        child.style.height = child.measure.height + "px";
      },
      end: (child, { pTop, maxHeight }) => {
        child.style.top = pTop + (maxHeight - child.measure.height) + "px";
        child.style.height = child.measure.height + "px";
      },
      center: (child, { pTop, maxHeight }) => {
        child.style.top = pTop + (maxHeight - child.measure.height) / 2 + "px";
        child.style.height = child.measure.height + "px";
      },
      stretch: (child, { pTop, maxHeight }) => {
        child.style.top = pTop + "px";
        child.style.height = maxHeight + "px";
      },
    };

    let nth = 0;
    let pLeft = 0;
    let pTop = 0;
    let maxHeight = 0;
    let prveChildren = [];
    let pHeight = 0;
    this.children.forEach((child, index) => {
      prveChildren.push(child);
      if (child.measure.height > maxHeight) maxHeight = child.measure.height;
      child.style.left = pLeft + "px";
      pLeft = pLeft + this.space + itemW;
      nth++;
      if (nth === columnNum || index === this.children.length - 1) {
        // if (this.stretch)
        pHeight = pHeight + maxHeight + this.space;
        prveChildren.forEach((el) => {
          try {
            alignContent[this.alignContent](el, { pTop, maxHeight });
          } catch (error) {
            console.error("alignContent  设置无效");
          }

          // el.style.top = pTop + "px";
          // el.style.height = el.measure.height + "px";
          // el.style.top = pTop + (maxHeight - el.offset.height)  + "px";
        });
        pTop = pTop + maxHeight + this.space;
        nth = 0;
        pLeft = 0;
        maxHeight = 0;
        prveChildren = [];
      }
    });

    pHeight = pHeight - this.space;
    this.style.height = pHeight + "px";
  },
  methods: {
    async onResizeWidth(offset) {
      await this.mergeEvent;
      console.log("responsive ------------- onResizeWidth", offset);
      this.constraintChildWidth(offset.width);
      this.offset = offset;
    },
    measureChildWidth(pWidth) {
      let columnNum = pWidth / this.minItemWidth;
      columnNum = Math.floor(columnNum);
      if (columnNum <= 0) columnNum = 1;
      const surplusW = pWidth - columnNum * this.minItemWidth - (columnNum - 1) * this.space;
      const averageW = surplusW / columnNum;
      const itemW = averageW + this.minItemWidth;
      return itemW;
    },
    constraintChildWidth(pWidth) {
      const itemW = this.measureChildWidth(pWidth);
      this.children.forEach((child, index) => {
        child.style.width = itemW + "px";
      });
    },
  },
  mounted() {
    console.log("responsive ------------- mounted", this);
    const offset = this.$el.getBoundingClientRect();
    this.constraintChildWidth(offset.width);
    this.offset = offset;
    // this.style.width = this.offset.width + "px";
  },
};
</script>

<style>
.responsive {
  /* display: flex;
  justify-content: space-between;
  flex-wrap: wrap; */
  background: rgb(226, 226, 226);
  /* position: absolute;
  align-items: ; */
  /* align-content: start; */
}
</style>
