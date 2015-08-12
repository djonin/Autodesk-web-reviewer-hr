
var hostname = "http://bootcamp1.autodesk.com";
//var hostname = "http://morning-stream-3036.herokuapp.com";
var defaultUrn = 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6bW9kZWwyMDE1LTA4LTExLTAwLTIxLTI2LWhyZG1vd2d3ejhpb3N0anVlbGR3c3gxaXZ6eW0vUm9ib3RBcm0uZHdmeA==';
var token;
var pubnub = PUBNUB({
    subscribe_key: 'sub-c-6def75da-404e-11e5-9f25-02ee2ddab7fe', // always required
    publish_key: 'pub-c-7d98d445-8a56-4c0f-b8f8-19bf18192bc1'    // only required if publishing
});

$(document).ready(function () {
	getToken(function(t) {
	  var options = {

	    'document' : 'urn:'+defaultUrn,

	    'env':'AutodeskStaging',

	    'getAccessToken': function() { return token },

	    'refreshToken': function() { return token }  

	  };

	  var viewerElement = document.getElementById('viewer');

	  var viewer = new Autodesk.Viewing.Viewer3D(viewerElement, {});
    loadComments(token);

	  Autodesk.Viewing.Initializer(options,function() {

	    viewer.initialize();
	    loadComments(token);
    	pubnub.subscribe({
		    channel: defaultUrn,
		    message: function(m){console.log(m);loadComments(token)},
		    error: function (error) {
		      // Handle error here
		      console.log(JSON.stringify(error));
  			}
			});
	    loadDocument(viewer, options.document);

	  });
	});
});

function onError(error) {
    console.log('Error: ' + error);
};

/*
function getChannel(name, token, callback) {
  $.ajax({
    url: 'http://livereview.com:3000/api/getchannel',
    type: 'POST',
    data: JSON.stringify({'name' : name}),
    contentType: 'application/json',
    success: function(data) {
      callback(data);
    },
    error: function(err) {
      console.error(err);
    },
    complete: function() {
    }
  });
}
*/

// This method returns a valid access token  For the Quick Start we are just returning the access token

// we obtained in step 2.  In the real world, you would never do this.

function refreshToken(callback) {

}

function getToken(callback) {
  console.log("AAAAA");
  if (token)
  {
    callback(token);
  } else {
    $.ajax({
      url: hostname+'/api/readtoken',
      type: 'GET',
      contentType: 'application/json',
      headers: {"Access-Control-Allow-Origin" : "*"},
      success: function(data) {
        console.log('data is:', data);
      	token = data.access_token;
        callback(token);
      },
      error: function(err) {
        console.error('errpr:', err);
      },
      complete: function() {
      }
    });
  }
}

function postComment() {
	var text = $('#commentText')[0].value;
	getToken(function(token) {
		$.ajax({
		    url: hostname+'/api/comment',
		    type: 'POST',
		    data: JSON.stringify({
          token: token,
		    	text: text,
          urn: defaultUrn
		    }),
		    contentType: 'application/json',
		    headers: {"Access-Control-Allow-Origin": '*'},
		    success: function(data) {
          console.log('data',data);
          loadComments(token);
		    },
		    error: function(err) {
		      console.error(err);
		    },
		    complete: function() {
		    }
	  });
  });
  $('#commentText')[0].value = '';
}

function loadComments(token) {
  console.log(token);
  $.ajax({
    url: 'https://developer-stg.api.autodesk.com/comments/v2/resources/'+defaultUrn,
    type: 'GET',
    contentType: 'application/json',
    headers: {"Access-Control-Allow-Origin": '*', Authorization: "Bearer "+token },
    success: function(data) {
      console.log('loaded comments');
      // Don't bother if we have nothing to work with

      $('#comments').empty();
      console.log(data);
      for(var i = 0; i<data.length; i++) {
      	console.log('asdasd');
        var elem = $('<div class="comment">'+data[i].body+'</div>');
        $('#comments').append(elem);
      }

    },
    error: function(err) {
      console.error(err);
    },
    complete: function() {
    }
  });
}


function loadDocument(viewer, documentId) {
    // Find the first 3d geometry and load that.
    Autodesk.Viewing.Document.load(documentId, function(doc) {// onLoadCallback
    var geometryItems = [];
    geometryItems = Autodesk.Viewing.Document.getSubItemsWithProperties(doc.getRootItem(), {
        'type' : 'geometry',
        'role' : '3d'
    }, true);

    if (geometryItems.length > 0) {
        viewer.load(doc.getViewablePath(geometryItems[0]));
    }
 }, function(errorMsg) {// onErrorCallback
    alert("Load Error: " + errorMsg);
    });
}