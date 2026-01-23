$(document).ready(function () {
  $("form")
    .css("display", "flex")
    .hide()
    .fadeIn(800);

  // Hamburger menu toggle
  $("#navToggle").click(function () {
    $(this).toggleClass("active");
    $("#navMenu").toggleClass("show");
  });

  // Close menu when clicking on a link
  $("#navMenu a").click(function () {
    $("#navToggle").removeClass("active");
    $("#navMenu").removeClass("show");
  });
});
