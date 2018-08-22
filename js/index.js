var request = indexedDB.open('restaurant', 1)
request.onupgradeneeded = function(event) {
  var db = event.target.result;

  var objectStore = db.createObjectStore("restaurants", { keyPath: "name" });

  objectStore.createIndex("id", "id", { unique: true });
  objectStore.transaction.oncomplete = function(event) {
     // Store values in the newly created objectStore.
     fetch('http://localhost:1337/restaurants').then(function(response) {
       return response.json();
     }).then(function(json){
       console.log(json)
      var restaurantObjectStore = db.transaction("restaurants", "readwrite").objectStore("restaurants");
         json.forEach(function(restaurant) {
           restaurantObjectStore.add(restaurant);
      })
    })
   };
};
request = indexedDB.open('restaurantReview', 1)
request.onupgradeneeded = function(event) {
  var db = event.target.result;

  var objectStore = db.createObjectStore("restaurant_reviews", { keyPath: "id" });

  objectStore.createIndex("restaurant_id", "restaurant_id", { unique: false });
  objectStore.transaction.oncomplete = function(event) {
     // Store values in the newly created objectStore.
     fetch('http://localhost:1337/reviews').then(function(response) {
       return response.json();
     }).then(function(json){
       console.log(json)
      var restaurantReviewObjectStore = db.transaction("restaurant_reviews", "readwrite").objectStore("restaurant_reviews");
         json.forEach(function(review) {
           restaurantReviewObjectStore.add(review);
      })
    })
   };
};

// Call the function whenever the page is refreshed
$(function () {
    if (localStorage.getItem('newReview')) {
	// Set keys and values for voting for your favorite article
    var names = ['name', 'rating', 'comments'];
    var values = localStorage.getItem('newReview').split(',');
	// Form to append inputs to
	var form = $("#add-review-form");
	// Create and append inputs
	for (var i = 0; i < names.length; i++) {
	    var input = '<input type="hidden" name="'
		+ names[i] + '" value="'
		+ values[i] + '">';
	    $(input).appendTo(form);
	}
	// Clear newPost from localStorage and submit the form
	localStorage.removeItem('newReview');
	form.submit();
    }
});
