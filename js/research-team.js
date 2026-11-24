/* =========================================================
   RESEARCH TEAM
   Rating & Comment System
========================================================= */

function initializeResearchTeam() {
    // Prevent duplicate event handlers if this script is loaded more than once.
    if (window.htacResearchTeamInitialized) {
        return;
    }
    window.htacResearchTeamInitialized = true;

    /* =========================================================
       STORAGE KEYS
    ========================================================== */

    const RATING_STORAGE_KEY = "htac_research_ratings";
    const COMMENT_STORAGE_KEY = "htac_research_comments";
    const RATING_VISITOR_KEY = "htac_research_rating_visitor_id";

    // Anonymous visitors keep one stable ID in this browser so changing
    // their star selection updates their existing rating instead of adding
    // a new rating every time they click.
    function getRatingVisitorId() {
        let visitorId = localStorage.getItem(RATING_VISITOR_KEY);

        if (!visitorId) {
            visitorId = "visitor_" + Date.now().toString(36) + "_" +
                Math.random().toString(36).substring(2, 12);
            localStorage.setItem(RATING_VISITOR_KEY, visitorId);
        }

        return visitorId;
    }


    /* =========================================================
       ADMIN SETTINGS
    ========================================================== */

    // Change this PIN to your preferred admin PIN.
    const ADMIN_PIN = "1234";


    /* =========================================================
       ELEMENTS
    ========================================================== */

    const starButtons =
        document.querySelectorAll("#starRating button");

    const averageRating =
        document.getElementById("averageRating");

    const averageStars =
        document.getElementById("averageStars");

    const ratingCount =
        document.getElementById("ratingCount");

    const ratingMessage =
        document.getElementById("ratingMessage");

    const commentForm =
        document.getElementById("commentForm");

    const commentName =
        document.getElementById("commentName");

    const commentRole =
        document.getElementById("commentRole");

    const commentText =
        document.getElementById("commentText");

    const commentsList =
        document.getElementById("commentsList");

    const commentsEmpty =
        document.getElementById("commentsEmpty");

    const commentCount =
        document.getElementById("commentCount");


    /* =========================================================
       SELECTED RATING
    ========================================================== */

    let selectedRating = 0;


    /* =========================================================
       LOAD RATINGS
    ========================================================== */

    function getRatings() {

        try {

            const storedRatings =
                localStorage.getItem(
                    RATING_STORAGE_KEY
                );


            if (!storedRatings) {
                return [];
            }


            const ratings =
                JSON.parse(storedRatings);


            return Array.isArray(ratings)
                ? ratings
                : [];

        } catch (error) {

            console.error(
                "Unable to load ratings:",
                error
            );

            return [];

        }

    }


    /* =========================================================
       SAVE RATINGS
    ========================================================== */

    function saveRatings(ratings) {

        try {

            localStorage.setItem(
                RATING_STORAGE_KEY,
                JSON.stringify(ratings)
            );

        } catch (error) {

            console.error(
                "Unable to save ratings:",
                error
            );

        }

    }


    /* =========================================================
       LOAD COMMENTS
    ========================================================== */

    function getComments() {

        try {

            const storedComments =
                localStorage.getItem(
                    COMMENT_STORAGE_KEY
                );


            if (!storedComments) {
                return [];
            }


            const comments =
                JSON.parse(storedComments);


            return Array.isArray(comments)
                ? comments
                : [];

        } catch (error) {

            console.error(
                "Unable to load comments:",
                error
            );

            return [];

        }

    }


    /* =========================================================
       SAVE COMMENTS
    ========================================================== */

    function saveComments(comments) {

        try {

            localStorage.setItem(
                COMMENT_STORAGE_KEY,
                JSON.stringify(comments)
            );

        } catch (error) {

            console.error(
                "Unable to save comments:",
                error
            );

        }

    }


    /* =========================================================
       STAR HOVER
    ========================================================== */

    starButtons.forEach(function (button) {

        button.addEventListener(
            "mouseenter",
            function () {

                const rating =
                    Number(button.dataset.rating);

                highlightStars(rating);

            }
        );


        button.addEventListener(
            "mouseleave",
            function () {

                highlightStars(selectedRating);

            }
        );


        /* =====================================================
           STAR CLICK
        ==================================================== */

        button.addEventListener(
            "click",
            function () {

                selectedRating =
                    Number(button.dataset.rating);

                highlightStars(selectedRating);

                submitRating(selectedRating);

            }
        );

    });


    /* =========================================================
       HIGHLIGHT STARS
    ========================================================== */

    function highlightStars(rating) {

        starButtons.forEach(function (button) {

            const buttonRating =
                Number(button.dataset.rating);


            if (buttonRating <= rating) {

                button.classList.add("selected");

            } else {

                button.classList.remove("selected");

            }

        });

    }


    /* =========================================================
       SUBMIT RATING
    ========================================================== */

    function submitRating(rating) {

        if (
            !rating ||
            rating < 1 ||
            rating > 5
        ) {
            return;
        }


        const ratings = getRatings();
        const visitorId = getRatingVisitorId();
        const existingIndex = ratings.findIndex(function (item) {
            return item && item.visitorId === visitorId;
        });

        const updatedRating = {
            visitorId: visitorId,
            rating: rating,
            date: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            // Update this visitor's existing rating instead of counting
            // each click as another vote.
            ratings[existingIndex] = updatedRating;
        } else {
            ratings.push(updatedRating);
        }

        saveRatings(ratings);


        if (ratingMessage) {

            ratingMessage.textContent =
                "Thank you for rating our research!";

        }


        updateRatingDisplay();

    }


    /* =========================================================
       UPDATE RATING DISPLAY
    ========================================================== */

    function updateRatingDisplay() {

        const ratings =
            getRatings();


        if (!averageRating ||
            !averageStars ||
            !ratingCount) {

            return;

        }


        if (ratings.length === 0) {

            averageRating.textContent =
                "0.0";

            averageStars.textContent =
                "☆☆☆☆☆";

            ratingCount.textContent =
                "No ratings yet";

            return;

        }


        const total =
            ratings.reduce(
                function (sum, item) {

                    return sum +
                        Number(item.rating);

                },
                0
            );


        const average =
            total / ratings.length;


        averageRating.textContent =
            average.toFixed(1);


        averageStars.textContent =
            createStars(average);


        ratingCount.textContent =
            ratings.length === 1
                ? "1 rating"
                : ratings.length + " ratings";

    }


    /* =========================================================
       CREATE STAR DISPLAY
    ========================================================== */

    function createStars(rating) {

        const roundedRating =
            Math.round(rating);


        let stars = "";


        for (
            let i = 1;
            i <= 5;
            i++
        ) {

            if (i <= roundedRating) {

                stars += "★";

            } else {

                stars += "☆";

            }

        }


        return stars;

    }


    /* =========================================================
       COMMENT FORM
    ========================================================== */

    if (commentForm) {

        commentForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const name =
                    commentName.value.trim();

                const role =
                    commentRole.value;

                const text =
                    commentText.value.trim();


                /* =================================================
                   VALIDATION
                ================================================== */

                if (!name || !text) {

                    alert(
                        "Please enter your name and comment."
                    );

                    return;

                }


                if (text.length > 500) {

                    alert(
                        "Your comment must be 500 characters or less."
                    );

                    return;

                }


                /* =================================================
                   GET EXISTING COMMENTS
                ================================================== */

                const comments =
                    getComments();


                /* =================================================
                   CREATE NEW COMMENT
                ================================================== */

                const newComment = {

                    id:
                        Date.now(),

                    name:
                        name,

                    role:
                        role,

                    text:
                        text,

                    date:
                        new Date().toISOString()

                };


                /* =================================================
                   ADD COMMENT
                ================================================== */

                comments.unshift(
                    newComment
                );


                saveComments(
                    comments
                );


                /* =================================================
                   RESET FORM
                ================================================== */

                commentForm.reset();


                /* =================================================
                   REFRESH COMMENTS
                ================================================== */

                renderComments();


                /* =================================================
                   BUTTON MESSAGE
                ================================================== */

                const button =
                    commentForm.querySelector(
                        ".primary-button"
                    );


                if (button) {

                    const originalText =
                        button.textContent;


                    button.textContent =
                        "Comment Posted ✓";


                    setTimeout(
                        function () {

                            button.textContent =
                                originalText;

                        },
                        2000
                    );

                }

            }
        );

    }


    /* =========================================================
       RENDER COMMENTS
    ========================================================== */

    function renderComments() {

        const comments =
            getComments();


        /* =====================================================
           EMPTY MESSAGE
        ==================================================== */

        if (commentsEmpty) {

            commentsEmpty.style.display =
                comments.length === 0
                    ? "block"
                    : "none";

        }


        /* =====================================================
           NO COMMENTS
        ==================================================== */

        if (comments.length === 0) {

            commentsList.innerHTML = "";


            if (commentsEmpty) {

                commentsList.appendChild(
                    commentsEmpty
                );

            }


            updateCommentCount(0);

            return;

        }


        /* =====================================================
           CLEAR LIST
        ==================================================== */

        commentsList.innerHTML = "";


        /* =====================================================
           DISPLAY COMMENTS
        ==================================================== */

        comments.forEach(function (comment) {

            const commentElement =
                createCommentElement(
                    comment
                );


            commentsList.appendChild(
                commentElement
            );

        });


        updateCommentCount(
            comments.length
        );

    }


    /* =========================================================
       CREATE COMMENT ELEMENT
    ========================================================== */

    function createCommentElement(comment) {

        const article =
            document.createElement("article");


        article.className =
            "comment-item";


        /* =====================================================
           HEADER
        ==================================================== */

        const header =
            document.createElement("div");


        header.className =
            "comment-item-header";


        /* =====================================================
           AUTHOR
        ==================================================== */

        const author =
            document.createElement("div");


        author.className =
            "comment-author";


        /* =====================================================
           AVATAR
        ==================================================== */

        const avatar =
            document.createElement("div");


        avatar.className =
            "comment-avatar";


        const firstLetter =
            comment.name
                .charAt(0)
                .toUpperCase();


        avatar.textContent =
            firstLetter;


        /* =====================================================
           AUTHOR INFO
        ==================================================== */

        const authorInfo =
            document.createElement("div");


        authorInfo.className =
            "comment-author-info";


        const authorName =
            document.createElement("span");


        authorName.className =
            "comment-author-name";


        authorName.textContent =
            comment.name;


        const authorRole =
            document.createElement("span");


        authorRole.className =
            "comment-author-role";


        authorRole.textContent =
            comment.role;


        authorInfo.appendChild(
            authorName
        );


        authorInfo.appendChild(
            authorRole
        );


        author.appendChild(
            avatar
        );


        author.appendChild(
            authorInfo
        );


        /* =====================================================
           DATE
        ==================================================== */

        const date =
            document.createElement("span");


        date.className =
            "comment-date";


        date.textContent =
            formatDate(
                comment.date
            );


        /* =====================================================
           BUILD HEADER
        ==================================================== */

        header.appendChild(
            author
        );


        header.appendChild(
            date
        );


        /* =====================================================
           COMMENT TEXT
        ==================================================== */

        const text =
            document.createElement("p");


        text.className =
            "comment-text";


        text.textContent =
            comment.text;


        /* =====================================================
           BUILD COMMENT
        ==================================================== */

        article.appendChild(
            header
        );


        article.appendChild(
            text
        );


        return article;

    }


    /* =========================================================
       UPDATE COMMENT COUNT
    ========================================================== */

    function updateCommentCount(count) {

        if (!commentCount) {
            return;
        }


        commentCount.textContent =
            count === 1
                ? "1 comment"
                : count + " comments";

    }


    /* =========================================================
       FORMAT DATE
    ========================================================== */

    function formatDate(dateString) {

        const date =
            new Date(dateString);


        if (isNaN(date.getTime())) {

            return "";

        }


        return date.toLocaleDateString(
            undefined,
            {
                year:
                    "numeric",

                month:
                    "short",

                day:
                    "numeric"
            }
        );

    }


    /* =========================================================
       ADMIN RESET
    ========================================================== */

    function resetResearchFeedback() {

        /* =====================================================
           ASK FOR ADMIN PIN
        ==================================================== */

        const enteredPin =
            prompt(
                "Enter Admin PIN to reset all ratings and comments:"
            );


        /* =====================================================
           CANCELLED
        ==================================================== */

        if (enteredPin === null) {
            return;
        }


        /* =====================================================
           CHECK PIN
        ==================================================== */

        if (enteredPin !== ADMIN_PIN) {

            alert(
                "Incorrect Admin PIN."
            );

            return;

        }


        /* =====================================================
           FINAL CONFIRMATION
        ==================================================== */

        sessionStorage.setItem("htac_admin_pin", enteredPin);

        const confirmed =
            confirm(
                "WARNING!\n\n" +
                "This will permanently remove ALL ratings and comments " +
                "saved on this browser.\n\n" +
                "Do you want to continue?"
            );


        if (!confirmed) {
            return;
        }


        /* =====================================================
           DELETE RATINGS
        ==================================================== */

        localStorage.setItem(RATING_STORAGE_KEY, JSON.stringify([]));


        /* =====================================================
           DELETE COMMENTS
        ==================================================== */

        localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify([]));


        /* =====================================================
           RESET SELECTED STAR
        ==================================================== */

        selectedRating = 0;


        highlightStars(0);


        /* =====================================================
           RESET MESSAGE
        ==================================================== */

        if (ratingMessage) {

            ratingMessage.textContent =
                "";

        }


        /* =====================================================
           REFRESH DISPLAY
        ==================================================== */

        updateRatingDisplay();

        renderComments();


        /* =====================================================
           SUCCESS MESSAGE
        ==================================================== */

        alert(
            "All ratings and comments have been successfully reset."
        );

    }


    /* =========================================================
       MAKE ADMIN RESET AVAILABLE TO HTML
    ========================================================== */

    window.resetResearchFeedback =
        resetResearchFeedback;


    /* =========================================================
       INITIALIZE PAGE
    ========================================================== */

    updateRatingDisplay();

    renderComments();
}

// shared-data.js can load this file after DOMContentLoaded has already fired.
// Initialize immediately in that case; otherwise wait for the DOM.
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeResearchTeam);
} else {
    initializeResearchTeam();
}