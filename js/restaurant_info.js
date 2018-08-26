let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoicWlhbnl1YW56aHU5NyIsImEiOiJjamtyMjExNWMyMDUwM3h0aG4xaWh0dmZsIn0.-_N5UANrtisVtypbF3yatQ',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      DBHelper.fetchReviewsByRestaurant(id, (error, reviews) => {
        fillReviewsHTML(reviews);
        console.log(reviews);
        self.restaurant.reviews=reviews
      });
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name+" ";
  var is_favorite_botton= document.createElement('a');
  is_favorite_botton.setAttribute('id', 'is_favorite');
  if (restaurant.is_favorite == "true"){
    is_favorite_botton.innerHTML = '&#9733;';
    is_favorite_botton.classList.add("favorite");
  }else{
    is_favorite_botton.innerHTML = '&#9734;';
  }
  console.log(is_favorite_botton)
  name.appendChild(is_favorite_botton);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imageSrcsetForRestaurant(restaurant);
  image.alt = restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  console.log(restaurant.is_favorite)
  console.log(restaurant.id)
  is_favorite_button=document.getElementById('is_favorite');
  is_favorite_button.addEventListener('click',toggleFavorite);
  document.getElementById("restaurant_id").value =restaurant.id;
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews) => {
  console.log(reviews)
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews <button id="add-review-button" onclick="toggleForm()">Add Your Reivew</button>';
  const form = document.getElementById('togglable-form');
  // container.appendChild(title);
  container.insertBefore(title, form);
  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.setAttribute('class', 'updated_time');
  date.innerHTML = `${(new Date(review.updatedAt))}`;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// $('#is_favorite').click(toggleFavorite)
toggleFavorite = () =>{
  var id= getParameterByName("id");
  DBHelper.fetchRestaurantById(id, (error, restaurant) => {
    if (error) {
      callback(error, null);
    } else {
      if (restaurant) { // Got the restaurant
        console.log(restaurant)
        var http = new XMLHttpRequest();
        var url = `http://localhost:1337/restaurants/${id}`;
        http.open('POST', url, true);

        //Send the proper header information along with the request
        http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        if (restaurant.is_favorite == "true"){
            console.log("is favorite")
            var params = 'is_favorite=false';
            http.send(params);
            document.getElementById('is_favorite').innerHTML = '&#9734;';
            document.getElementById('is_favorite').classList.remove("favorite");
            alert("Removed favorite")
        }else{
            console.log("not favorite")
            var params = 'is_favorite=true';
            http.send(params);
            console.log("change to favorite")
            document.getElementById('is_favorite').innerHTML = '&#9733;';
            document.getElementById('is_favorite').classList.add("favorite");
            alert("add favorite")
        }
      }
    }
  });
}

function toggleForm() {
    var x = document.getElementById("togglable-form");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function addReview(){
  var submittedForm = document.getElementById("add-review-form");
  var formData = new FormData(submittedForm);
  var data = {"updatedAt":Date.now(), "createdAt":Date.now()};
  formData.forEach(function(value, key){
      data[key] = value;
  });
  console.log(data)
  saveReviewDataLocally(data);
}
