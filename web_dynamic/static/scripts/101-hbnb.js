// This code will be executed once the DOM is ready
$(document).ready(init);

// The host URL for the API
const HOST = '0.0.0.0';

// Objects to store selected amenities, states, and cities respectively
const amenityObj = {};
const stateObj = {};
const cityObj = {};

// Global object used to keep track of the currently selected object (amenityObj, stateObj, or cityObj)
let obj = {};

// Initialization function
function init() {
  // Listen for changes on checkboxes inside the ".amenities .popover" element
  $('.amenities .popover input').change(function () { 
    obj = amenityObj; // Set the global object to amenityObj
    checkedObjects.call(this, 1); // Call the checkedObjects function with parameter 1
  });

  // Listen for changes on state input elements
  $('.state_input').change(function () { 
    obj = stateObj; // Set the global object to stateObj
    checkedObjects.call(this, 2); // Call the checkedObjects function with parameter 2
  });

  // Listen for changes on city input elements
  $('.city_input').change(function () { 
    obj = cityObj; // Set the global object to cityObj
    checkedObjects.call(this, 3); // Call the checkedObjects function with parameter 3
  });

  // Call the apiStatus function to check the API status
  apiStatus();

  // Call the searchPlaces function to fetch and display places data based on selected amenities, states, and cities
  searchPlaces();

  // Call the showReviews function to handle the display of reviews for each place
  showReviews();
}

// Function to handle the selection of objects (amenities, states, cities) and update the display accordingly
function checkedObjects(nObject) {
  if ($(this).is(':checked')) {
    obj[$(this).attr('data-name')] = $(this).attr('data-id');
  } else if ($(this).is(':not(:checked)')) {
    delete obj[$(this).attr('data-name')];
  }
  
  // Get the names of selected objects (amenities, states, cities), sort them, and update the corresponding H4 element
  const names = Object.keys(obj);
  if (nObject === 1) {
    $('.amenities h4').text(names.sort().join(', '));
  } else if (nObject === 2) {
    $('.locations h4').text(names.sort().join(', '));
  }
}

// Function to check the API status
function apiStatus() {
  // The API endpoint URL for status check
  const API_URL = `http://${HOST}:5001/api/v1/status/`;
  
  // Send a GET request to the API to get its status
  $.get(API_URL, (data, textStatus) => {
    // If the request is successful and the API status is 'OK', add the 'available' class to the element with ID 'api_status'
    if (textStatus === 'success' && data.status === 'OK') {
      $('#api_status').addClass('available');
    } else {
      // If the API status is not 'OK', remove the 'available' class from the element with ID 'api_status'
      $('#api_status').removeClass('available');
    }
  });
}

// Function to fetch places data based on selected amenities, states, and cities from the API and display it on the webpage
function searchPlaces() {
  // The API endpoint URL for fetching places data
  const PLACES_URL = `http://${HOST}:5001/api/v1/places_search/`;
  
  // Send a POST request to the API to get the places data based on selected amenities, states, and cities
  $.ajax({
    url: PLACES_URL,
    type: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({
      amenities: Object.values(amenityObj),
      states: Object.values(stateObj),
      cities: Object.values(cityObj)
    }),
    success: function (response) {
      // Clear the existing content inside "SECTION.places"
      $('SECTION.places').empty();

      // Iterate through the response data and create an HTML article element for each place
      for (const r of response) {
        const article = ['<article>',
          '<div class="title_box">',
          `<h2>${r.name}</h2>`,
          `<div class="price_by_night">$${r.price_by_night}</div>`,
          '</div>',
          '<div class="information">',
          `<div class="max_guest">${r.max_guest} Guest(s)</div>`,
          `<div class="number_rooms">${r.number_rooms} Bedroom(s)</div>`,
          `<div class="number_bathrooms">${r.number_bathrooms} Bathroom(s)</div>`,
          '</div>',
          '<div class="description">',
          `${r.description}`,
          '</div>',
          '<div class="reviews"><h2>',
          `<span id="${r.id}n" class="treview">Reviews</span>`,
          `<span id="${r.id}" onclick="showReviews(this)">Show</span></h2>`,
          `<ul id="${r.id}r"></ul>`,
          '</div>',
          '</article>'];
        $('SECTION.places').append(article.join(''));
      }
    },
    error: function (error) {
      // If an error occurs, log the error to the console
      console.log(error);
    }
  });
}

// Function to handle the display of reviews for each place
function showReviews(obj) {
  if (obj === undefined) {
    return;
  }
  if (obj.textContent === 'Show') {
    obj.textContent = 'Hide';
    // Send a GET request to the API to fetch reviews for the selected place (identified by obj.id)
    $.get(`http://${HOST}:5001/api/v1/places/${obj.id}/reviews`, (data, textStatus) => {
      if (textStatus === 'success') {
        // Update the "Reviews" span with the number of reviews
        $(`#${obj.id}n`).html(data.length + ' Reviews');
        // Iterate through the retrieved reviews and call printReview() for each review
        for (const review of data) {
          printReview(review, obj);
        }
      }
    });
  } else {
    // If the reviews are already shown, reset the "Show" button and clear the reviews list
    obj.textContent = 'Show';
    $(`#${obj.id}n`).html('Reviews');
    $(`#${obj.id}r`).empty();
  }
}

// Function to print an individual review for a place
function printReview(review, obj) {
  const date = new Date(review.created_at);
  const month = date.toLocaleString('en', { month: 'long' });
  const day = dateOrdinal(date.getDate());

  if (review.user_id) {
    // If the review has a user_id, send a GET request to the API to fetch the user's data
    $.get(`http://${HOST}:5001/api/v1/users/${review.user_id}`, (data, textStatus) => {
      if (textStatus === 'success') {
        // Append the review information to the reviews list
        $(`#${obj.id}r`).append(
          `<li><h3>From ${data.first_name} ${data.last_name} the ${day + ' ' + month + ' ' + date.getFullYear()}</h3>
          <p>${review.text}</p>
          </li>`);
      }
    });
  }
}

// Function to convert the day of the month to an ordinal representation (e.g., 1st, 2nd, 3rd, etc.)
function dateOrdinal(dom) {
  if (dom === 31 || dom === 21 || dom === 1) return dom + 'st';
  else if (dom === 22 || dom === 2) return dom + 'nd';
  else if (dom === 23 || dom === 3) return dom + 'rd';
  else return dom + 'th';
}
