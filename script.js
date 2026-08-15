/* =========================================
   ORIONPULSE
   CLEAN JAVASCRIPT FOUNDATION
========================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       GROWTH SCANNER FORM
    ====================================== */

    const form =
        document.getElementById("growthScannerForm");

    const status =
        document.getElementById("formStatus");


    /*
       IMPORTANT:
       Replace this URL with the CURRENT
       Google Apps Script deployment URL.
    */

    const SCRIPT_URL =
        "PASTE_YOUR_APPS_SCRIPT_URL_HERE";


    if (form) {

        form.addEventListener("submit", async (event) => {

            event.preventDefault();


            if (status) {

                status.textContent =
                    "Preparing your growth assessment...";

            }


            const submitButton =
                form.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.innerHTML =
                    "Sending... <span>→</span>";

            }


            const formData =
                new FormData(form);


            try {

                await fetch(
                    SCRIPT_URL,
                    {
                        method: "POST",
                        mode: "no-cors",
                        body: formData
                    }
                );


                if (status) {

                    status.textContent =
                        "Thank you. Your growth assessment has been received.";

                }


                form.reset();


            } catch (error) {

                console.error(
                    "Growth Scanner error:",
                    error
                );


                if (status) {

                    status.textContent =
                        "Something went wrong. Please try again.";

                }

            }


            if (submitButton) {

                submitButton.disabled = false;

                submitButton.innerHTML =
                    "Build My Growth Plan <span>→</span>";

            }

        });

    }


    /* =====================================
       SMOOTH ANCHOR NAVIGATION
    ====================================== */

    document.querySelectorAll(
        'a[href^="#"]'
    ).forEach((link) => {

        link.addEventListener(
            "click",
            (event) => {

                const targetId =
                    link.getAttribute("href");

                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {
                    return;
                }


                event.preventDefault();


                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    });

});
