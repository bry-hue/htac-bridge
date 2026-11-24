/* ============================================================
   HTAC CONNECT
   ANNOUNCEMENT MANAGEMENT
   ============================================================ */


/* ============================================================
   CONFIGURATION
   ============================================================ */

/*
    IMPORTANT:

    Change this PIN to whatever you want.

    Example:
    1234
*/

var ADMIN_PIN = "1234";


/*
    localStorage key.

    Announcements will be saved inside the browser.
*/

var STORAGE_KEY = "htac_connect_announcements";


/* ============================================================
   DEFAULT ANNOUNCEMENTS
   ============================================================ */

var defaultAnnouncements = [

    {
        id: 1,
        title: "Parent-Teacher Meeting",
        date: "2026-09-15",
        category: "Parents",
        text: "Parents and guardians are invited to attend the scheduled Parent-Teacher Meeting. Please check with the school for the official time and venue."
    },

    {
        id: 2,
        title: "Grade 12 Research Presentation",
        date: "2026-09-20",
        category: "Students",
        text: "Grade 12 students are reminded to prepare their research presentations and required materials."
    },

    {
        id: 3,
        title: "School Community Activity",
        date: "2026-09-24",
        category: "Events",
        text: "Students, parents, and school personnel are invited to participate in the upcoming school community activity."
    },

    {
        id: 4,
        title: "Submission Deadline Reminder",
        date: "2026-09-28",
        category: "Deadlines",
        text: "Students are reminded to submit required academic outputs before the announced deadline."
    },

    {
        id: 5,
        title: "Welcome to HTAC Connect",
        date: "2026-09-01",
        category: "Students",
        text: "Welcome to HTAC Connect. This portal provides students and parents with convenient access to school announcements, schedules, resources, and important information."
    }

];


/* ============================================================
   LOAD ANNOUNCEMENTS
   ============================================================ */

function loadAnnouncements() {

    var saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(defaultAnnouncements)
        );

        return defaultAnnouncements.slice();

    }

    try {

        var data = JSON.parse(saved);

        if (Array.isArray(data)) {
            return data;
        }

    } catch (error) {

        console.log(
            "Unable to read saved announcements.",
            error
        );

    }

    return defaultAnnouncements.slice();
}


/* ============================================================
   GLOBAL DATA
   ============================================================ */

var announcements = loadAnnouncements();


/*
    Current public filters.

    Default values are assigned during initialization.
*/

var currentMonthFilter = "all";

var currentYearFilter = "all";

var currentCategory = "All";

var currentSort = "date-asc";


var editingAnnouncementId = null;

var deletingAnnouncementId = null;


/* ============================================================
   DOM ELEMENTS
   ============================================================ */

var list =
    document.getElementById(
        "announcementList"
    );


var announcementCount =
    document.getElementById(
        "announcementCount"
    );


var adminButton =
    document.getElementById(
        "adminButton"
    );


var adminLoginModal =
    document.getElementById(
        "adminLoginModal"
    );


var adminModal =
    document.getElementById(
        "adminModal"
    );


var announcementFormModal =
    document.getElementById(
        "announcementFormModal"
    );


var deleteModal =
    document.getElementById(
        "deleteModal"
    );


var adminAnnouncementList =
    document.getElementById(
        "adminAnnouncementList"
    );


/* ============================================================
   PUBLIC FILTER ELEMENTS
   ============================================================ */

var announcementMonth =
    document.getElementById(
        "announcementMonth"
    );


var announcementYear =
    document.getElementById(
        "announcementYear"
    );


var announcementCategoryFilter =
    document.getElementById(
        "announcementCategoryFilter"
    );


var announcementSort =
    document.getElementById(
        "announcementSort"
    );


var resetAnnouncementFilters =
    document.getElementById(
        "resetAnnouncementFilters"
    );


/* ============================================================
   SAVE DATA
   ============================================================ */

function saveAnnouncements() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(announcements)
    );

}


/* ============================================================
   DATE HELPERS
   ============================================================ */

/*
    Convert YYYY-MM-DD safely to a local Date object.

    This avoids timezone problems caused by:
        new Date("2026-09-01")
*/


