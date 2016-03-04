'use strict';

var hostweburl;
var appweburl;
var executor;

$(document).ready(function () {
  getCustomPermission();
});

// retrieve the hostweb url and appweb url from the query string
function getCustomPermission() {
  $(document).ready(function () {
    hostweburl =
        decodeURIComponent(
            getQueryStringParameter("SPHostUrl")
    );
    appweburl =
        decodeURIComponent(
            getQueryStringParameter("SPAppWebUrl")
    );

    var scriptbase = hostweburl + "/_layouts/15/";

    $.getScript(scriptbase + "SP.RequestExecutor.js", getRoleAssignments);
  });
}

//make the rest call
function getRoleAssignments() {
  executor = new SP.RequestExecutor(appweburl);

  executor.executeAsync(
      {
        url:
            appweburl +
            "/_api/SP.AppContextSite(@target)/web/lists/getbytitle('Test')/items(1)?$expand=RoleAssignments/Member/Users&@target='" +
            hostweburl + "'",
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: successHandler,
        error: errorHandler
      }
  );
}

//display results
function successHandler(data) {
  var jsonObject = JSON.parse(data.body);
  var roleAssignmentHTML = "";

  var results = jsonObject.d.RoleAssignments.results;
  for (var i = 0; i < results.length; i++) {

    roleAssignmentHTML = roleAssignmentHTML +
          "<p><b>" + results[i].Member.OwnerTitle +
          "</b></p>";
    var users = results[i].Member.Users.results;
    if (users) {
      for (var u = 0; u < users.length; u++) {
        roleAssignmentHTML = roleAssignmentHTML + "<p>" + users[u].Title + "</p>";
      }
    }
  }
  document.getElementById("message").innerHTML =
      roleAssignmentHTML;
}


function errorHandler(data, errorCode, errorMessage) {
  document.getElementById("message").innerText =
      "Could not complete cross-domain call: " + errorMessage;
}

function getQueryStringParameter(paramToRetrieve) {
  var params =
      document.URL.split("?")[1].split("&");
  var strParams = "";
  for (var i = 0; i < params.length; i = i + 1) {
    var singleParam = params[i].split("=");
    if (singleParam[0] == paramToRetrieve)
      return singleParam[1];
  }
}
