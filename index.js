const file_context = require("./includes/notebook_template.json");

/**
 * @typedef {Object} NotebookConfig
 * @property {string} [name] - The name of the notebook action
 * @property {Array<Object>} [dependencyTargets] - Targets of actions that this notebook is dependent on
 * @property {Array<string>} [tags] - A list of user-defined tags with which the notebook should be labeled
 * @property {string} [description] - Description of the notebook.
 */
/**
 * @typedef {Object} ExecuteConfig
 * @property {Array<string>} tags - Array of tags to execute
 * @property {string} dataformRepositoryName - The name of the Dataform repository to output the results to.
 * @property {string} dataformRepositoryLocation - The location of the Dataform repository to output the results to.
 * @property {string} [git_commitish] - The name of the Dataform repository commitish that should be compiled.
 * @property {string} [googleCloudProjectID] - The Google Cloud project to output the results to.
 */

class ExecuteTags {
  constructor(options) {
    const { notebookConfig = {}, executeConfig = {} } = options;

    if (!executeConfig?.tags || executeConfig?.tags.length === 0) {
      throw new Error("Tags parameter is required and must be an array.");
    }

    this._executeConfig = this._setDefaultExecuteConfig(executeConfig);
    this._notebookConfig = notebookConfig;
    this._file_context = file_context;
  }

  /**
   * Sets default values for executeConfig if not provided
   * @param {ExecuteConfig} executeConfig - The execute configuration
   * @returns {ExecuteConfig} - Configuration with default values
   * @private
   */
  _setDefaultExecuteConfig(executeConfig) {
    return {
      ...executeConfig,
      dataformRepositoryName:
        executeConfig?.dataformRepositoryName || dataform.projectConfig,
      dataformRepositoryLocation:
        executeConfig?.dataformRepositoryLocation ||
        dataform.projectConfig.defaultLocation,
      git_commitish: executeConfig?.git_commitish || "main",
      googleCloudProjectID:
        executeConfig?.googleCloudProjectID ||
        dataform.projectConfig.defaultDatabase,
    };
  }

  /**
   * @param {Array<string>} tags - Array of tags to execute
   */
  setTags(tags) {
    this._executeConfig.tags = tags;
  }

  /**
   * @param {ExecuteConfig} executeConfig - Configuration for execute settings (optional)
   */
  setExecuteConfig(executeConfig) {
    this._executeConfig = executeConfig;
  }

  /**
   * @param {NotebookConfig} notebookConfig - Configuration for the notebook (optional)
   */
  setNotebookConfig(notebookConfig) {
    this._notebookConfig = notebookConfig;
  }

  /**
   * Updates the notebook context with the replaceObject.
   * @param {Object} replaceObject - The object to replace in the notebook context.
   * @returns {string} - The updated notebook context.
   * @private
   */
  _updateNotebookContext(replaceObject) {
    let new_context = JSON.stringify(this._file_context);
    for (const [key, value] of Object.entries(replaceObject)) {
      new_context = new_context.replace(key, value);
    }
    this._file_context = JSON.parse(new_context);
  }

  /**
   * Publishes the notebook to the output bucket.
   */

  publish() {
    if (!this._executeConfig.tags)
      throw new Error("Tags parameter not provided.");

    this._updateNotebookContext({
      "%%DATAFORM_REPOSITORY_NAME%%":
        this._executeConfig.dataformRepositoryName,
      "%%DATAFORM_GIT_COMMITISH%%": this._executeConfig.git_commitish,
      "%%DATAFORM_REPOSITORY_REGION%%":
        this._executeConfig.dataformRepositoryLocation,
      "%%GOOGLE_CLOUD_PROJECT%%": this._executeConfig.googleCloudProjectID,
      "%%DATAFORM_TAGS%%":
        "[" +
        this._executeConfig.tags.map((tag) => `\\"${tag}\\"`).join(",") +
        "]",
    });
    if (
      !dataform.projectConfig.defaultNotebookRuntimeOptions ||
      !dataform.projectConfig.defaultNotebookRuntimeOptions.outputBucket
    )
      throw new Error(
        "Set defaultNotebookRuntimeOptions.outputBucket in workflow_settings.yaml to provide output bucket."
      );

    notebook({
      ...this._notebookConfig,
      filename:
        "../node_modules/dataform-execute-tags/includes/execute_tags.ipynb",
    }).ipynb(this._file_context);
  }
}

module.exports = {
  ExecuteTags,
};
