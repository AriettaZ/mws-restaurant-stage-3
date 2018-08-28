// const dbPromise = createIndexedDB();
// function createIndexedDB() {
//   if (!('indexedDB' in window)) {return null;}
//   return indexedDB.open('restaurant_reviews', 1, function(upgradeDb) {
//     if (!upgradeDb.objectStoreNames.contains('restaurants')) {
//       const restaurantsOS = upgradeDb.createObjectStore('restaurants', {keyPath: 'id'});
//     }
//     if (!upgradeDb.objectStoreNames.contains('reviews')) {
//       const reviewsOS = upgradeDb.createObjectStore('reviews', {keyPath: 'id'});
//     }
//   });
// }
//
//
//
// function loadContentNetworkFirst() {
//   getServerData()
//   .then(dataFromNetwork => {
//     updateUI(dataFromNetwork);
//     saveReviewDataLocally(dataFromNetwork)
//     .then(() => {
//       setLastUpdated(new Date());
//       messageDataSaved();
//     }).catch(err => {
//       messageSaveError();
//       console.warn(err);
//     });
//   }).catch(err => { // if we can't connect to the server...
//     console.log('Network requests have failed, this is expected if offline');
//   });
// }




const DB_NAME = 'restaurants';
const DB_VERSION = 1; // Use a long long for this value (don't use a float)
const DB_STORE_NAME = 'restaurants';
const DB_REVIEW_NAME = 'reviews';
const DB_REVIEW_STORE_NAME = 'reviews';
const DB_REVIEW_VERSION = 1;
const DB_PENDING_REVIEW_NAME = 'pending_reviews';
const DB_PENDING_REVIEW_STORE_NAME = 'pending_reviews';
const DB_PENDING_REVIEW_VERSION = 1;

var db;
var review_db;
var pending_review_db;
function openDb() {
  console.log("openDb ...");
  var req = indexedDB.open(DB_NAME, DB_VERSION);
  req.onsuccess = function (evt) {
    // Better use "this" than "req" to get the result to avoid problems with
    // garbage collection.
    // db = req.result;
    db = this.result;
    console.log("openDb DONE");
  };
  req.onerror = function (evt) {
    console.error("openDb:", evt.target.errorCode);
  };

  req.onupgradeneeded = function (evt) {
    console.log("openDb.onupgradeneeded");
    var store = evt.currentTarget.result.createObjectStore(
      DB_STORE_NAME, { keyPath: 'id', autoIncrement: true });
    store.transaction.oncomplete = function(event) {
       // Store values in the newly created objectStore.
       fetch('http://localhost:1337/restaurants').then(function(response) {
         return response.json();
       }).then(function(json){
         console.log(json)
        var restaurantObjectStore = db.transaction(DB_STORE_NAME, "readwrite").objectStore(DB_STORE_NAME);
        json.forEach(function(restaurant) {
          restaurantObjectStore.add(restaurant);
        })
      })
    }
  };
}

function openReviewDb() {
  console.log("openReviewDb ...");
  var req = indexedDB.open(DB_REVIEW_NAME, DB_REVIEW_VERSION);
  req.onsuccess = function (evt) {
    // Better use "this" than "req" to get the result to avoid problems with
    // garbage collection.
    // db = req.result;
    review_db = this.result;
    console.log("open ReviewDb DONE");
  };
  req.onerror = function (evt) {
    console.error("openDb:", evt.target.errorCode);
  };

  req.onupgradeneeded = function (evt) {
    console.log("openReviewDb.onupgradeneeded");
    review_store = evt.currentTarget.result.createObjectStore(
    DB_REVIEW_STORE_NAME, { keyPath: 'id', autoIncrement: true });
    review_store.transaction.oncomplete = function(event) {
       // Store values in the newly created objectStore.
       fetch('http://localhost:1337/reviews').then(function(response) {
         return response.json();
       }).then(function(json){
         console.log(json)
        var reviewObjectStore = review_db.transaction(DB_REVIEW_STORE_NAME, "readwrite").objectStore(DB_REVIEW_STORE_NAME);
        json.forEach(function(review) {
          reviewObjectStore.add(review);
        })
      })
    };

  };
}

function openPendingReviewDb() {
  console.log("open Pending Review Db ...");
  var req = indexedDB.open(DB_PENDING_REVIEW_NAME, DB_PENDING_REVIEW_VERSION);
  req.onsuccess = function (evt) {
    // Better use "this" than "req" to get the result to avoid problems with
    // garbage collection.
    // db = req.result;
    pending_review_db = this.result;
    console.log("open ReviewDb DONE");
  };
  req.onerror = function (evt) {
    console.error("openDb:", evt.target.errorCode);
  };

  req.onupgradeneeded = function (evt) {
    console.log("openPendingReviewDb.onupgradeneeded");
    pending_review_store = evt.currentTarget.result.createObjectStore(
    DB_PENDING_REVIEW_STORE_NAME, { keyPath: 'id', autoIncrement: true });
  };
}

// var request = indexedDB.open(DB_NAME, 1)
// request.onupgradeneeded = function(event) {
//   var db = event.target.result;
//   var objectStore = db.createObjectStore(DB_STORE_NAME, { keyPath: "name" });
//   objectStore.transaction.oncomplete = function(event) {
//      // Store values in the newly created objectStore.
//      fetch('http://localhost:1337/restaurants').then(function(response) {
//        return response.json();
//      }).then(function(json){
//        console.log(json)
//       var restaurantObjectStore = db.transaction("restaurants", "readwrite").objectStore("restaurants");
//       json.forEach(function(restaurant) {
//         restaurantObjectStore.add(restaurant);
//       })
//     })
//    };
// };

