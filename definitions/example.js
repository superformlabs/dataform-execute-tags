const { ExecuteTags } = require("dataform-execute-tags");

const executeConfig = {
  tags: ["sessions"],
  dataformRepositoryName: "<your dataform repository>",
  dataformRepositoryLocation: "<your datafrom repository location>",
};
const notebookConfig = {
  dependencyTargets: [{ name: "prepare_config" }],
  tags: ["daily"],
  description: "This notebook executes Dataform tags.",
};
const executeTags = new ExecuteTags({ executeConfig, notebookConfig });
executeTags.publish();
