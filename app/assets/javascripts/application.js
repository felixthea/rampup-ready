// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//= require jquery
//= require jquery_ujs
//= require underscore
//= require backbone
//= require workwiki
//= require_tree ../templates
//= require_tree ./models
//= require_tree ./collections
//= require_tree ./views
//= require_tree ./routers
//= require_tree .
//= require jquery.serializeJSON.js

$(document).ready(function(){
  // Adding new words from the words#index page
  $('#new-word-form').on('ajax:success', function(event, data, xhr){
    event.preventDefault();
    $form = $(this);
    $('.words').append(data);
    $form[0].reset();
    flashNotice("Word Added");
  })

  // Deleting words from the words#index page (admin only)
  $('.words-list').on('click', '.delete-word', function(event){
    event.preventDefault();
    $wordId = $(event.target).attr("data-id")
    $.ajax({
      url: '/words/' + $wordId,
      type: 'DELETE',
      success: function(response){
        $('.words').find('#' + $wordId).remove();
        flashNotice("Word Deleted");
      }
    })
  })

  // Adding definitions from words#show
  $('#new-def-form').on('ajax:success', function(event, data, xhr){
    $form = $(this);
    $('.definitions ol').append(data);
    $form[0].reset();
    flashNotice("Definition Added");
  })

  // Deleting definitions from words#show
  $('.definitions').on('click', '.delete-definition', function(event){
    event.preventDefault();
    var definitionId = $(event.target).attr("data-id");
    $.ajax({
      url: '/definitions/' + definitionId,
      type: 'DELETE',
      success: function(response){
        $('.definitions #' + definitionId).remove();
        flashNotice("Definition Deleted")
      },
      error: function() {
        console.log("Error")
      }
    })
  })

  // Favoriting a definition in words#show
  $('.definitions').on('click', '.mark-favorite', function(event){
    event.preventDefault();
    var definitionId = $(event.target).attr("data-id");

    $.ajax({
      url: '/definitions/' + definitionId + '/favorite',
      type: 'POST',
      success: function(response) {
        flashNotice("Definition Favorited");
        swapFavorite(definitionId);
      },
      error: function(response) {
        flashNotice(response.responseText)
      }
    })
  })

  // Unfavoriting a definition in words#show
  $('.definitions').on('click', '.mark-unfavorite', function(event) {
    event.preventDefault();
    var definitionId = $(event.target).attr("data-id");

    $.ajax({
      url: '/definitions/' + definitionId + '/unfavorite',
      type: 'DELETE',
      success: function(response) {
        flashNotice("Definition Unfavorited");
        swapFavorite(definitionId);
      },
      error: function(response) {
        flashNotice(response.responseText);
      }
    })
  });

  // Upvoting a definition in words#show
  $('.definitions').on('click', '.upvote', function(event) {
    event.preventDefault();
    var definitionId = $(event.target).attr("data-id")

    $.ajax({
      url: '/definitions/' + definitionId + '/upvote',
      type: 'POST',
      success: function(response){
        flashNotice("Upvoted!");
        updateVoteCount(definitionId, response);
      },
      error: function(response){
        flashNotice(response.responseText);
      }
    })
  });

  // Downvoting definition in words#show
  $('.definitions').on('click', '.downvote', function(event){
    var definitionId = $(event.target).attr("data-id");

    $.ajax({
      url: '/definitions/' + definitionId + '/downvote',
      type: 'POST',
      success: function(response){
        flashNotice("Downvoted!");
        updateVoteCount(definitionId, response);
      },
      error: function(response){
        flashNotice(response.responseText);
      }
    })
  });

  // Adds more fields for admin to add users
  $('.more-users').on('click', function(event){
    $.ajax({
      url: '/users/add_more',
      type: 'GET',
      success: function(response){
        $('#submit-button').before(response);
      }
    })
  })

  // Displays and hides the additional menu for the inbox
  $('.nav-bar-inbox').on('click', 'a', function(event){
    event.preventDefault();
    $('.bottom-nav').toggleClass('hidden');
  })

  // Favoriting curriculum
  $('.unfavorite-curriculum').on('ajax:success', function(event, data, xhr){
    flashNotice("Curriculum unfavorited")
    swapFavoriteCurriculum();
  })

  // Unfavoriting curriculum
  $('.favorite-curriculum').on('ajax:success', function(event, data, xhr){
    flashNotice("Curriculum favorited")
    swapFavoriteCurriculum();
  })

  $('#compose-new-message').on('click', function(event){
    event.preventDefault();
    $('.compose-message-modal').toggleClass('hidden');
    $('.compose-message-modal').css("z-index",2)
    toggleLightbox();
  })

  $('#close-compose-message-modal').on('click', function(event){
    closeNewMessageModal();
    toggleLightbox();
  })

  $('#close-add-first-definition-modal').on('click', function(event){
    closeNewDefinitionModal();
    toggleLightbox();
  })

  // If message is sent successfully, close the lightbox and compose message modal
  $('.compose-message-form').on('ajax:success', function(event, data, xhr){
    $form = $(this);
    $form[0].reset();
    closeNewMessageModal();
    toggleLightbox();
    flashNotice("Message Sent");
  })

  // Remove all the modals and the lightbox whenever user clicks on area outside the lightbox
  $('.black_overlay').on('click', function(event){
    $('.modal').each(function(index,elem){
      var $elem = $(elem)
      if (!$elem.hasClass('hidden')){
        $elem.addClass('hidden');
      }
    })
    toggleLightbox();
  })

  $('.words-list').on('click', '.next-definition', function(event){
    var $allDefs = $(event.currentTarget).closest('div').find('li');
    var numDefs = $allDefs.length;
    var $currentDef = $allDefs.not('.hidden')
    var nextDef;

    if ((numDefs > 1) && ($currentDef.index() < numDefs-1)) {
      $nextDef = $currentDef.next();
      $nextDef.toggleClass('hidden');
      $currentDef.toggleClass('hidden');
    } else {
      $nextDef = $allDefs.first();
      $nextDef.toggleClass('hidden');
      $currentDef.toggleClass('hidden');
    }
  });

  // Checks if user email already exists in database.
  $('.sign-up-wrapper').on('blur', '#user_email', function(event){
    var userEmail = $(event.currentTarget).val();
    console.log("in blur event");
    $.ajax({
      url: '/users/valid_email',
      type: 'get',
      dataType: 'json',
      data: { email: userEmail },
      success: function(data, response, xhr){
        $('#valid-email-notice').html(data.message);
      },
      error: function() {
        console.log("error")
      }
    })
  })

  // Removes email validity message when the user tries to enter text into the box again.
  $('.sign-up-wrapper').on('focus', '#user_email', function(event){
    $('#valid-email-notice').empty();
  })

  $('.words-list').on('click', '#add-first-definition', function(event){
    var wordId = $(event.currentTarget).closest('div.word').attr("id");
    $('.add-first-definition-modal').removeClass('hidden');
    $('.add-first-definition-modal').css('z-index', 2);
    $('.add-first-definition-form #word-id').attr("value", wordId)
    toggleLightbox();
  })

  $('.add-first-definition-form').on('ajax:success', function(event, data, xhr){
    var wordId = data.definition.word_id;
    var $wordDiv = $('.word#' + wordId)
    var addFirstWordLink = $('.word#' + wordId + ' a#add-first-definition')
    var $defList;
    var newDef = data.definition;
    var defIndex = data.index + 1;
    var $defLi = $('<li></li>')

    $wordDiv.find('.one-definition').append($('<ul></ul>'));
    $defList = $wordDiv.find('ul')

    $defLi.html(defIndex + ".) " + newDef.body);
    $defList.html($defLi);
    closeNewDefinitionModal();
    toggleLightbox();
    addFirstWordLink.remove();
    console.log(data.definition);
  })

  // Helper function for showing notices/errors
  var flashNotice = function (message) {
    $('div.notices').empty();
    $('div.notices').fadeIn();
    $('div.notices').removeClass('hidden');
    $('div.notices').append(message);
    window.setTimeout(function() {
      $('div.notices').fadeOut();
    }, 3000)
  }

  // Helper function for hiding/unhiding the favorite/unfavorite definition button
  var swapFavorite = function (definitionId) {
		$('li#'+definitionId).find('.mark-unfavorite').toggleClass('hidden');
		$('li#'+definitionId).find('.mark-favorite').toggleClass('hidden');
  }

  // Helper function for hiding/unhiding the favorite/unfavorite curriculum button

  var swapFavoriteCurriculum = function () {
    $('.curriculum-wrapper').find('.favorite-curriculum').toggleClass('hidden');
    $('.curriculum-wrapper').find('.unfavorite-curriculum').toggleClass('hidden');
  }

  // Helper function for updating the total, upvote, and downvote count when voting.
  var updateVoteCount = function (definitionId, response) {
    var total = response.total
    var upvotes = response.upvotes
    var downvotes = response.downvotes
    $('li#' + definitionId).find('li#total-score').html("Total: " + total);
    $('li#' + definitionId).find('li#sum-upvotes').html("Up: " + upvotes);
    $('li#' + definitionId).find('li#sum-downvotes').html("Down: " + downvotes);
  }

  var closeNewMessageModal = function () {
    $('.compose-message-modal').toggleClass('hidden');
  }

  var closeNewDefinitionModal = function () {
    $('.add-first-definition-modal').toggleClass('hidden');
  }

  var toggleLightbox = function () {
    if ($('.black_overlay').css("display") == "none") {
      $('.black_overlay').css("display", "block");
    } else {
      $('.black_overlay').css("display", "none");
    }
  }
});