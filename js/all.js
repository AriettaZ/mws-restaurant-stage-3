class DBHelper{static get DATABASE_URL(){const port=1337;return`http://localhost:${port}/restaurants`}static fetchRestaurants(callback){let xhr=new XMLHttpRequest;xhr.open("GET",DBHelper.DATABASE_URL);xhr.onload=(()=>{if(xhr.status===200){const restaurants=JSON.parse(xhr.responseText);callback(null,restaurants)}else{const error=`Request failed. Returned status of ${xhr.status}`;callback(error,null)}});xhr.send()}static fetchRestaurantById(id,callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error){callback(error,null)}else{const restaurant=restaurants.find(r=>r.id==id);if(restaurant){callback(null,restaurant)}else{callback("Restaurant does not exist",null)}}})}static fetchRestaurantByCuisine(cuisine,callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error){callback(error,null)}else{const results=restaurants.filter(r=>r.cuisine_type==cuisine);callback(null,results)}})}static fetchRestaurantByNeighborhood(neighborhood,callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error){callback(error,null)}else{const results=restaurants.filter(r=>r.neighborhood==neighborhood);callback(null,results)}})}static fetchRestaurantByCuisineAndNeighborhood(cuisine,neighborhood,callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error){callback(error,null)}else{let results=restaurants;if(cuisine!="all"){results=results.filter(r=>r.cuisine_type==cuisine)}if(neighborhood!="all"){results=results.filter(r=>r.neighborhood==neighborhood)}callback(null,results)}})}static fetchNeighborhoods(callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error){callback(error,null)}else{const neighborhoods=restaurants.map((v,i)=>restaurants[i].neighborhood);const uniqueNeighborhoods=neighborhoods.filter((v,i)=>neighborhoods.indexOf(v)==i);callback(null,uniqueNeighborhoods)}})}static fetchCuisines(callback){DBHelper.fetchRestaurants((error,restaurants)=>{if(error){callback(error,null)}else{const cuisines=restaurants.map((v,i)=>restaurants[i].cuisine_type);const uniqueCuisines=cuisines.filter((v,i)=>cuisines.indexOf(v)==i);callback(null,uniqueCuisines)}})}static urlForRestaurant(restaurant){return`./restaurant.html?id=${restaurant.id}`}static imageUrlForRestaurant(restaurant){return`/img/${restaurant.photograph}.jpg`}static imageSrcsetForRestaurant(restaurant){return`/images/${restaurant.photograph}-800_small_1x.jpg 1x, /images/${restaurant.photograph}-1600_large_2x.jpg 2x`}static mapMarkerForRestaurant(restaurant,map){const marker=new L.marker([restaurant.latlng.lat,restaurant.latlng.lng],{title:restaurant.name,alt:restaurant.name,url:DBHelper.urlForRestaurant(restaurant)});marker.addTo(newMap);return marker}}var request=indexedDB.open("restaurant_reviews",1);request.onupgradeneeded=function(event){var db=event.target.result;var objectStore=db.createObjectStore("restaurants",{keyPath:"name"});objectStore.createIndex("name","name",{unique:true});objectStore.transaction.oncomplete=function(event){fetch("http://localhost:1337/restaurants").then(function(response){return response.json()}).then(function(json){console.log(json);var restaurantObjectStore=db.transaction("restaurants","readwrite").objectStore("restaurants");json.forEach(function(restaurant){restaurantObjectStore.add(restaurant)})})}};let restaurants,neighborhoods,cuisines;var newMap;var markers=[];document.addEventListener("DOMContentLoaded",event=>{initMap();fetchNeighborhoods();fetchCuisines()});fetchNeighborhoods=(()=>{DBHelper.fetchNeighborhoods((error,neighborhoods)=>{if(error){console.error(error)}else{self.neighborhoods=neighborhoods;fillNeighborhoodsHTML()}})});fillNeighborhoodsHTML=((neighborhoods=self.neighborhoods)=>{const select=document.getElementById("neighborhoods-select");neighborhoods.forEach(neighborhood=>{const option=document.createElement("option");option.innerHTML=neighborhood;option.value=neighborhood;select.append(option)})});fetchCuisines=(()=>{DBHelper.fetchCuisines((error,cuisines)=>{if(error){console.error(error)}else{self.cuisines=cuisines;fillCuisinesHTML()}})});fillCuisinesHTML=((cuisines=self.cuisines)=>{const select=document.getElementById("cuisines-select");cuisines.forEach(cuisine=>{const option=document.createElement("option");option.innerHTML=cuisine;option.value=cuisine;select.append(option)})});initMap=(()=>{self.newMap=L.map("map",{center:[40.722216,-73.987501],zoom:12,scrollWheelZoom:false});L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",{mapboxToken:"pk.eyJ1IjoicWlhbnl1YW56aHU5NyIsImEiOiJjamtyMjExNWMyMDUwM3h0aG4xaWh0dmZsIn0.-_N5UANrtisVtypbF3yatQ",maxZoom:18,attribution:'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, '+'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '+'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',id:"mapbox.streets"}).addTo(newMap);updateRestaurants()});updateRestaurants=(()=>{const cSelect=document.getElementById("cuisines-select");const nSelect=document.getElementById("neighborhoods-select");const cIndex=cSelect.selectedIndex;const nIndex=nSelect.selectedIndex;const cuisine=cSelect[cIndex].value;const neighborhood=nSelect[nIndex].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine,neighborhood,(error,restaurants)=>{if(error){console.error(error)}else{resetRestaurants(restaurants);fillRestaurantsHTML()}})});resetRestaurants=(restaurants=>{self.restaurants=[];const ul=document.getElementById("restaurants-list");ul.innerHTML="";if(self.markers){self.markers.forEach(marker=>marker.remove())}self.markers=[];self.restaurants=restaurants});fillRestaurantsHTML=((restaurants=self.restaurants)=>{const ul=document.getElementById("restaurants-list");restaurants.forEach(restaurant=>{ul.append(createRestaurantHTML(restaurant))});addMarkersToMap()});createRestaurantHTML=(restaurant=>{const li=document.createElement("li");const image=document.createElement("img");image.className="restaurant-img";image.src=DBHelper.imageUrlForRestaurant(restaurant);image.srcset=DBHelper.imageSrcsetForRestaurant(restaurant);li.append(image);const name=document.createElement("h1");name.innerHTML=restaurant.name;image.alt=restaurant.name;li.append(name);const neighborhood=document.createElement("p");neighborhood.innerHTML=restaurant.neighborhood;li.append(neighborhood);const address=document.createElement("p");address.innerHTML=restaurant.address;li.append(address);const more=document.createElement("a");more.innerHTML="View Details";more.href=DBHelper.urlForRestaurant(restaurant);li.append(more);return li});addMarkersToMap=((restaurants=self.restaurants)=>{restaurants.forEach(restaurant=>{const marker=DBHelper.mapMarkerForRestaurant(restaurant,self.newMap);marker.on("click",onClick);function onClick(){window.location.href=marker.options.url}self.markers.push(marker)})});let restaurant;var newMap;document.addEventListener("DOMContentLoaded",event=>{initMap()});initMap=(()=>{fetchRestaurantFromURL((error,restaurant)=>{if(error){console.error(error)}else{self.newMap=L.map("map",{center:[restaurant.latlng.lat,restaurant.latlng.lng],zoom:16,scrollWheelZoom:false});L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",{mapboxToken:"pk.eyJ1IjoicWlhbnl1YW56aHU5NyIsImEiOiJjamtyMjExNWMyMDUwM3h0aG4xaWh0dmZsIn0.-_N5UANrtisVtypbF3yatQ",maxZoom:18,attribution:'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, '+'<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '+'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',id:"mapbox.streets"}).addTo(newMap);fillBreadcrumb();DBHelper.mapMarkerForRestaurant(self.restaurant,self.newMap)}})});fetchRestaurantFromURL=(callback=>{if(self.restaurant){callback(null,self.restaurant);return}const id=getParameterByName("id");if(!id){error="No restaurant id in URL";callback(error,null)}else{DBHelper.fetchRestaurantById(id,(error,restaurant)=>{self.restaurant=restaurant;if(!restaurant){console.error(error);return}fillRestaurantHTML();callback(null,restaurant)})}});fillRestaurantHTML=((restaurant=self.restaurant)=>{const name=document.getElementById("restaurant-name");name.innerHTML=restaurant.name;const address=document.getElementById("restaurant-address");address.innerHTML=restaurant.address;const image=document.getElementById("restaurant-img");image.className="restaurant-img";image.src=DBHelper.imageUrlForRestaurant(restaurant);image.srcset=DBHelper.imageSrcsetForRestaurant(restaurant);image.alt=restaurant.name;const cuisine=document.getElementById("restaurant-cuisine");cuisine.innerHTML=restaurant.cuisine_type;if(restaurant.operating_hours){fillRestaurantHoursHTML()}fillReviewsHTML()});fillRestaurantHoursHTML=((operatingHours=self.restaurant.operating_hours)=>{const hours=document.getElementById("restaurant-hours");for(let key in operatingHours){const row=document.createElement("tr");const day=document.createElement("td");day.innerHTML=key;row.appendChild(day);const time=document.createElement("td");time.innerHTML=operatingHours[key];row.appendChild(time);hours.appendChild(row)}});fillReviewsHTML=((reviews=self.restaurant.reviews)=>{const container=document.getElementById("reviews-container");const title=document.createElement("h2");title.innerHTML="Reviews";container.appendChild(title);if(!reviews){const noReviews=document.createElement("p");noReviews.innerHTML="No reviews yet!";container.appendChild(noReviews);return}const ul=document.getElementById("reviews-list");reviews.forEach(review=>{ul.appendChild(createReviewHTML(review))});container.appendChild(ul)});createReviewHTML=(review=>{const li=document.createElement("li");const name=document.createElement("p");name.innerHTML=review.name;li.appendChild(name);const date=document.createElement("p");date.innerHTML=review.date;li.appendChild(date);const rating=document.createElement("p");rating.innerHTML=`Rating: ${review.rating}`;li.appendChild(rating);const comments=document.createElement("p");comments.innerHTML=review.comments;li.appendChild(comments);return li});fillBreadcrumb=((restaurant=self.restaurant)=>{const breadcrumb=document.getElementById("breadcrumb");const li=document.createElement("li");li.innerHTML=restaurant.name;breadcrumb.appendChild(li)});getParameterByName=((name,url)=>{if(!url)url=window.location.href;name=name.replace(/[\[\]]/g,"\\$&");const regex=new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),results=regex.exec(url);if(!results)return null;if(!results[2])return"";return decodeURIComponent(results[2].replace(/\+/g," "))});