function getAnnouncementDate(dateString) {

    if (!dateString) {
        return null;
    }

    var value = String(dateString).trim();

    // Handle YYYY-MM-DD without timezone shifting.
    var match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

    if (match) {
        var year = parseInt(match[1], 10);
        var month = parseInt(match[2], 10) - 1;
        var day = parseInt(match[3], 10);

        var localDate = new Date(year, month, day);

        if (
            localDate.getFullYear() !== year ||
            localDate.getMonth() !== month ||
            localDate.getDate() !== day
        ) {
            return null;
        }

        return localDate;
    }

    // Handle full dates returned by Google Sheets.
    var parsedDate = new Date(value);

    if (isNaN(parsedDate.getTime())) {
        return null;
    }

    return new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
    );
}


/* ============================================================
   FORMAT DATE
   ============================================================ */

function formatDate(dateString) {

    var date =
        getAnnouncementDate(dateString);


    if (!date) {
        return dateString || "";
    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );

}


/* ============================================================
   ESCAPE HTML
   ============================================================ */

/*
    Prevents user-entered announcement text from being
    interpreted as HTML.
*/

function escapeHtml(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ============================================================
   POPULATE YEAR FILTER
   ============================================================ */

function populateAnnouncementYears() {

    if (!announcementYear) {
        return;
    }


    /*
        Remember current selection.
    */

    var previousValue =
        announcementYear.value;


    /*
        Collect unique years.
    */

    var years = [];


    announcements.forEach(
        function (announcement) {

            var date =
                getAnnouncementDate(
                    announcement.date
                );


            if (!date) {
                return;
            }


            var year =
                date.getFullYear();


            if (
                years.indexOf(year) === -1
            ) {

                years.push(year);
            }

        }
    );


    /*
        Sort newest year first.
    */

    years.sort(
        function (a, b) {
            return b - a;
        }
    );


    /*
        Rebuild options.
    */

    announcementYear.innerHTML =
        '<option value="all">All Years</option>';


    years.forEach(
        function (year) {

            var option =
                document.createElement(
                    "option"
                );


            option.value = year;

            option.textContent = year;


            announcementYear.appendChild(
                option
            );

        }
    );


    /*
        Restore previous value when possible.
    */

    if (
        previousValue &&
        (
            previousValue === "all" ||
            years.indexOf(
                Number(previousValue)
            ) !== -1
        )
    ) {

        announcementYear.value =
            previousValue;

    }

}


/* ============================================================
   GET FILTERED ANNOUNCEMENTS
   ============================================================ */

function getFilteredAnnouncements() {

    var filtered =
        announcements.filter(
            function (announcement) {

                var date =
                    getAnnouncementDate(
                        announcement.date
                    );


                /*
                    Invalid dates are ignored by
                    month/year filtering.
                */

                if (!date) {

                    return (
                        currentMonthFilter === "all" &&
                        currentYearFilter === "all"
                    );

                }


                /* MONTH */

                if (
                    currentMonthFilter !== "all" &&
                    date.getMonth() !==
                        Number(currentMonthFilter)
                ) {

                    return false;
                }


                /* YEAR */

                if (
                    currentYearFilter !== "all" &&
                    date.getFullYear() !==
                        Number(currentYearFilter)
                ) {

                    return false;
                }


                /* CATEGORY */

                if (
                    currentCategory !== "All" &&
                    announcement.category !==
                        currentCategory
                ) {

                    return false;
                }


                return true;

            }
        );


    return filtered;

}


/* ============================================================
   SORT ANNOUNCEMENTS
   ============================================================ */

function sortAnnouncements(items) {

    return items.sort(
        function (a, b) {

            /*
                DATE ASCENDING
            */

            if (
                currentSort === "date-asc"
            ) {

                var dateA =
                    getAnnouncementDate(
                        a.date
                    );


                var dateB =
                    getAnnouncementDate(
                        b.date
                    );


                if (!dateA && !dateB) {
                    return 0;
                }


                if (!dateA) {
                    return 1;
                }


                if (!dateB) {
                    return -1;
                }


                return (
                    dateA.getTime() -
                    dateB.getTime()
                );

            }


            /*
                DATE DESCENDING
            */

            if (
                currentSort === "date-desc"
            ) {

                var latestA =
                    getAnnouncementDate(
                        a.date
                    );


                var latestB =
                    getAnnouncementDate(
                        b.date
                    );


                if (!latestA && !latestB) {
                    return 0;
                }


                if (!latestA) {
                    return 1;
                }


                if (!latestB) {
                    return -1;
                }


                return (
                    latestB.getTime() -
                    latestA.getTime()
                );

            }


            /*
                TITLE A-Z
            */

            if (
                currentSort === "title-asc"
            ) {

                return String(
                    a.title || ""
                ).localeCompare(
                    String(
                        b.title || ""
                    )
                );

            }


            /*
                TITLE Z-A
            */

            if (
                currentSort === "title-desc"
            ) {

                return String(
                    b.title || ""
                ).localeCompare(
                    String(
                        a.title || ""
                    )
                );

            }


            return 0;

        }
    );

}


/* ============================================================
   UPDATE FILTER LABEL
   ============================================================ */

function updateAnnouncementSummary() {

    if (!announcementCount) {
        return;
    }


    var filtered =
        getFilteredAnnouncements();


    var count =
        filtered.length;


    var text =
        count === 1
            ? "1 announcement"
            : count + " announcements";


    /*
        Add a small indication of the
        active month/year filter.
    */

    var filterText = "";


    if (
        currentMonthFilter !== "all" &&
        currentYearFilter !== "all"
    ) {

        var displayDate =
            new Date(
                Number(currentYearFilter),
                Number(currentMonthFilter),
                1
            );


        filterText =
            " · " +
            displayDate.toLocaleDateString(
                "en-US",
                {
                    month: "long",
                    year: "numeric"
                }
            );

    } else if (
        currentMonthFilter !== "all"
    ) {

        var monthDate =
            new Date(
                2000,
                Number(currentMonthFilter),
                1
            );


        filterText =
            " · " +
            monthDate.toLocaleDateString(
                "en-US",
                {
                    month: "long"
                }
            );

    } else if (
        currentYearFilter !== "all"
    ) {

        filterText =
            " · " +
            currentYearFilter;

    }


    announcementCount.textContent =
        text + filterText;

}


/* ============================================================
   RENDER PUBLIC ANNOUNCEMENTS
   ============================================================ */

function renderAnnouncements() {

    if (!list) {
        return;
    }


    var filtered =
        getFilteredAnnouncements();


    /*
        Sort a copy.

        This prevents the original announcement
        array from being permanently reordered.
    */

    filtered =
        filtered.slice();


    sortAnnouncements(
        filtered
    );


    updateAnnouncementSummary();


    /*
        Empty state.
    */

    if (filtered.length === 0) {

        list.innerHTML =

            '<div class="announcement-empty">' +

                '<div class="empty-icon">' +
                    '📢' +
                '</div>' +

                '<h3>' +
                    'No announcements found' +
                '</h3>' +

                '<p>' +
                    'There are no announcements matching the selected filters.' +
                '</p>' +

            '</div>';

        return;

    }


    /*
        Render cards.
    */

    list.innerHTML =

        filtered
            .map(
                function (announcement) {

                    var category =
                        announcement.category ||
                        "General";


                    return (

                        '<article class="announcement-card">' +

                            '<div class="announcement-card-top">' +

                                '<span class="announcement-date">' +

                                    escapeHtml(
                                        formatDate(
                                            announcement.date
                                        )
                                    ) +

                                '</span>' +


                                '<span class="badge badge-' +

                                    escapeHtml(
                                        category.toLowerCase()
                                    ) +

                                '">' +

                                    escapeHtml(
                                        category
                                    ) +

                                '</span>' +

                            '</div>' +


                            '<h2>' +

                                escapeHtml(
                                    announcement.title
                                ) +

                            '</h2>' +


                            '<p>' +

                                escapeHtml(
                                    announcement.text
                                ) +

                            '</p>' +


                            '<div class="announcement-card-footer">' +

                                '<span>' +
                                    'HTAC Bridge' +
                                '</span>' +

                                '<span class="announcement-arrow">' +
                                   ' ' + 
                                '</span>' +

                            '</div>' +

                        '</article>'

                    );

                }
            )
            .join("");

}


/* ============================================================
   INITIALIZE PUBLIC FILTERS
   ============================================================ */

function initializeAnnouncementFilters() {

    var today =
        new Date();


    /*
        DEFAULT:

        Current month
        Current year
    */

    currentMonthFilter =
        String(
            today.getMonth()
        );


    currentYearFilter =
        String(
            today.getFullYear()
        );


    currentCategory =
        "All";


    currentSort =
        "date-asc";


    /*
        Populate years first.
    */

    populateAnnouncementYears();


    /*
        Apply default values to controls.
    */

    if (announcementMonth) {

        announcementMonth.value =
            currentMonthFilter;

    }


    if (announcementYear) {

        /*
            If current year exists in the
            announcement data, select it.

            Otherwise fall back to All Years.
        */

        var currentYearExists =
            Array.prototype.some.call(
                announcementYear.options,
                function (option) {

                    return (
                        option.value ===
                        currentYearFilter
                    );

                }
            );


        if (currentYearExists) {

            announcementYear.value =
                currentYearFilter;

        } else {

            announcementYear.value =
                "all";

            currentYearFilter =
                "all";
        }

    }


    if (announcementCategoryFilter) {

        announcementCategoryFilter.value =
            "All";

    }


    if (announcementSort) {

        announcementSort.value =
            "date-asc";

    }


    renderAnnouncements();

}


/* ============================================================
   MONTH FILTER
   ============================================================ */

if (announcementMonth) {

    announcementMonth.addEventListener(
        "change",
        function () {

            currentMonthFilter =
                announcementMonth.value;


            renderAnnouncements();

        }
    );

}


/* ============================================================
   YEAR FILTER
   ============================================================ */

if (announcementYear) {

    announcementYear.addEventListener(
        "change",
        function () {

            currentYearFilter =
                announcementYear.value;


            renderAnnouncements();

        }
    );

}


/* ============================================================
   CATEGORY FILTER
   ============================================================ */

if (announcementCategoryFilter) {

    announcementCategoryFilter.addEventListener(
        "change",
        function () {

            currentCategory =
                announcementCategoryFilter.value;


            renderAnnouncements();

        }
    );

}


/* ============================================================
   SORT
   ============================================================ */

if (announcementSort) {

    announcementSort.addEventListener(
        "change",
        function () {

            currentSort =
                announcementSort.value;


            renderAnnouncements();

        }
    );

}


/* ============================================================
   RESET FILTERS
   ============================================================ */

if (resetAnnouncementFilters) {

    resetAnnouncementFilters.addEventListener(
        "click",
        function () {

            var today =
                new Date();


            /*
                Reset to CURRENT month/year,
                not all months.
            */

            currentMonthFilter =
                String(
                    today.getMonth()
                );


            currentYearFilter =
                String(
                    today.getFullYear()
                );


            currentCategory =
                "All";


            currentSort =
                "date-asc";


            /*
                Update controls.
            */

            if (announcementMonth) {

                announcementMonth.value =
                    currentMonthFilter;

            }


            if (announcementYear) {

                var yearExists =
                    Array.prototype.some.call(
                        announcementYear.options,
                        function (option) {

                            return (
                                option.value ===
                                currentYearFilter
                            );

                        }
                    );


                if (yearExists) {

                    announcementYear.value =
                        currentYearFilter;

                } else {

                    announcementYear.value =
                        "all";

                    currentYearFilter =
                        "all";
                }

            }


            if (announcementCategoryFilter) {

                announcementCategoryFilter.value =
                    "All";

            }


            if (announcementSort) {

                announcementSort.value =
                    "date-asc";

            }


            renderAnnouncements();

        }
    );

}


/* ============================================================
   MODAL FUNCTIONS
   ============================================================ */

function openModal(modal) {

    if (!modal) {
        return;
    }


    modal.classList.add("show");


    modal.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.classList.add(
        "modal-open"
    );

}


function closeModal(modal) {

    if (!modal) {
        return;
    }


    modal.classList.remove("show");


    modal.setAttribute(
        "aria-hidden",
        "true"
    );


    var openModals =
        document.querySelectorAll(
            ".announcement-modal.show"
        );


    if (openModals.length === 0) {

        document.body.classList.remove(
            "modal-open"
        );

    }

}


/* ============================================================
   ADMIN BUTTON
   ============================================================ */

if (adminButton) {

    adminButton.addEventListener(
        "click",
        function () {

            var pinInput =
                document.getElementById(
                    "adminPin"
                );


            var loginError =
                document.getElementById(
                    "loginError"
                );


            if (pinInput) {

                pinInput.value = "";

            }


            if (loginError) {

                loginError.textContent = "";

            }


            openModal(
                adminLoginModal
            );


            setTimeout(
                function () {

                    if (pinInput) {

                        pinInput.focus();

                    }

                },
                100
            );

        }
    );

}


/* ============================================================
   ADMIN LOGIN
   ============================================================ */

var adminLoginForm =
    document.getElementById(
        "adminLoginForm"
    );


if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            var pin =
                document.getElementById(
                    "adminPin"
                ).value;


            var loginError =
                document.getElementById(
                    "loginError"
                );


            if (pin === ADMIN_PIN) {

                sessionStorage.setItem(
                    "htac_admin_unlocked",
                    "true"
                );

                sessionStorage.setItem("htac_admin_pin", pin);


                closeModal(
                    adminLoginModal
                );


                renderAdminAnnouncements();


                openModal(
                    adminModal
                );

            } else {

                loginError.textContent =
                    "Incorrect administrator PIN.";


                document.getElementById(
                    "adminPin"
                ).focus();

            }

        }
    );

}


