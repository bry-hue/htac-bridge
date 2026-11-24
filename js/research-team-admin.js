/* =========================================================
   HTAC CONNECT - RESEARCH TEAM ADMIN
   Scope: about.html only

   FEATURES:
   - Admin PIN access
   - Add team member
   - Edit team member
   - Delete team member
   - Upload and compress profile photo
   - Synchronize through shared-data.js
========================================================= */

(function () {
    "use strict";

    if (window.htacResearchTeamAdminLoaded) {
        return;
    }

    window.htacResearchTeamAdminLoaded = true;

    /* =====================================================
       SETTINGS
    ====================================================== */

    var STORAGE_KEY = "htac_research_team";
    var ADMIN_PIN = "1234";

    var SESSION_PIN_KEY = "htac_admin_pin";

    var grid = document.getElementById("researchTeamGrid");
    var loginButton = document.getElementById("teamAdminLoginButton");
    var panel = document.getElementById("teamAdminPanel");
    var addButton = document.getElementById("teamAddMemberButton");
    var lockButton = document.getElementById("teamAdminLockButton");
    var status = document.getElementById("teamAdminStatus");

    if (!grid || !loginButton || !panel || !addButton || !lockButton) {
        return;
    }

    var members = [];
    var editingId = null;
    var modal = null;


    /* =====================================================
       HELPERS
    ====================================================== */

    function setStatus(message) {
        if (status) {
            status.textContent = message || "";
        }
    }

    function makeId() {
        return "member_" +
            Date.now().toString(36) + "_" +
            Math.random().toString(36).substring(2, 8);
    }

    function safeText(value) {
        return value == null ? "" : String(value);
    }

    function escapeHtml(value) {

        return safeText(value).replace(/[&<>"']/g, function (char) {

            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            }[char];

        });

    }

    function isAdminUnlocked() {

        return sessionStorage.getItem(SESSION_PIN_KEY) === ADMIN_PIN;

    }


    /* =====================================================
       LOAD MEMBERS
    ====================================================== */

    function readMembersFromStorage() {

        try {

            var raw = localStorage.getItem(STORAGE_KEY);

            var parsed = raw ? JSON.parse(raw) : [];

            return Array.isArray(parsed) ? parsed : [];

        } catch (error) {

            console.error(
                "Unable to read research team profiles:",
                error
            );

            return [];

        }

    }


    /* =====================================================
       INITIAL MIGRATION

       Reads existing static team cards once.
    ====================================================== */

    function seedMembersFromExistingCards() {

        var cards = grid.querySelectorAll(".team-card");

        var result = [];

        Array.prototype.forEach.call(cards, function (card) {

            var image = card.querySelector(".team-photo img");
            var role = card.querySelector(".team-role");
            var name = card.querySelector(".team-card-body h3");
            var basic = card.querySelector(".team-basic-info");
            var bio = card.querySelector(".team-bio");

            var detailSpans =
                card.querySelectorAll(".team-details span");

            if (!name) {
                return;
            }

            result.push({

                id: makeId(),

                name: name.textContent.trim(),

                role: role
                    ? role.textContent.trim()
                    : "Research Member",

                basicInfo: basic
                    ? basic.textContent.trim()
                    : "",

                bio: bio
                    ? bio.textContent.trim()
                    : "",

                contribution: detailSpans.length > 1
                    ? detailSpans[1].textContent.trim()
                    : "",

                photo: image
                    ? image.getAttribute("src")
                    : ""

            });

        });

        return result;

    }


    /* =====================================================
       SAVE MEMBERS

       shared-data.js intercepts localStorage changes
       and synchronizes the mapped team data.
    ====================================================== */

    function saveMembers() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(members)
            );

            setStatus(
                "Changes submitted for synchronization. " +
                "Reload the page after a moment to verify."
            );

        } catch (error) {

            console.error(
                "Unable to save research team profiles:",
                error
            );

            alert(
                "Unable to save the profiles. " +
                "The photo may be too large."
            );

        }

    }


    /* =====================================================
       RENDER MEMBERS
    ====================================================== */

    function renderMembers() {

        grid.innerHTML = "";

        if (!members.length) {

            var empty = document.createElement("p");

            empty.className = "team-admin-empty";

            empty.textContent =
                "No research team members have been added yet.";

            grid.appendChild(empty);

            return;

        }

        members.forEach(function (member) {

            var card = document.createElement("article");

            card.className = "team-card";

            card.setAttribute(
                "data-member-id",
                member.id || ""
            );

            var photo = member.photo || "";

            var imageHtml = photo

                ? '<img src="' + escapeHtml(photo) +
                  '" alt="' + escapeHtml(member.name) + '">'

                : '<div class="team-photo-placeholder" ' +
                  'aria-label="No profile photo">👤</div>';


            card.innerHTML =

                '<div class="team-photo">' +
                    imageHtml +
                '</div>' +

                '<div class="team-card-body">' +

                    '<span class="team-role">' +
                        escapeHtml(member.role) +
                    '</span>' +

                    '<h3>' +
                        escapeHtml(member.name) +
                    '</h3>' +

                    '<p class="team-basic-info">' +
                        escapeHtml(member.basicInfo) +
                    '</p>' +

                    '<p class="team-bio">' +
                        escapeHtml(member.bio) +
                    '</p>' +

                    '<div class="team-details">' +

                        '<div>' +
                            '<strong>Role</strong>' +
                            '<span>' +
                                escapeHtml(member.role) +
                            '</span>' +
                        '</div>' +

                        '<div>' +
                            '<strong>Contribution</strong>' +
                            '<span>' +
                                escapeHtml(member.contribution) +
                            '</span>' +
                        '</div>' +

                    '</div>' +

                '</div>' +

                '<div class="team-card-admin-actions">' +

                    '<button type="button" ' +
                        'class="edit" data-team-edit>' +
                        'Edit' +
                    '</button>' +

                    '<button type="button" ' +
                        'class="delete" data-team-delete>' +
                        'Delete' +
                    '</button>' +

                '</div>';

            grid.appendChild(card);

        });

        document.body.classList.toggle(
            "team-admin-unlocked",
            isAdminUnlocked()
        );

    }


    /* =====================================================
       MEMBER FORM MODAL
    ====================================================== */

    function ensureModal() {

        if (modal) {
            return;
        }

        modal = document.createElement("div");

        modal.className = "team-admin-modal";

        modal.innerHTML =

            '<div class="team-admin-dialog" ' +
                'role="dialog" aria-modal="true" ' +
                'aria-labelledby="teamMemberModalTitle">' +

                '<h3 id="teamMemberModalTitle">' +
                    'Add Research Team Member' +
                '</h3>' +

                '<form id="teamMemberForm">' +

                    '<label class="team-admin-field">' +
                        '<span>Full Name *</span>' +
                        '<input id="teamMemberName" ' +
                            'maxlength="80" required>' +
                    '</label>' +

                    '<label class="team-admin-field">' +
                        '<span>Role *</span>' +
                        '<input id="teamMemberRole" ' +
                            'maxlength="80" ' +
                            'value="Research Member" required>' +
                    '</label>' +

                    '<label class="team-admin-field">' +
                        '<span>Basic Information</span>' +
                        '<input id="teamMemberBasic" ' +
                            'maxlength="120" ' +
                            'placeholder="Grade 12 • Research Team">' +
                    '</label>' +

                    '<label class="team-admin-field">' +
                        '<span>Biography</span>' +
                        '<textarea id="teamMemberBio" ' +
                            'maxlength="1000"></textarea>' +
                    '</label>' +

                    '<label class="team-admin-field">' +
                        '<span>Contribution</span>' +
                        '<textarea id="teamMemberContribution" ' +
                            'maxlength="500"></textarea>' +
                    '</label>' +

                    '<label class="team-admin-field">' +
                        '<span>Profile Photo</span>' +
                        '<input id="teamMemberPhoto" ' +
                            'type="file" accept="image/*">' +
                    '</label>' +

                    '<p class="team-admin-help">' +
                        'Images are resized and compressed before saving. ' +
                        'A square or portrait photo works best.' +
                    '</p>' +

                    '<div class="team-admin-actions">' +

                        '<button type="submit" ' +
                            'class="team-admin-button">' +
                            'Save Member' +
                        '</button>' +

                        '<button type="button" ' +
                            'class="team-admin-button secondary" ' +
                            'id="teamMemberCancel">' +
                            'Cancel' +
                        '</button>' +

                    '</div>' +

                '</form>' +

            '</div>';

        document.body.appendChild(modal);


        modal.addEventListener("click", function (event) {

            if (event.target === modal) {
                closeModal();
            }

        });


        document.getElementById(
            "teamMemberCancel"
        ).addEventListener("click", closeModal);


        document.getElementById(
            "teamMemberForm"
        ).addEventListener("submit", submitMember);

    }


    /* =====================================================
       OPEN MODAL
    ====================================================== */

    function openModal(member) {

        ensureModal();

        editingId = member ? member.id : null;

        document.getElementById(
            "teamMemberModalTitle"
        ).textContent = member
            ? "Edit Research Team Member"
            : "Add Research Team Member";


        document.getElementById(
            "teamMemberName"
        ).value = member ? safeText(member.name) : "";


        document.getElementById(
            "teamMemberRole"
        ).value = member
            ? safeText(member.role)
            : "Research Member";


        document.getElementById(
            "teamMemberBasic"
        ).value = member
            ? safeText(member.basicInfo)
            : "Grade 12 • Research Team";


        document.getElementById(
            "teamMemberBio"
        ).value = member ? safeText(member.bio) : "";


        document.getElementById(
            "teamMemberContribution"
        ).value = member
            ? safeText(member.contribution)
            : "";


        document.getElementById(
            "teamMemberPhoto"
        ).value = "";


        modal.classList.add("is-open");

        document.getElementById(
            "teamMemberName"
        ).focus();

    }


    /* =====================================================
       CLOSE MODAL
    ====================================================== */

    function closeModal() {

        if (modal) {
            modal.classList.remove("is-open");
        }

        editingId = null;

    }


    /* =====================================================
       IMAGE COMPRESSION
    ====================================================== */

    function compressImage(file, callback) {

        if (!file) {

            callback(null);

            return;

        }

        if (!file.type ||
            file.type.indexOf("image/") !== 0) {

            alert("Please select a valid image file.");

            callback(false);

            return;

        }

        var reader = new FileReader();

        reader.onload = function (event) {

            var image = new Image();

            image.onload = function () {

                var canvas =
                    document.createElement("canvas");

                var maxSide = 700;

                var scale = Math.min(
                    1,
                    maxSide / Math.max(
                        image.width,
                        image.height
                    )
                );

                canvas.width = Math.max(
                    1,
                    Math.round(image.width * scale)
                );

                canvas.height = Math.max(
                    1,
                    Math.round(image.height * scale)
                );

                var context = canvas.getContext("2d");

                context.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                var quality = 0.78;

                var dataUrl = canvas.toDataURL(
                    "image/jpeg",
                    quality
                );

                while (
                    dataUrl.length > 30000 &&
                    quality > 0.35
                ) {

                    quality -= 0.08;

                    dataUrl = canvas.toDataURL(
                        "image/jpeg",
                        quality
                    );

                }

                if (dataUrl.length > 30000) {

                    alert(
                        "That photo is still too large after " +
                        "compression. Please choose a smaller image."
                    );

                    callback(false);

                    return;

                }

                callback(dataUrl);

            };


            image.onerror = function () {

                alert(
                    "Unable to read that image. Please try another file."
                );

                callback(false);

            };

            image.src = event.target.result;

        };


        reader.onerror = function () {

            alert("Unable to load the selected photo.");

            callback(false);

        };

        reader.readAsDataURL(file);

    }


    /* =====================================================
       ADD / UPDATE MEMBER
    ====================================================== */

    function submitMember(event) {

        event.preventDefault();

        var name = document.getElementById(
            "teamMemberName"
        ).value.trim();

        var role = document.getElementById(
            "teamMemberRole"
        ).value.trim();


        if (!name || !role) {

            alert(
                "Please enter the member's name and role."
            );

            return;

        }


        var file = document.getElementById(
            "teamMemberPhoto"
        ).files[0];


        var existing = editingId
            ? members.find(function (item) {
                return item.id === editingId;
            })
            : null;


        compressImage(file, function (photoResult) {

            if (photoResult === false) {
                return;
            }

            var member = {

                id: editingId || makeId(),

                name: name,

                role: role,

                basicInfo: document.getElementById(
                    "teamMemberBasic"
                ).value.trim(),

                bio: document.getElementById(
                    "teamMemberBio"
                ).value.trim(),

                contribution: document.getElementById(
                    "teamMemberContribution"
                ).value.trim(),

                photo: photoResult ||
                    (existing ? existing.photo : "")

            };


            if (editingId) {

                var index = members.findIndex(
                    function (item) {
                        return item.id === editingId;
                    }
                );

                if (index >= 0) {
                    members[index] = member;
                }

            } else {

                members.push(member);

            }


            closeModal();

            renderMembers();

            saveMembers();

        });

    }


    /* =====================================================
       ADMIN LOGIN
    ====================================================== */

    function unlockAdmin() {

        var enteredPin = prompt(
            "Enter Research Team Admin PIN:"
        );

        if (enteredPin === null) {
            return;
        }

        if (enteredPin !== ADMIN_PIN) {

            alert("Incorrect Admin PIN.");

            return;

        }

        sessionStorage.setItem(
            SESSION_PIN_KEY,
            enteredPin
        );

        document.body.classList.add(
            "team-admin-unlocked"
        );

        panel.classList.add("is-visible");

        loginButton.textContent = "🔓 Team Admin";

        renderMembers();

        setStatus("Admin mode unlocked.");

        // The first-time migration must only be sent after the admin PIN
        // is present, otherwise shared-data.js sends an unauthorized save.
        completeInitialMigrationIfAuthorized();

    }


    /* =====================================================
       ADMIN LOGOUT
    ====================================================== */

    function lockAdmin() {

        sessionStorage.removeItem(
            SESSION_PIN_KEY
        );

        document.body.classList.remove(
            "team-admin-unlocked"
        );

        panel.classList.remove("is-visible");

        loginButton.textContent = "🔒 Team Admin";

        setStatus("");

    }


    /* =====================================================
       EDIT / DELETE BUTTONS
    ====================================================== */

    grid.addEventListener("click", function (event) {

        var card = event.target.closest(".team-card");

        if (!card || !isAdminUnlocked()) {
            return;
        }

        var id = card.getAttribute("data-member-id");

        var member = members.find(function (item) {
            return item.id === id;
        });

        if (!member) {
            return;
        }


        if (event.target.closest("[data-team-edit]")) {

            openModal(member);

        } else if (
            event.target.closest("[data-team-delete]")
        ) {

            if (!confirm(
                "Delete " + member.name +
                " from the Research Team? " +
                "This change will be shared with all visitors."
            )) {
                return;
            }

            members = members.filter(function (item) {
                return item.id !== id;
            });

            renderMembers();

            saveMembers();

        }

    });


    /* =====================================================
       ADMIN BUTTON EVENTS
    ====================================================== */

    loginButton.addEventListener("click", function () {

        if (isAdminUnlocked()) {

            panel.classList.toggle("is-visible");

        } else {

            unlockAdmin();

        }

    });


    addButton.addEventListener("click", function () {

        if (!isAdminUnlocked()) {
            return;
        }

        openModal(null);

    });


    lockButton.addEventListener("click", lockAdmin);


    /* =====================================================
       INITIALIZE TEAM DATA

       If the backend has already been initialized,
       use the synchronized localStorage data.

       Otherwise, migrate the original static profiles
       exactly once.

       An initialized empty array must remain empty.
    ====================================================== */

    var initialized =
        window.HTACSharedTeamInitialized === true;

    var needsInitialMigration = !initialized;

    if (initialized) {

        members = readMembersFromStorage();

    } else {

        // Keep the existing static profiles in memory for now.
        // Do NOT write to localStorage until an admin has unlocked,
        // because the shared-data bridge requires the admin PIN.
        members = seedMembersFromExistingCards();

    }

    function completeInitialMigrationIfAuthorized() {

        if (!needsInitialMigration || !isAdminUnlocked()) {
            return;
        }

        saveMembers();
        needsInitialMigration = false;
        window.HTACSharedTeamInitialized = true;

    }


    /* =====================================================
       INITIAL RENDER
    ====================================================== */

    renderMembers();


    if (isAdminUnlocked()) {

        panel.classList.add("is-visible");

        loginButton.textContent = "🔓 Team Admin";

        completeInitialMigrationIfAuthorized();

    }

}());