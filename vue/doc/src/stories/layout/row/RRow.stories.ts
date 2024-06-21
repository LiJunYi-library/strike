import type { Meta, StoryObj } from '@storybook/vue3';
import { fn } from '@storybook/test';
import { RRow } from '../../../components/flex';



const meta = {
  title: 'Layout/RRow',
  component: RRow,
  tags: ['autodocs'],
  argTypes: {
    justify: {
      description: '对齐方式',
      control: 'select',
      options: ["start", "end", "around", "between", "evenly", "center", "stretch", ""]
    },
    align: {
      control: 'select',
      options: ["start", "end", "center", "stretch", "baseline", ""]
    },
    auto: {
      control: 'select',
      options: ["top", "bottom", "left", "right", "center", "", "horizontal", "vertical"],
    },
    alignSelf: {
      control: 'select',
      options: ["start", "end", "center", "stretch", "baseline", ""]
    },

  },
  args: {

  },
} satisfies Meta<typeof RRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => ({
    components: { RRow },
    setup() {
      return { args };
    },
    template: `
      <RRow v-bind="args" class="con-h100">
        <div class="con-c"> 11111 </div>
        <div class="con-c"> 22222222 </div>
        <div class="con-c"> 33 </div>
      </RRow>
    `,
  }),
};

export const ListTemplate: Story = {
  render: (args) => ({
    components: { RRow },
    setup() {
      return { args };
    },
    template: `
      <RRow class="con-h100">
        <RRow class="con-c"> 11111 </RRow>
        <RRow class="con-c"  v-bind="args"> 22222222 </RRow>
        <RRow class="con-c"> 33 </RRow>
      </RRow>
    `,
  }),
};