/* ============================================================
   CHECK ADMIN SESSION
   ============================================================ */

function isAdminUnlocked() {

    return (
        sessionStorage.getItem(
            "htac_admin_unlocked"
        ) === "true"
    );

}


/* ============================================================
   ADMIN ANNOUNCEMENT LIST
   ============================================================ */

function renderAdminAnnouncements() {

    if (!adminAnnouncementList) {
        return;
    }


    if (announcements.length === 0) {

        adminAnnouncementList.innerHTML =

            '<div class="admin-empty">' +

                '<div>📢</div>' +

                '<h3>' +
                    'No announcements' +
                '</h3>' +

                '<p>' +
                    'Add your first announcement.' +
                '</p>' +

            '</div>';

        return;

    }


    var sorted =
        announcements
            .slice()
            .sort(
                function (a, b) {

                    var dateA =
                        getAnnouncementDate(
                            a.date
                        );


                    var dateB =
                        getAnnouncementDate(
                            b.date
                        );


                    if (!dateA && !dateB) {
                        return 0;
                    }


                    if (!dateA) {
                        return 1;
                    }


                    if (!dateB) {
                        return -1;
                    }


                    return (
                        dateA.getTime() -
                        dateB.getTime()
                    );

                }
            );


    adminAnnouncementList.innerHTML =

        sorted
            .map(
                function (announcement) {

                    return (

                        '<div class="admin-announcement-row">' +

                            '<div class="admin-announcement-info">' +

                                '<div class="admin-announcement-meta">' +

                                    '<span>' +

                                        escapeHtml(
                                            formatDate(
                                                announcement.date
                                            )
                                        ) +

                                    '</span>' +

                                    '<span class="badge">' +

                                        escapeHtml(
                                            announcement.category
                                        ) +

                                    '</span>' +

                                '</div>' +


                                '<strong>' +

                                    escapeHtml(
                                        announcement.title
                                    ) +

                                '</strong>' +


                                '<p>' +

                                    escapeHtml(
                                        announcement.text
                                    ) +

                                '</p>' +

                            '</div>' +


                            '<div class="admin-announcement-actions">' +

                                '<button class="edit-button" ' +
                                        'type="button" ' +
                                        'data-id="' +
                                            announcement.id +
                                        '">' +

                                    '✏ Edit' +

                                '</button>' +


                                '<button class="delete-button" ' +
                                        'type="button" ' +
                                        'data-id="' +
                                            announcement.id +
                                        '">' +

                                    '🗑 Delete' +

                                '</button>' +

                            '</div>' +

                        '</div>'

                    );

                }
            )
            .join("");


    /*
        Attach Edit buttons.
    */

    document
        .querySelectorAll(
            ".edit-button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        var id =
                            Number(
                                button.getAttribute(
                                    "data-id"
                                )
                            );


                        openEditAnnouncement(id);

                    }
                );

            }
        );


    /*
        Attach Delete buttons.
    */

    document
        .querySelectorAll(
            ".delete-button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        var id =
                            Number(
                                button.getAttribute(
                                    "data-id"
                                )
                            );


                        openDeleteAnnouncement(id);

                    }
                );

            }
        );

}


