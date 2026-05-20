document.addEventListener("DOMContentLoaded", () => {
    // Get all FAQ question headings.
    const faqItems = document.querySelectorAll(".faq-item h3");

    // Open or close an answer when its question is clicked.
    faqItems.forEach((item) => {
        item.addEventListener("click", () => {
            const answer = item.nextElementSibling;
            answer.classList.toggle("visible");

            if (answer.classList.contains("visible")) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = "0";
            }
        });
    });

    // Show a simple success message when the contact form is submitted.
    const contactForm = document.querySelector(".contact-form form");
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        const successMessage = document.createElement("p");
        successMessage.textContent = "Thank you for reaching out. We'll get back to you soon!";
        successMessage.style.color = "green";
        successMessage.style.marginTop = "20px";
        
        contactForm.parentElement.appendChild(successMessage);
        
        // Clear the form fields after showing the message.
        contactForm.reset();
    });
});
