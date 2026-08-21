// src/components/vision-board/index.js

// Main exports
export { default as VisionBoardService } from "./VisionBoardService";
export { default as VisionBoardRoutes } from "./VisionBoardRoutes";
export { default as useVisionBoard } from "./useVisionBoard";

// Component exports
export { default as VisionBoardList } from "./VisionBoardList";
export { default as VisionBoardForm } from "./VisionBoardForm";
export { default as VisionBoardDetail } from "./VisionBoardDetail";
export { default as VisionBoardKanban } from "./VisionBoardKanban";
export { default as VisionBoardStatistics } from "./VisionBoardStatistics";

// Constants exports
export * from "./VisionBoardConstants";

// Combined export object
const VisionBoardModule = {
  VisionBoardService: require("./VisionBoardService").default,
  VisionBoardRoutes: require("./VisionBoardRoutes").default,
  useVisionBoard: require("./useVisionBoard").default,
  VisionBoardList: require("./VisionBoardList").default,
  VisionBoardForm: require("./VisionBoardForm").default,
  VisionBoardDetail: require("./VisionBoardDetail").default,
  VisionBoardKanban: require("./VisionBoardKanban").default,
  VisionBoardStatistics: require("./VisionBoardStatistics").default,
  ...require("./VisionBoardConstants"),
};

export default VisionBoardModule;
