/* ============================================================
   HTAC BRIDGE
   FACULTY MANAGEMENT
   ============================================================ */

(function () {

    "use strict";


    /* ============================================================
       SETTINGS
    ============================================================ */

    var STORAGE_KEY = "htac_connect_faculty";

    var ADMIN_SESSION_KEY = "htac_admin_unlocked";

    /*
       Same administrator PIN concept used by announcements.
       Change this if you want a different PIN.
    */
    var ADMIN_PIN = "1234";


    /* ============================================================
       ELEMENTS
    ============================================================ */

    var facultyList =
        document.getElementById("facultyList");

    var facultyEmptyState =
        document.getElementById("facultyEmptyState");

    var adminButton =
        document.getElementById("facultyAdminButton");

    var adminPanel =
        document.getElementById("facultyAdminPanel");

    var addFacultyButton =
        document.getElementById("addFacultyButton");

    var facultyModal =
        document.getElementById("facultyModal");

    var facultyModalOverlay =
        document.getElementById("facultyModalOverlay");

    var closeFacultyModal =
        document.getElementById("closeFacultyModal");

    var cancelFacultyButton =
        document.getElementById("cancelFacultyButton");

    var facultyForm =
        document.getElementById("facultyForm");

    var facultyModalTitle =
        document.getElementById("facultyModalTitle");

    var facultyId =
        document.getElementById("facultyId");

    var facultyName =
        document.getElementById("facultyName");

    var facultyPosition =
        document.getElementById("facultyPosition");

    var facultyDepartment =
        document.getElementById("facultyDepartment");

    var facultyEmail =
        document.getElementById("facultyEmail");

    var facultyPhone =
        document.getElementById("facultyPhone");

    var facultyInfo =
        document.getElementById("facultyInfo");

    var facultyPhoto =
        document.getElementById("facultyPhoto");

    var facultyPhotoPreview =
        document.getElementById("facultyPhotoPreview");


    /* PIN MODAL */

    var facultyPinModal =
        document.getElementById("facultyPinModal");

    var facultyPinOverlay =
        document.getElementById("facultyPinOverlay");

    var facultyAdminPin =
        document.getElementById("facultyAdminPin");

    var facultyPinError =
        document.getElementById("facultyPinError");

    var unlockFaculty =
        document.getElementById("unlockFaculty");

    var cancelFacultyPin =
        document.getElementById("cancelFacultyPin");


    /* ============================================================
       DATA
    ============================================================ */

    var faculty = [];

    var currentPhoto = "";


    /* ============================================================
       INITIALIZE
    ============================================================ */

    /*
       Initialize whether this file is loaded normally or dynamically.
       When shared-data.js loads this file after DOMContentLoaded, the
       original DOMContentLoaded event has already fired, so waiting only
       for that event leaves the Add Faculty button without a click handler.
    */
    var facultyInitialized = false;

    function initializeFaculty() {

        if (facultyInitialized) {
            return;
        }

        facultyInitialized = true;

        loadFaculty();

        renderFaculty();

        checkAdminSession();

        bindEvents();
    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initializeFaculty
        );

    } else {

        initializeFaculty();

    }


    /* ============================================================
       LOAD FACULTY
    ============================================================ */

    function loadFaculty() {

        try {

            var stored =
                localStorage.getItem(STORAGE_KEY);

            if (stored) {

                faculty = JSON.parse(stored);

            } else {

                faculty = [];

            }

        } catch (error) {

            console.error(
                "Unable to load faculty data:",
                error
            );

            faculty = [];

        }

    }


    /* ============================================================
       SAVE FACULTY
    ============================================================ */

    function saveFaculty() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(faculty)
            );

        } catch (error) {

            alert(
                "Unable to save faculty information. " +
                "The browser storage may be full."
            );

        }

    }


    /* ============================================================
       RENDER FACULTY
    ============================================================ */

    function renderFaculty() {

        facultyList.innerHTML = "";

        if (!faculty || faculty.length === 0) {

            facultyEmptyState.style.display = "block";

            return;

        }

        facultyEmptyState.style.display = "none";


        faculty.forEach(function (member) {

            var card =
                document.createElement("article");

            card.className = "faculty-card";


            /* ----------------------------------------------------
               PHOTO
            ---------------------------------------------------- */

            var photoHtml = "";

            if (member.photo) {

                photoHtml =
                    '<img src="' +
                    escapeAttribute(member.photo) +
                    '" alt="' +
                    escapeAttribute(member.name) +
                    '">';

            } else {

                photoHtml =
                    '<div class="faculty-photo-placeholder">' +
                        '<span>👤</span>' +
                    '</div>';

            }


            /* ----------------------------------------------------
               CONTACT
            ---------------------------------------------------- */

            var contactHtml = "";


            if (member.email) {

                contactHtml +=
                    '<a href="mailto:' +
                    escapeAttribute(member.email) +
                    '" class="faculty-contact">' +
                        '<span>✉</span>' +
                        '<span>' +
                            escapeHtml(member.email) +
                        '</span>' +
                    '</a>';

            }


            if (member.phone) {

                contactHtml +=
                    '<a href="tel:' +
                    escapeAttribute(member.phone) +
                    '" class="faculty-contact">' +
                        '<span>☎</span>' +
                        '<span>' +
                            escapeHtml(member.phone) +
                        '</span>' +
                    '</a>';

            }


            /* ----------------------------------------------------
               ADMIN ACTIONS
            ---------------------------------------------------- */

            var adminHtml = "";

            if (isAdminUnlocked()) {

                adminHtml =
                    '<div class="faculty-card-actions">' +

                        '<button type="button"' +
                            ' class="faculty-edit"' +
                            ' data-id="' +
                            escapeAttribute(member.id) +
                            '">' +
                            'Edit' +
                        '</button>' +

                        '<button type="button"' +
                            ' class="faculty-delete"' +
                            ' data-id="' +
                            escapeAttribute(member.id) +
                            '">' +
                            'Delete' +
                        '</button>' +

                    '</div>';

            }


            /* ----------------------------------------------------
               CARD
            ---------------------------------------------------- */

            card.innerHTML =

                '<div class="faculty-card-photo">' +

                    photoHtml +

                '</div>' +


                '<div class="faculty-card-body">' +

                    '<div class="faculty-role">' +
                        escapeHtml(
                            member.position ||
                            "Faculty Member"
                        ) +
                    '</div>' +

                    '<h3>' +
                        escapeHtml(member.name) +
                    '</h3>' +

                    (
                        member.department
                            ?
                            '<div class="faculty-department">' +
                                escapeHtml(
                                    member.department
                                ) +
                            '</div>'
                            :
                            ''
                    ) +

                    (
                        member.info
                            ?
                            '<p class="faculty-info">' +
                                escapeHtml(member.info) +
                            '</p>'
                            :
                            ''
                    ) +

                    (
                        contactHtml
                            ?
                            '<div class="faculty-contact-list">' +
                                contactHtml +
                            '</div>'
                            :
                            ''
                    ) +

                    adminHtml +

                '</div>';


            facultyList.appendChild(card);

        });


        bindCardActions();

    }


    /* ============================================================
       CARD ACTIONS
    ============================================================ */

    function bindCardActions() {

        var editButtons =
            document.querySelectorAll(
                ".faculty-edit"
            );

        editButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    var id =
                        button.getAttribute("data-id");

                    editFaculty(id);

                }
            );

        });


        var deleteButtons =
            document.querySelectorAll(
                ".faculty-delete"
            );

        deleteButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    var id =
                        button.getAttribute("data-id");

                    deleteFaculty(id);

                }
            );

        });

    }


    /* ============================================================
       OPEN ADD MODAL
    ============================================================ */

    function openAddFaculty() {

        facultyForm.reset();

        facultyId.value = "";

        currentPhoto = "";

        facultyPhotoPreview.innerHTML =
            "<span>👤</span>";

        facultyModalTitle.textContent =
            "Add Faculty Member";

        openModal(facultyModal);

    }


    /* ============================================================
       OPEN EDIT MODAL
    ============================================================ */

    function editFaculty(id) {

        var member =
            faculty.find(function (item) {

                return item.id === id;

            });


        if (!member) {

            return;

        }


        facultyId.value =
            member.id || "";

        facultyName.value =
            member.name || "";

        facultyPosition.value =
            member.position || "";

        facultyDepartment.value =
            member.department || "";

        facultyEmail.value =
            member.email || "";

        facultyPhone.value =
            member.phone || "";

        facultyInfo.value =
            member.info || "";


        currentPhoto =
            member.photo || "";


        if (currentPhoto) {

            facultyPhotoPreview.innerHTML =
                '<img src="' +
                escapeAttribute(currentPhoto) +
                '" alt="Current photo">';

        } else {

            facultyPhotoPreview.innerHTML =
                "<span>👤</span>";

        }


        facultyPhoto.value = "";

        facultyModalTitle.textContent =
            "Edit Faculty Member";


        openModal(facultyModal);

    }


    /* ============================================================
       DELETE FACULTY
    ============================================================ */

    function deleteFaculty(id) {

        var member =
            faculty.find(function (item) {

                return item.id === id;

            });


        if (!member) {

            return;

        }


        var confirmed =
            confirm(
                "Are you sure you want to delete " +
                member.name +
                "?"
            );


        if (!confirmed) {

            return;

        }


        faculty =
            faculty.filter(function (item) {

                return item.id !== id;

            });


        saveFaculty();

        renderFaculty();

    }


    /* ============================================================
       SAVE FORM
    ============================================================ */

    facultyForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            var id =
                facultyId.value.trim();


            var memberData = {

                id:
                    id ||
                    generateId(),

                name:
                    facultyName.value.trim(),

                position:
                    facultyPosition.value.trim(),

                department:
                    facultyDepartment.value.trim(),

                email:
                    facultyEmail.value.trim(),

                phone:
                    facultyPhone.value.trim(),

                info:
                    facultyInfo.value.trim(),

                photo:
                    currentPhoto

            };


            if (!memberData.name) {

                alert(
                    "Please enter the faculty member's name."
                );

                facultyName.focus();

                return;

            }


            if (!memberData.position) {

                alert(
                    "Please enter the faculty member's position."
                );

                facultyPosition.focus();

                return;

            }


            /* ----------------------------------------------------
               EDIT EXISTING
            ---------------------------------------------------- */

            if (id) {

                var index =
                    faculty.findIndex(
                        function (item) {

                            return item.id === id;

                        }
                    );


                if (index !== -1) {

                    faculty[index] =
                        memberData;

                }

            }

            /* ----------------------------------------------------
               ADD NEW
            ---------------------------------------------------- */

            else {

                faculty.push(memberData);

            }


            saveFaculty();

            renderFaculty();

            closeModal(facultyModal);

        }
    );
    