/* ============================================================
   ADD ANNOUNCEMENT
   ============================================================ */

var addAnnouncementButton =
    document.getElementById(
        "addAnnouncementButton"
    );


if (addAnnouncementButton) {

    addAnnouncementButton.addEventListener(
        "click",
        function () {

            openAddAnnouncement();

        }
    );

}


/* ============================================================
   OPEN ADD FORM
   ============================================================ */

function openAddAnnouncement() {

    editingAnnouncementId = null;


    document.getElementById(
        "announcementFormTitle"
    ).textContent =
        "Add Announcement";


    document.getElementById(
        "announcementForm"
    ).reset();


    document.getElementById(
        "announcementId"
    ).value = "";


    /*
        Default date = today.
    */

    var today =
        new Date();


    var year =
        today.getFullYear();


    var month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    var day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    document.getElementById(
        "announcementDate"
    ).value =
        year +
        "-" +
        month +
        "-" +
        day;


    openModal(
        announcementFormModal
    );

}


/* ============================================================
   OPEN EDIT FORM
   ============================================================ */

function openEditAnnouncement(id) {

    var announcement =
        announcements.find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );

            }
        );


    if (!announcement) {
        return;
    }


    editingAnnouncementId = id;


    document.getElementById(
        "announcementFormTitle"
    ).textContent =
        "Edit Announcement";


    document.getElementById(
        "announcementId"
    ).value =
        announcement.id;


    document.getElementById(
        "announcementTitle"
    ).value =
        announcement.title;


    document.getElementById(
        "announcementDate"
    ).value =
        announcement.date;


    document.getElementById(
        "announcementCategory"
    ).value =
        announcement.category;


    document.getElementById(
        "announcementText"
    ).value =
        announcement.text;


    openModal(
        announcementFormModal
    );

}


