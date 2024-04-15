﻿  var path = '/api/v1/run';
  var endpoint = Project.Variables.GetVariableDefaultValue('Vansah_URL')+path;
  var result = "passed";

  function EventControl_OnStopTestCase(Sender, StopTestCaseParams)
  { 
    var testCaseKey = Project.Variables.testCaseKey; 
    var assetKey = Project.Variables.assetKey;
  
      // Set Test Run Properties
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

    // Determine asset based on its type
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