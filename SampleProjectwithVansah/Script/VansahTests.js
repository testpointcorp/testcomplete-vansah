function EventControl_OnStopTest() { 
    Log.Message("result : "+Project.Variables.VansahResult);
    // Retrieve variables from project variables
    var testCaseKey = Project.Variables.testCaseKey;
    var assetKey = Project.Variables.assetKey;
    var endpoint = Project.Variables.Vansah_URL;

    // Log variable values
 //   Log.Message("TestCaseKey: " + testCaseKey);
  //  Log.Message("AssetKey: " + assetKey);
  //  Log.Message("Endpoint: " + endpoint);
  
    // Create request body
    var requestBody = `{"case": {"key": "${testCaseKey}"}, "asset": {"type": "issue", "key": "${assetKey}"}}`;
    // Create and send HTTP request
    var httpRequest = aqHttp.CreateRequest("POST", endpoint);
    httpRequest.SetHeader("Content-Type", "application/json");
    httpRequest.SetHeader("Authorization", aqEnvironment.GetEnvironmentVariable("VANSAH_TOKEN"));
    var httpResponse = httpRequest.Send(requestBody);
    
    
    
}