/* ============================================================
   SAVE ADD / EDIT FORM
   ============================================================ */

var announcementForm =
    document.getElementById(
        "announcementForm"
    );


if (announcementForm) {

    announcementForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            var title =
                document.getElementById(
                    "announcementTitle"
                ).value.trim();


            var date =
                document.getElementById(
                    "announcementDate"
                ).value;


            var category =
                document.getElementById(
                    "announcementCategory"
                ).value;


            var text =
                document.getElementById(
                    "announcementText"
                ).value.trim();


            if (
                !title ||
                !date ||
                !category ||
                !text
            ) {

                alert(
                    "Please complete all announcement fields."
                );

                return;

            }


            /* =================================================
               EDIT EXISTING
            ================================================= */

            if (
                editingAnnouncementId !== null
            ) {

                var existing =
                    announcements.find(
                        function (item) {

                            return (
                                Number(item.id) ===
                                Number(
                                    editingAnnouncementId
                                )
                            );

                        }
                    );


                if (existing) {

                    existing.title =
                        title;


                    existing.date =
                        date;


                    existing.category =
                        category;


                    existing.text =
                        text;

                }

            }


            /* =================================================
               ADD NEW
            ================================================= */

            else {

                var newAnnouncement = {

                    id: Date.now(),

                    title: title,

                    date: date,

                    category: category,

                    text: text

                };


                announcements.push(
                    newAnnouncement
                );

            }


            /*
                Save to browser.
            */

            saveAnnouncements();


            /*
                Refresh year list.

                This is important when a new
                announcement from another year
                is created.
            */

            populateAnnouncementYears();


            /*
                Refresh public list.

                Existing filters remain active.
            */

            renderAnnouncements();


            /*
                Refresh admin list.
            */

            renderAdminAnnouncements();


            /*
                Close form.
            */

            closeModal(
                announcementFormModal
            );


            /*
                Reset edit state.
            */

            editingAnnouncementId = null;

        }
    );

}


