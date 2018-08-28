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
//     caches.match(event.request).then(function(response) {
//       return response || fetch(event.request);
//     })
//   );
// });

self.addEventListener('fetch', function(event) {
    event.respondWith(caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(event.request).then(function(response) {
            console.log("cache request: " + event.request.url);
            var fetchPromise = fetch(event.request).then(function(networkResponse) {
                // if we got a response from the cache, update the cache
                console.log("fetch completed: " + event.request.url, networkResponse);
                if (networkResponse) {
                    console.debug("updated cached page: " + event.request.url, networkResponse);
                    try{
                      cache.put(event.request, networkResponse.clone());
                    }
                    catch{
                      console.log("action is post")
                    }
                }
                return networkResponse;
            }, function (e) {
                // rejected promise - just ignore it, we're offline
                console.log("Error in fetch()", e);
            });

            // respond from the cache, or the network
            return response || fetchPromise || fetch(event.request);
        });
    }));
});


self.addEventListener('message',function(event){
  if(event.data.action=="skipWaiting"){
    self.skipWaiting();
  }
})

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
// self.addEventListener('fetch', function(event) {
//     var req = event.request.clone();
//     if (req.clone().method == "GET") {
//         event.respondWith(
//           caches.match(event.request)
//             .then(function(response) {
//               // Cache hit - return response
//               if (response) {
//                 return response;
//               }
//               return fetch(event.request);
//             }
//           )
//       );
//     }else if(req.clone().method == "POST"){
//       event.respondWith(
//         // Try to get the response from the network
//         fetch(event.request.clone()).catch(function() {
//         	// If it doesn't work, post a failure message to the client
//           store();
//           	// Respond with the page that the request originated from
//           return caches.match(event.request.clone().referrer);
//         })
//       );
//     }
// });
//
// function store() {
//     var newReview = ""; // Inputted values
//     // Iterate through the inputs
//     $("#add-review-form input").each(function() {
//         newReview += $(this).val() + ",";
//     });
//     // Get rid of the last comma
//     newPost = newReview.substr(0, newReview.length - 1);
//     // Store the data
//     localStorage.setItem('newReview', newReview);
// }