// var reviewRequest = indexedDB.open('restaurantReview', 1)
// reviewRequest.onupgradeneeded = function(event) {
//   var db = event.target.result;
//   var objectStore = db.createObjectStore("restaurant_reviews", { keyPath: "id" });
//   objectStore.transaction.oncomplete = function(event) {
//      // Store values in the newly created objectStore.
//      fetch('http://localhost:1337/reviews').then(function(response) {
//        return response.json();
//      }).then(function(json){
//        console.log(json)
//       var restaurantReviewObjectStore = db.transaction("restaurant_reviews", "readwrite").objectStore("restaurant_reviews");
//       json.forEach(function(review) {
//         restaurantReviewObjectStore.add(review);
//       })
//     })
//    };
// };


/**
 * @param {string} store_name
 * @param {string} mode either "readonly" or "readwrite"
 */
function getReviewObjectStore(store_name, mode) {
  var tx = review_db.transaction(store_name, mode);
  return tx.objectStore(store_name);
}

// function clearObjectStore(store_name) {
//   var store = getObjectStore(DB_STORE_NAME, 'readwrite');
//   var req = store.clear();
//   req.onsuccess = function(evt) {
//     displayActionSuccess("Store cleared");
//     displayPubList(store);
//   };
//   req.onerror = function (evt) {
//     console.error("clearObjectStore:", evt.target.errorCode);
//     displayActionFailure(this.error);
//   };
// }


function saveReviewDataLocally(review) {
    console.log("New Review Arguments:", review);
    // var obj = { biblioid: biblioid, title: title, year: year };
    // if (typeof blob != 'undefined')
    //   obj.blob = blob;

    var store = getReviewObjectStore(DB_REVIEW_STORE_NAME, 'readwrite');
    var req;
    try {
      req = store.add(review);
    } catch (e) {
      if (e.name == 'DataCloneError')
        displayActionFailure("This engine doesn't know how to clone a Blob, " +
                             "use Firefox");
      throw e;
    }
    req.onsuccess = function (evt) {
      console.log("Insertion in DB successful");
    };
    req.onerror = function() {
      console.error("addReview error", this.error);
    };
  }

  function getLocalRestaurantData(){
    var store = getObjectStore(DB_STORE_NAME, 'readwrite');
    return store.getAll();
  }
  function getLocalReviewData() {
    var store = getReviewObjectStore(DB_REVIEW_STORE_NAME, 'readwrite');
    return store.getAll();
  }


function savePendingReviewDataLocally(review) {
    console.log("New Pending Review Arguments:", review);
    var req, store;
    try {
      store= pending_review_db.transaction(DB_PENDING_REVIEW_STORE_NAME, 'readwrite').objectStore(DB_PENDING_REVIEW_STORE_NAME)
      req = store.add(review);
    } catch (e) {
      if (e.name == 'DataCloneError')
        displayActionFailure("This engine doesn't know how to clone a Blob, " +
                             "use Firefox");
      throw e;
    }
    req.onsuccess = function (evt) {
      console.log("Insertion in pending DB successful");
    };
    req.onerror = function() {
      console.error("add pending review error", this.error);
    };
  }

  function getLocalRestaurantData(){
    var store = getObjectStore(DB_STORE_NAME, 'readwrite');
    return store.getAll();
  }
  function getLocalReviewData() {
    var store = getReviewObjectStore(DB_REVIEW_STORE_NAME, 'readwrite');
    return store.getAll();
  }

function postPendingReview(){
  var store,store_count;
  if(pending_review_db==null){
    window.setTimeout(postPendingReview, 50000);
  }else{
    var req, store;
    try {
      store= pending_review_db.transaction(DB_PENDING_REVIEW_STORE_NAME, 'readwrite').objectStore(DB_PENDING_REVIEW_STORE_NAME)
      store_count = store.count();
    } catch (e) {
      if (e.name == 'DataCloneError')
        displayActionFailure("This engine doesn't know how to clone a Blob, " +
                             "use Firefox");
      throw e;
    }
    store_count.onsuccess = function(evt) {
      console.log('there are '+ evt.target.result +' requests pending')
      if (evt.target.result>0 && navigator.onLine){
        var getAllPendingRequest = store.getAll();
        getAllPendingRequest.onsuccess = function() {
          value = getAllPendingRequest.result
          console.log("type: "+ typeof(value)+value)
          for (var i = 0; i < value.length; i++) {
            var formData = new FormData;
            formData.append('name',value[i]['name'])
            formData.append('restaurant_id',value[i]['restaurant_id'])
            formData.append('rating',value[i]['rating'])
            formData.append('comments',value[i]['comments'])
            addReview(formData)
          }
        }
        var clear_req =  setTimeout(function() { store.clear() }, 5000);
        clear_req.onsuccess = function(evt) {
          console.log("Store cleared");
        };
        clear_req.onerror = function (evt) {
          console.error("clearObjectStore:", evt.target.errorCode);
        };
      }
    }
  };
}
  // var store = getObjectStore(DB_STORE_NAME, 'readwrite');
  // var req = store.clear();
  // req.onsuccess = function(evt) {
  //   displayActionSuccess("Store cleared");
  //   displayPubList(store);
  // };
  // req.onerror = function (evt) {
  //   console.error("clearObjectStore:", evt.target.errorCode);
  //   displayActionFailure(this.error);
  // };
openDb();
openReviewDb();
openPendingReviewDb();
