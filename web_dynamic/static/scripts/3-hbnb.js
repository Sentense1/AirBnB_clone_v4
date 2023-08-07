// This code will be executed once the DOM is ready
$(document).ready(init);

// The host URL for the API
const HOST = '0.0.0.0';

// Initialization function
function init() {
  // An object to store selected amenities
  const amenityObj = {};

  // Listen for changes on checkboxes inside the ".amenities .popover" element
  $('.amenities .popover input').change(function () {
    // If the checkbox is checked, add its data-name and data-id to the amenityObj
    if ($(this).is(':checked')) {
      amenityObj[$(this).attr('data-name')] = $(this).attr('data-id');
    } else if ($(this).is(':not(:checked)')) {
      // If the checkbox is unchecked, remove its data-name from the amenityObj
      delete amenityObj[$(this).attr('data-name')];
    }
    
    // Get the names of selected amenities, sort them, and update the content of the H4 element inside ".amenities"
    const names = Object.keys(amenityObj);
    $('.amenities h4').text(names.sort().join(', '));
  });

  // Call the apiStatus function to check the API status
  apiStatus();

  // Call the fetchPlaces function to load places data from the API
  fetchPlaces();
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

// Function to fetch places data from the API and display it on the webpage
function fetchPlaces() {
  // The API endpoint URL for fetching places data
  const PLACES_URL = `http://${HOST}:5001/api/v1/places_search/`;
  
  // Send a POST request to the API to get the places data
  $.ajax({
    url: PLACES_URL,
    type: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({}),
    success: function (response) {
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
        '</article>'];

        // Append the created HTML article to the "SECTION.places" element
        $('SECTION.places').append(article.join(''));
      }
    },
    error: function (error) {
      // If an error occurs, log the error to the console
      console.log(error);
    }
  });
}