/* ============================================================
   PHOTO UPLOAD
   Compress images before saving to Google Sheets.
============================================================ */

facultyPhoto.addEventListener("change", function () {

    var file = facultyPhoto.files[0];

    if (!file) {
        return;
    }

    if (!file.type || file.type.indexOf("image/") !== 0) {
        alert("Please select a valid image file.");
        facultyPhoto.value = "";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Please select an image smaller than 5 MB.");
        facultyPhoto.value = "";
        return;
    }

    var reader = new FileReader();

    reader.onload = function (event) {

        var image = new Image();

        image.onload = function () {

            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");

            var sizes = [400, 320, 256, 220, 180, 150];
            var qualities = [0.75, 0.65, 0.55, 0.45, 0.35];

            var compressedPhoto = "";

            for (var s = 0; s < sizes.length; s++) {

                var maxSize = sizes[s];
                var scale = Math.min(
                    1,
                    maxSize / Math.max(image.width, image.height)
                );

                canvas.width = Math.max(
                    1,
                    Math.round(image.width * scale)
                );

                canvas.height = Math.max(
                    1,
                    Math.round(image.height * scale)
                );

                context.fillStyle = "#FFFFFF";
                context.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                context.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                for (var q = 0; q < qualities.length; q++) {

                    compressedPhoto = canvas.toDataURL(
                        "image/jpeg",
                        qualities[q]
                    );

                    // Keep enough room for the other faculty fields.
                    if (compressedPhoto.length <= 30000) {
                        break;
                    }
                }

                if (compressedPhoto.length <= 30000) {
                    break;
                }
            }

            if (!compressedPhoto ||
                compressedPhoto.length > 30000) {

                alert(
                    "Unable to compress this picture sufficiently. " +
                    "Please select another image."
                );

                facultyPhoto.value = "";
                return;
            }

            // Update only after successful compression.
            currentPhoto = compressedPhoto;

            facultyPhotoPreview.innerHTML =
                '<img src="' +
                escapeAttribute(currentPhoto) +
                '" alt="Photo preview">';

            console.log(
                "Faculty photo compressed:",
                Math.round(currentPhoto.length / 1024) + " KB"
            );
        };

        image.onerror = function () {

            alert("Unable to process the selected picture.");
            facultyPhoto.value = "";

        };

        image.src = event.target.result;
    };

    reader.onerror = function () {

        alert("Unable to read the selected picture.");
        facultyPhoto.value = "";

    };

    reader.readAsDataURL(file);

});



    /* ============================================================
       ADMIN BUTTON
    ============================================================ */

    adminButton.addEventListener(
        "click",
        function () {

            if (isAdminUnlocked()) {

                lockAdmin();

            } else {

                facultyAdminPin.value = "";

                facultyPinError.textContent = "";

                openModal(facultyPinModal);

                setTimeout(
                    function () {

                        facultyAdminPin.focus();

                    },
                    100
                );

            }

        }
    );


    /* ============================================================
       UNLOCK ADMIN
    ============================================================ */

    unlockFaculty.addEventListener(
        "click",
        function () {

            unlockAdmin();

        }
    );


    facultyAdminPin.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                unlockAdmin();

            }

        }
    );


    function unlockAdmin() {

        var enteredPin =
            facultyAdminPin.value.trim();


        if (enteredPin === ADMIN_PIN) {

            sessionStorage.setItem(
                ADMIN_SESSION_KEY,
                "true"
            );

            sessionStorage.setItem("htac_admin_pin", enteredPin);

            closeModal(facultyPinModal);

            updateAdminUI();

            renderFaculty();

        } else {

            facultyPinError.textContent =
                "Incorrect administrator PIN.";

            facultyAdminPin.value = "";

            facultyAdminPin.focus();

        }

    }


    /* ============================================================
       LOCK ADMIN
    ============================================================ */

    function lockAdmin() {

        sessionStorage.removeItem(
            ADMIN_SESSION_KEY
        );

        sessionStorage.removeItem("htac_admin_pin");

        updateAdminUI();

        renderFaculty();

    }


    /* ============================================================
       ADMIN SESSION
    ============================================================ */

    function isAdminUnlocked() {

        return (
            sessionStorage.getItem(
                ADMIN_SESSION_KEY
            ) === "true"
        );

    }


    function checkAdminSession() {

        updateAdminUI();

    }


    function updateAdminUI() {

        if (isAdminUnlocked()) {

            adminPanel.style.display =
                "block";

            adminButton.innerHTML =
                "🔓 Admin Active";

            adminButton.classList.add(
                "admin-active"
            );

        } else {

            adminPanel.style.display =
                "none";

            adminButton.innerHTML =
                "🔐 Admin";

            adminButton.classList.remove(
                "admin-active"
            );

        }

    }


    /* ============================================================
       EVENTS
    ============================================================ */

    function bindEvents() {

        
	addFacultyButton.addEventListener(
    		"click",
    	function () {

        	if (!isAdminUnlocked()) {

            	alert("Please unlock the Faculty Admin panel first.");
            	return;

        }

        	openAddFaculty();

    		}
	);



        closeFacultyModal.addEventListener(
            "click",
            function () {

                closeModal(facultyModal);

            }
        );


        cancelFacultyButton.addEventListener(
            "click",
            function () {

                closeModal(facultyModal);

            }
        );


        facultyModalOverlay.addEventListener(
            "click",
            function () {

                closeModal(facultyModal);

            }
        );


        cancelFacultyPin.addEventListener(
            "click",
            function () {

                closeModal(facultyPinModal);

            }
        );


        facultyPinOverlay.addEventListener(
            "click",
            function () {

                closeModal(facultyPinModal);

            }
        );

    }


    /* ============================================================
       MODALS
    ============================================================ */

    function openModal(modal) {

        modal.classList.add("open");

        modal.setAttribute(
            "aria-hidden",
            "false"
        );

        document.body.classList.add(
            "modal-open"
        );

    }


    function closeModal(modal) {

        modal.classList.remove("open");

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

        if (
            !facultyModal.classList.contains("open") &&
            !facultyPinModal.classList.contains("open")
        ) {

            document.body.classList.remove(
                "modal-open"
            );

        }

    }


    /* ============================================================
       HELPERS
    ============================================================ */

    function generateId() {

        return (
            Date.now().toString(36) +
            Math.random()
                .toString(36)
                .substring(2, 8)
        );

    }


    function escapeHtml(value) {

        if (value === null ||
            value === undefined) {

            return "";

        }


        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function escapeAttribute(value) {

        return escapeHtml(value);

    }


})();