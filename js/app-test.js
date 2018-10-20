// Initialize Firebase
var config = {
    apiKey: "AIzaSyB4XNFf1YPpcDiJ9OYbJmWrOvDstL6d-IE",
    authDomain: "clickbuttoncounter-f9383.firebaseapp.com",
    databaseURL: "https://clickbuttoncounter-f9383.firebaseio.com",
    projectId: "clickbuttoncounter-f9383",
    storageBucket: "clickbuttoncounter-f9383.appspot.com",
    messagingSenderId: "684445680723"
};
firebase.initializeApp(config);

var database = firebase.database();

//Test Info
// var testEvent = {
//     guests: [{
//         name: "Jason",
//         suggestions: ["empty"],
//         upVotesRemaining: 3,
//         downVotesRemaining: 3
//     }, {
//         name: "Joyce",
//         suggestions: ["empty", "Avatar", "Titanic", "Terminator 2"],
//         upVotesRemaining: 3,
//         downVotesRemaining: 3
//     }, {
//         name: "Isaac",
//         suggestions: ["empty", "ET", "Hook", "Jurassic Park"],
//         upVotesRemaining: 3,
//         downVotesRemaining: 3
//     }, {
//         name: "Elizabeth",
//         suggestions: ["empty", "The Shining", "Spartacus", "Full Metal Jacket"],
//         upVotesRemaining: 3,
//         downVotesRemaining: 3
//     }
//     ],
//     suggestionCap: 4,
//     eventDate: "Same time, same place",
//     eventName: "Demo Event",
//     suggestionList: [
//         "empty",
//         {
//             title: "The Shining",
//             poster: "https://m.media-amazon.com/images/M/MV5BZWFlYmY2MGEtZjVkYS00YzU4LTg0YjQtYzY1ZGE3NTA5NGQxXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_.jpg",
//             year: 1980,
//             plot: "Jack Nicholson goes hard on his fam.",
//             votes: 0
//         }, {
//             title: "Jurassic Park",
//             poster: "https://m.media-amazon.com/images/M/MV5BMjM2MDgxMDg0Nl5BMl5BanBnXkFtZTgwNTM2OTM5NDE@._V1_.jpg",
//             year: 1993,
//             plot: "DINO DNA!",
//             votes: 0
//         }, {
//             title: "Avatar",
//             poster: "https://m.media-amazon.com/images/M/MV5BMTYwOTEwNjAzMl5BMl5BanBnXkFtZTcwODc5MTUwMw@@._V1_.jpg",
//             year: 2009,
//             plot: "Only the highest grossing movie of all time!",
//             votes: 0
//         }
//     ]
// }

// database.ref("/test-event").set(testEvent);

var thisEvent = undefined;

database.ref("/test-event").on("value", function (snapshot) {
    thisEvent = snapshot.val();
    console.log(thisEvent.guests[0]);
    pageLoad();
})
//End Test Info
///////////////////////////////////////////////////

//On Page Load
function pageLoad() {
    $("#event-name").text(thisEvent.eventName);
    $("#event-date").text(thisEvent.eventDate);
    $("#saved-movies").empty();

    for (var i = 1; i < thisEvent.suggestionList.length; i++) {
        var newTitle = thisEvent.suggestionList[i].title;
        var newItem = $("<div>").addClass("suggestion-container").attr("data-item", i).attr("data-hidden", "true");

        var newTitleCard = $("<h3>").addClass("list-title").text(newTitle);

        var newDropDown = $("<div>").addClass("suggestion-info movie-" + i).attr("data-title", newTitle).attr("data-item", i);
        var newPoster = $("<img>").attr("src", thisEvent.suggestionList[i].poster).addClass("poster-img");
        newDropDown.append(newPoster);
        newDropDown.append("<p>" + thisEvent.suggestionList[i].year);
        newDropDown.append("<p>" + thisEvent.suggestionList[i].plot);

        newItem.append(newTitleCard, newDropDown);
        newDropDown.hide();
        $("#saved-movies").append(newItem);
    }
}

//Get Movie Data
function getMovieData(movie) {
    var queryURL = "https://api-public.guidebox.com/v2/search?api_key=784a0a8429f1789c7473e19007cce274f76df272&type=movie&field=title&query=" + movie;

    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        for (var i = 0; i < response.results.length; i++) {
            var newMovie = $("<p>").addClass("search-result").attr("data-id", response.results[i].id).attr("data-title", response.results[i].title).text(response.results[i].title + ", " + response.results[i].release_year);
            $("#movie-display").append(newMovie);
        }
    }) //end AJAX 
} //end Get Movie Data

$("#suggestion-submit").on("click", function (event) {
    event.preventDefault();
    var title = $("#suggestion-input").val().trim();
    $("#suggestion-input").val("");
    getMovieData(title);
})

$(document).on("click", ".search-result", function () {
    var newMovie = $(this).attr("data-title");
    var newId = $(this).attr("data-id");

    var newQuery = "http://api-public.guidebox.com/v2/movies/" + newId + "?api_key=784a0a8429f1789c7473e19007cce274f76df272"
    $.ajax({
        url: newQuery,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        if (thisEvent.guests[0].suggestions.length < thisEvent.suggestionCap) {
        var newSuggestion = {
            title: response.title,
            poster: response.poster_400x570,
            year: response.release_year,
            plot: response.overview,
            votes: 0
        }
        thisEvent.guests[0].suggestions.push(newMovie);
        thisEvent.suggestionList.push(newSuggestion);
        database.ref("/test-event").set(thisEvent);
        
    } else {
        alert("You've entered enough, haven't you?"); //DELETE THIS SHIT NO ALERTS JUST TESTING KTHNX
    }

    }) //end AJAX 

    $("#movie-display").empty();
})

//Display Movie Info on.Click
$(document).on("click", ".suggestion-container", function () {
    var whichMovie = $(this).attr("data-item");
    if ($(this).attr("data-hidden") === "true") {
        $(".movie-" + whichMovie).show();
        $(this).attr("data-hidden", "false");
    } else {
        $(".movie-" + whichMovie).hide();
        $(this).attr("data-hidden", "true");
    }
})

