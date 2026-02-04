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

  // --- Registration Popup & Validation Logic ---

  function showPopup(message, type = "error") {
    const $popup = $("#Popup");
    if (!$popup.length) return;

    // Set text and theme
    $popup.text(message);
    $popup.removeClass("success error").addClass(type);

    // Add icon if possible (optional enhancement)
    const icon = type === "success" ? "check-circle" : "exclamation-circle";
    $popup.prepend(`<i class="fa-solid fa-${icon} me-2"></i>`);

    // Show popup
    $popup.addClass("show");

    // Auto-hide after 4 seconds
    setTimeout(() => {
      $popup.removeClass("show");
    }, 4000);
  }

  // Handle URL parameters for server-side messages
  const urlParams = new URLSearchParams(window.location.search);
  const messageParam = urlParams.get("message");

  if (messageParam === "success") {
    showPopup("Successfully registered! You can now login.", "success");
  } else if (messageParam === "empty") {
    showPopup("Please fill all fields.", "error");
  } else if (messageParam === "exists") {
    showPopup("This email is already registered.", "error");
  } else if (messageParam === "notfound") {
    showPopup("wrong password or email", "error");
  } else if (messageParam === "invalid") {
    showPopup("Please enter a valid email address.", "error");
  } else if (messageParam === "notenough") {
    showPopup("Not enough balance", "error");
  } else if (messageParam === "successAdded") {
    showPopup("Product added to cart", "success");
  }

  // Client-side validation on form submit
  $(".form-reg , .form-log").on("submit", function (e) {
    const inputs = $(this).find(
      'input[type="text"], input[type="email"], input[type="password"]',
    );
    let allFilled = true;

    inputs.each(function () {
      if ($(this).val().trim() === "") {
        allFilled = false;
        $(this).css("border-color", "red");
      } else {
        $(this).css("border-color", "black");
      }
    });

    if (!allFilled) {
      e.preventDefault();
      showPopup("Please fill all required fields.", "error");
      return;
    }

    // Email format validation
    const emailInput = $(this).find('input[name="email"]');
    const emailErr = $("#email-err");
    if (emailInput.length && !checkEmail(emailInput.val())) {
      e.preventDefault();
      emailInput.css("border-color", "red");
      emailErr.text("Invalid email address. must be gmail.com").fadeIn();
      return;
    } else {
      emailErr.hide();
    }
  });

  // Clear red border and error message on input
  $(".form-reg input, .form-log input").on("input", function () {
    if ($(this).val().trim() !== "") {
      $(this).css("border-color", "black");
    }
    if ($(this).attr("name") === "email") {
      $("#email-err").fadeOut();
    }
  });
});
