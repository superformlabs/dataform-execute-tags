# Dataform Execute Tags Package

A Dataform package that executes Dataform tags. Use this package when you need to run tags sequentially and recompile your workflow between tag executions.

### How This Module Works

It creates an `IPYNB` file that uses Dataform API to compile and execute Dataform tags.

Since `IPYNB` is a supported model type in Dataform, you can add **tags** and **dependencyTargets** in notebookConfig to control when the Notebook should be executed.

This package could be used together with [dataform-table-to-json package](https://github.com/superformlabs/dataform-table-to-json) to run next tags after configuration is updated.

## Installation

### Step 1

To install this package in your Dataform repository, add it to your `package.json` file:

```json
{
  "dependencies": {
    "@dataform/core": "3.0.27",
    "dataform-execute-tags": "https://github.com/superformlabs/dataform-execute-tags/archive/refs/tags/v0.0.2.tar.gz"
  }
}
```

Notes:
You have to delete **dataformCoreVersion** from `workflow_settings.yaml`. @dataform/core should be higher or equal than 3.0.27

Then click **Install packages** in your Dataform workspace.

### Step 2

Create a [Bucket](https://console.cloud.google.com/storage/browser/) to save notebook execution results. Add the path to this bucket and set `defaultNotebookRuntimeOptions.outputBucket` in your `workflow_settings.yaml` file:

```yaml
defaultNotebookRuntimeOptions:
  outputBucket: "gs://your-output-bucket"
```

### Step 3

To use BigQuery Notebooks you need to:

- enable Vertex AI API

Add needed roles to the service account you will use for your Dataform pipeline execution (for example dataform-notebooks@dataform-package.iam.gserviceaccount.com):

- BigQuery Data Editor
- BigQuery Data Viewer
- BigQuery Job User
- BigQuery Read Session User
- BigQuery Studio User
- Dataform Admin
- Notebook Executor User
- Service Account Token Creator
- Service Account User
- Storage Admin

You can always test creating BigQuery Notebooks manually outside of Dataform to check that all needed permissions and APIs are enabled.

## Usage

### Basic Usage

```javascript
const { ExecuteTags } = require("dataform-execute-tags");

const executeConfig = {
  tags: ["daily"],
  dataformRepositoryName: "<your dataform repository>",
  dataformRepositoryLocation: "<your datafrom repository location>",
};
const notebookConfig = {
  dependencyTargets: [
    {
      name: "MODEL_NAME",
    },
  ],
  tags: ["config_update"],
  description: "Execute daily tag after config_update tag",
};

const executeTags = new ExecuteTags({ executeConfig, notebookConfig });
executeTags.publish();
```

## Configuration

### ExecuteConfig Parameters

| Parameter                    | Type          | Required | Default                                  | Description                         |
| ---------------------------- | ------------- | -------- | ---------------------------------------- | ----------------------------------- |
| `tags`                       | Array<string> | ✅       | -                                        | Array of Dataform tags to execute   |
| `dataformRepositoryName`     | string        | ✅       | `dataform.projectConfig`                 | Name of the Dataform repository     |
| `dataformRepositoryLocation` | string        | ✅       | `dataform.projectConfig.defaultLocation` | Location of the Dataform repository |
| `git_commitish`              | string        | ❌       | `"main"`                                 | Git branch/commit to compile        |
| `googleCloudProjectID`       | string        | ❌       | `dataform.projectConfig.defaultDatabase` | Google Cloud project ID             |

### NotebookConfig Parameters

| Parameter           | Type          | Required | Description                                 |
| ------------------- | ------------- | -------- | ------------------------------------------- |
| `name`              | string        | ❌       | Name of the notebook action                 |
| `dependencyTargets` | Array<Object> | ❌       | Targets of actions this notebook depends on |
| `tags`              | Array<string> | ❌       | User-defined tags for the notebook          |
| `description`       | string        | ❌       | Description of the notebook                 |

## API Reference

### Constructor

```javascript
new ExecuteTags({ executeConfig, notebookConfig });
```

Creates a new ExecuteTags instance.

- `executeConfig` (Object): Configuration for tag execution
- `notebookConfig` (Object): Configuration for the notebook action

### Methods

#### `setTags(tags)`

Updates the tags to execute.

```javascript
executeTags.setTags(["daily", "hourly"]);
```

#### `setExecuteConfig(executeConfig)`

Updates the execution configuration.

```javascript
executeTags.setExecuteConfig({
  dataformRepositoryName: "new-repo",
  dataformRepositoryLocation: "us-east1",
});
```

#### `setNotebookConfig(notebookConfig)`

Updates the notebook configuration.

```javascript
executeTags.setNotebookConfig({
  name: "new-notebook-name",
  description: "New description",
});
```

#### `publish()`

Publishes the notebook to the list of actions. The notebook can then be executed by running the notebook action or using notebook tags.

```javascript
executeTags.publish();
```

## Error Handling

The package throws errors in the following cases:

- **Missing Tags**: If no tags are provided or if tags is not an array
- **Missing Output Bucket**: If `defaultNotebookRuntimeOptions.outputBucket` is not configured in `workflow_settings.yaml`

## License

GNU General Public License. This file is part of "GA4 Dataform Package". Copyright (C) 2023-2025 Superform Labs Artem Korneev, Jules Stuifbergen, Johan van de Werken, Krisztián Korpa, Simon Breton. "GA4 Dataform Package" is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program. If not see GNU licenses

## Contributing

If you have any further questions, feel free to contact us at: support@ga4dataform.com.
