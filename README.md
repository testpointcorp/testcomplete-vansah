# TestComplete Integration with Vansah Test Management For Jira

This tutorial guides you through the process of integrating TestComplete tests with Vansah Test Management For Jira. Integrating TestComplete with Vansah will allow you to send Test Case results from TestComplete to your Jira workspace.

By following this setup, you can streamline your testing workflow, ensuring that test outcomes are recorded directly in your Jira workspace.

## Prerequisites
- TestComplete - [Keyword Tests](https://support.smartbear.com/testcomplete/docs/keyword-testing/index.html) project is already setup.
- Make sure that [`Vansah`](https://marketplace.atlassian.com/apps/1224250/vansah-test-management-for-jira?tab=overview&hosting=cloud) is installed in your Jira workspace
- You need to Generate **Vansah** [`connect`](https://docs.vansah.com/docs-base/generate-a-vansah-api-token-from-jira-cloud/) token to authenticate with Vansah APIs.
## Configuration
**Setting Environment Variables** - Store your Vansah API token as an environment variable for security. 

For Windows (use cmd)
```cmd
setx VANSAH_TOKEN "your_vansah_api_token_here"

```
For macOS
```bash
echo export VANSAH_TOKEN="your_vansah_api_token_here" >> ~/.bash_profile

source ~/.bash_profile

```
For Linux (Ubuntu, Debian, etc.)
```bash
echo export VANSAH_TOKEN="your_vansah_api_token_here" >> ~/.bashrc

source ~/.bashrc

``` 
## Implementation
To enable Vansah integration in TestComplete project, follow these steps:

### Create Variables at Project Level Scope 
 - Add `testCaseKey` and `assetKey` under Temporary Variables of the Project. (Variable Names are case-sensitive)
 - Add `Vansah_URL`, `SprintName`, `ReleaseName` and `EnvironmentName` under Persistent Variables of the Project. (Variable Names are case-sensitive) 
    ![VansahVariablesinDefault](/Asset/project_variables.jpg)

### Add Event Contoller in the Project
 - Add `OnLogError` from General Events Section and add Event Handler function to your Javascript file.
 - Add `OnStopTestCase` from Test Engine Events and add Event Handler funtion to your Javascript file.
    ![EventControl](/Asset/event_control.png)


### Add below Javascript to your Script 
 - **(Option 1)** Copy the Below Code and Paste it in your script.js file
```js
  var path = '/api/v1/run';
  var endpoint = Project.Variables.GetVariableDefaultValue('Vansah_URL')+path;
  var result = "passed";

  function EventControl_OnStopTestCase(Sender, StopTestCaseParams)
  { 
    var testCaseKey = Project.Variables.testCaseKey; 
    var assetKey = Project.Variables.assetKey;
  
      // Set Test Run Properties (Optional)
    var sprintName = Project.Variables.GetVariableDefaultValue('SprintName');
    var releaseName = Project.Variables.GetVariableDefaultValue('ReleaseName');
    var environmentName = Project.Variables.GetVariableDefaultValue('EnvironmentName');

    // Construct properties object
    var properties = '';
    if (sprintName) {
      properties += `"sprint": {"name": "${sprintName}"}, `;
    }
    if (releaseName) {
      properties += `"release": {"name": "${releaseName}"}, `;
    }
    if (environmentName) {
      properties += `"environment": {"name": "${environmentName}"}, `;
    }

    // Remove trailing comma if properties are present
    if (properties !== '') {
      properties = properties.slice(0, -2); // Remove last comma and space
      properties = `"properties": {${properties}}, `;
    }

    // Determine asset (Test Folder or Jira Issue) based on its type
    var assetType;
    var assetIdentifier;
    if (assetKey.split('-').length > 2) {
      assetType = 'folder';
      assetIdentifier = assetKey; // Use assetKey as the identifier for folders
    } else {
      assetType = 'issue';
      assetIdentifier = assetKey; // Use assetKey as the key for issues
    }

    // Construct asset object based on type
    var asset;
    if (assetType === 'folder') {
      asset = `"asset": { "type": "${assetType}", "identifier": "${assetIdentifier}" },`;
    } else {
      asset = `"asset": { "type": "${assetType}", "key": "${assetIdentifier}" },`;
    }

    // Request body
    var requestBody = `{"case": {"key": "${testCaseKey}"}, ${asset} ${properties}"result": {"name": "${result}"}}`;

    // send HTTP request
    var httpRequest = aqHttp.CreateRequest("POST", endpoint);
    httpRequest.SetHeader("Content-Type", "application/json");
    httpRequest.SetHeader("Authorization", aqEnvironment.GetEnvironmentVariable("VANSAH_TOKEN"));
  
    var httpResponse = httpRequest.Send(requestBody);
    Log.Message(httpResponse.Text);
  
    //set the result to default value for the next Test Case
    result= "passed";
  }

  function EventControl_OnLogError(Sender, LogParams)
  {
    result = "failed"; 
  }
```
 - **(Option 2)** Copy and Paste [this](/SampleProjectwithVansah/Script/VansahTests.js) file to your Script folder and Locate your Event Handler to this file.
    ![script.js](/Asset/script.png)

### Add `TestCaseKey` and `AssetKey` Variables to your Keyword Tests

To facilitate the integration of test results with Vansah, it's necessary to include `TestCaseKey` and `AssetKey` variables in your keyword tests. These variables will store the relevant details from Vansah, ensuring seamless transmission of test results upon test completion.

1. **Add Variables with Vansah Details:**
   - Add `TestCaseKey` and `AssetKey` variables to each of your Keyword Tests.
   - Populate these variables with the relevant details obtained from Vansah.
   ![TestsVariables](/Asset/add_case_asset_details.png)

2. **Set Variable Values During Runtime:**
   - At the beginning of each keyword test, include a step to set `TestCaseKey` and `AssetKey` variables.
   - Map these variables to the Project Level `testCaseKey` and `assetKey`. ![setTestsVariables](/Asset/set_variables.png)

By incorporating `TestCaseKey` and `AssetKey` variables into your keyword tests and setting their values dynamically during runtime, you ensure the successful execution of API requests to Vansah, facilitating efficient transmission of test results.

## Conclusion

By following the above steps, your TestComplete project will be equipped to send test run results directly to Vansah, streamlining your testing and reporting process. 

Ensure that all files are placed and configured as described to facilitate successful integration.

For more details on TestComplete, visit the [Keyword Tests](https://support.smartbear.com/testcomplete/docs/keyword-testing/index.html). 

For Vansah specific configurations and API details, please refer to the [Vansah API documentation](https://apidoc.vansah.com/).
