window.addEventListener('load', function() {
  if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then(function(reg) {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', reg.scope);
        if (!navigator.serviceWorker.controller) {
          return;
        }

        if (reg.waiting) {
          reg.waiting.postMessage({action: 'skipWaiting'});
          return;
        }

        if (reg.installing) {
          reg.installing.addEventListener('statechange', function() {
            if (reg.installing.state == 'installed') {
              reg.installing.postMessage({action: 'skipWaiting'});
            }
          });
          return;
        }

        reg.addEventListener('updatefound', function() {
          var worker = reg.installing;
          worker.addEventListener('statechange', function() {
            if (worker.state == 'installed') {
              worker.postMessage({action: 'skipWaiting'});
            }
          });
        });
      }, function(err) {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
      // 
      // navigator.serviceWorker.addEventListener('controllerchange',function(){
      //   window.location.reload()
      // })
  }

//   openSocket();
//
//   // open a connection to the server for live updates
//   function openSocket() {
//     var indexController = this;
//     var reviews_list = document.querySelector("#reviews-list li:last-child");
//     console.log("reviews_list: " + reviews_list)
//     if(document.querySelector('.updated_time')){
//       // var latestPostDate = new Date(document.querySelector('.updated_time').innerHTML).getTime();
//       // console.log("latestPostDate: " + latestPostDate)
//       // // console.log("latestPostDate: " + new Date(latestPostDate).getTime())
//       // console.log("latestPostDate: " + latestPostDate.valueOf())
//       // // create a url pointing to /updates with the ws protocol
//       var socketUrl = new URL('http://localhost:1337/reviews', window.location);
//       console.log("window.location: "+window.location)
//       socketUrl.protocol = 'ws';
//       // Posts.find().where({ "date" : { ">": start } })
//       // if (latestPostDate) {
//       //   socketUrl.search = 'since=' + latestPostDate.valueOf();
//       //   console.log("socketUrl.search: "+socketUrl.search)
//       // }
//
//       // this is a little hack for the settings page's tests,
//       // it isn't needed for Wittr
//       socketUrl.search += 'restaurant_id=' + location.search.slice(4);
//
//       console.log("location.search: "+location.search)
//       var ws = new WebSocket(socketUrl.href);
//       console.log("socketUrl.href: "+socketUrl.href)
//       ws.addEventListener('open', function (event) {
//           socket.send('Hello Server!');
//           console.log('socket open')
//       });
//
//       ws.addEventListener('message', function(event) {
//         window.location.reload()
//         // requestAnimationFrame(function() {
//         //   var messages = JSON.parse(event.data);
//         //   console.log("messages: "+messages)
//         //   // createReviewHTML(messages);
//         //   window.location.reload()
//         // });
//       });
//     }
//
//       // try and reconnect in 5 seconds
//       setTimeout(function() {
//         openSocket();
//       }, 20000);
//   }
})