/* ============================================================
   DELETE ANNOUNCEMENT
   ============================================================ */

function openDeleteAnnouncement(id) {

    var announcement =
        announcements.find(
            function (item) {

                return (
                    Number(item.id) ===
                    Number(id)
                );

            }
        );


    if (!announcement) {
        return;
    }


    deletingAnnouncementId = id;


    document.getElementById(
        "deleteMessage"
    ).textContent =

        'Are you sure you want to delete "' +
        announcement.title +
        '"?';


    openModal(
        deleteModal
    );

}


/* ============================================================
   CONFIRM DELETE
   ============================================================ */

var confirmDelete =
    document.getElementById(
        "confirmDelete"
    );


if (confirmDelete) {

    confirmDelete.addEventListener(
        "click",
        function () {

            if (
                deletingAnnouncementId === null
            ) {

                return;

            }


            announcements =
                announcements.filter(
                    function (announcement) {

                        return (
                            Number(
                                announcement.id
                            ) !==
                            Number(
                                deletingAnnouncementId
                            )
                        );

                    }
                );


            /*
                Save changes.
            */

            saveAnnouncements();


            /*
                Refresh year options.
            */

            populateAnnouncementYears();


            /*
                Refresh public list.
            */

            renderAnnouncements();


            /*
                Refresh admin list.
            */

            renderAdminAnnouncements();


            /*
                Close delete confirmation.
            */

            closeModal(
                deleteModal
            );


            deletingAnnouncementId = null;

        }
    );

}


