// This script will execute when the document is ready
$('document').ready(function () {
  // Create an empty object to store the selected amenities
  const amenities = {};

  // Listen for changes on all checkboxes of type "checkbox"
  $('INPUT[type="checkbox"]').change(function () {
    // If the checkbox is checked, add its data-id and data-name to the amenities object
    if ($(this).is(':checked')) {
      amenities[$(this).attr('data-id')] = $(this).attr('data-name');
    } else {
      // If the checkbox is unchecked, remove its data-id from the amenities object
      delete amenities[$(this).attr('data-id')];
    }
    // Update the content of the H4 element inside elements with class "amenities" with the selected amenities
    $('.amenities H4').text(Object.values(amenities).join(', '));
  });
});
