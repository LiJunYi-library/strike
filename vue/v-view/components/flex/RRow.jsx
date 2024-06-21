import { RFlexHoc } from "./RFlexHoc";

export const RRow = RFlexHoc(
  {
    props: {
      align: { type: String, default: "center" },
    },
  }
);