/* ============================================================
   LOGOUT / LOCK
   ============================================================ */

var logoutAdminButton =
    document.getElementById(
        "logoutAdminButton"
    );


if (logoutAdminButton) {

    logoutAdminButton.addEventListener(
        "click",
        function () {

            sessionStorage.removeItem(
                "htac_admin_unlocked"
            );


            closeModal(
                adminModal
            );

        }
    );

}


/* ============================================================
   CLOSE BUTTONS
   ============================================================ */

var closeAdminLogin =
    document.getElementById(
        "closeAdminLogin"
    );


if (closeAdminLogin) {

    closeAdminLogin.onclick =
        function () {

            closeModal(
                adminLoginModal
            );

        };

}


var closeAdminModal =
    document.getElementById(
        "closeAdminModal"
    );


if (closeAdminModal) {

    closeAdminModal.onclick =
        function () {

            closeModal(
                adminModal
            );

        };

}


var closeAnnouncementForm =
    document.getElementById(
        "closeAnnouncementForm"
    );


if (closeAnnouncementForm) {

    closeAnnouncementForm.onclick =
        function () {

            closeModal(
                announcementFormModal
            );

        };

}


var cancelAnnouncementForm =
    document.getElementById(
        "cancelAnnouncementForm"
    );


if (cancelAnnouncementForm) {

    cancelAnnouncementForm.onclick =
        function () {

            closeModal(
                announcementFormModal
            );

        };

}


var closeDeleteModal =
    document.getElementById(
        "closeDeleteModal"
    );


if (closeDeleteModal) {

    closeDeleteModal.onclick =
        function () {

            closeModal(
                deleteModal
            );

        };

}


var cancelDelete =
    document.getElementById(
        "cancelDelete"
    );


if (cancelDelete) {

    cancelDelete.onclick =
        function () {

            closeModal(
                deleteModal
            );

        };

}


/* ============================================================
   CLOSE WHEN CLICKING OUTSIDE MODAL
   ============================================================ */

document
    .querySelectorAll(
        ".announcement-modal-overlay"
    )
    .forEach(
        function (overlay) {

            overlay.addEventListener(
                "click",
                function () {

                    var modal =
                        overlay.parentElement;


                    closeModal(
                        modal
                    );

                }
            );

        }
    );


/* ============================================================
   ESC KEY
   ============================================================ */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Escape"
        ) {

            return;

        }


        document
            .querySelectorAll(
                ".announcement-modal.show"
            )
            .forEach(
                function (modal) {

                    closeModal(
                        modal
                    );

                }
            );

    }
);


/* ============================================================
   INITIALIZE
   ============================================================ */

initializeAnnouncementFilters();