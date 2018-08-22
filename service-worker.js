if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, function(err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
  '/',
  '/js/',
  '/css/main.css',
  '/img/',
  '/images/'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         // Cache hit - return response
//         if (response) {
//           return response;
//         }
//         return fetch(event.request);
//       }
//     )
//   );
// });
self.addEventListener('fetch', function(event) {
    var req = event.request.clone();
    if (req.clone().method == "GET") {
        event.respondWith(
          caches.match(event.request)
            .then(function(response) {
              // Cache hit - return response
              if (response) {
                return response;
              }
              return fetch(event.request);
            }
          )
      );
    }else if(req.clone().method == "POST"){
      event.respondWith(
        // Try to get the response from the network
        fetch(event.request.clone()).catch(function() {
        	// If it doesn't work, post a failure message to the client
          store();
          	// Respond with the page that the request originated from
          return caches.match(event.request.clone().referrer);
        })
      );
    }
});

function store() {
    var newReview = ""; // Inputted values
    // Iterate through the inputs
    $("#add-review-form input").each(function() {
        newReview += $(this).val() + ",";
    });
    // Get rid of the last comma
    newPost = newReview.substr(0, newReview.length - 1);
    // Store the data
    localStorage.setItem('newReview', newReview);
}
