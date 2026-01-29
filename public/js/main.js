$(document).ready(function () {
  $("form").css("display", "flex").hide().fadeIn(800);

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
  // Search and scroll functionality
  $("#searchBtn").click(function () {
    const categoryName = $("#categorySearch").val().trim();
    if (categoryName) {
      const section = $(`#${categoryName}`);
      if (section.length) {
        $("html, body").animate(
          {
            scrollTop: section.offset().top - 80, // Offset for sticky navbar
          },
          800,
        );
      } else {
        alert("Category not found!");
      }
    }
  });
});


