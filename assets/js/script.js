document.addEventListener('DOMContentLoaded', function () {
    // Configuración de EmailJS
    const emailPublicKey = "-A5JBipGEcurxqoLt";
    const emailServiceId = "service_z6e9ven";
    const emailTemplateId = "template_xgiui7k";
    
    // Inicializar EmailJS
    (function () {
        emailjs.init(emailPublicKey);
    })();

    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('#mainTabs .nav-link');

    function updateActiveTab() {
        const scrollPosition = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`#mainTabs .nav-link[data-section="${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }

    window.addEventListener('scroll', updateActiveTab);

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    updateActiveTab();

    // Validación y envío del formulario de contacto
    const forms = document.querySelectorAll('.needs-validation');
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            event.stopPropagation();

            if (form.checkValidity()) {
                const submitBtn = form.querySelector('button[type="submit"]');
                const spinner = submitBtn.querySelector('.spinner-border');

                spinner.classList.remove('d-none');
                submitBtn.disabled = true;

                // Obtener datos del formulario
                const formData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    subject: document.getElementById('subject').value,
                    message: document.getElementById('message').value
                };

                // Enviar email usando EmailJS
                emailjs.send(emailServiceId, emailTemplateId, formData)
                    .then(function (response) {
                        console.log('SUCCESS!', response.status, response.text);

                        spinner.classList.add('d-none');
                        submitBtn.disabled = false;

                        showAlert('success', '¡Mensaje enviado!', 'Tu mensaje ha sido enviado correctamente. Te responderemos pronto.', form);

                        // Resetear formulario
                        form.reset();
                        form.classList.remove('was-validated');
                    })
                    .catch(function (error) {
                        console.log('FAILED...', error);

                        spinner.classList.add('d-none');
                        submitBtn.disabled = false;

                        showAlert('danger', 'Error al enviar', 'Hubo un problema al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.', form);
                    });
            }

            form.classList.add('was-validated');
        }, false);
    });

    function showAlert(type, title, message, form) {
        const alertHtml = `
                    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
                        <strong>${title}</strong> ${message}
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;
        form.insertAdjacentHTML('beforebegin', alertHtml);
        setTimeout(() => {
            const alert = form.previousElementSibling;
            if (alert && alert.classList.contains('alert')) {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }
        }, 5000);
    }
});