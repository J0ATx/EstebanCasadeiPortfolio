document.addEventListener('DOMContentLoaded', function() {
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
                link.addEventListener('click', function(e) {
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
            
            // Validación de Contact Me
            const forms = document.querySelectorAll('.needs-validation');
            Array.from(forms).forEach(form => {
                form.addEventListener('submit', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    if (form.checkValidity()) {
                        const submitBtn = form.querySelector('button[type="submit"]');
                        const spinner = submitBtn.querySelector('.spinner-border');
                        
                        spinner.classList.remove('d-none');
                        submitBtn.disabled = true;
                        
                        setTimeout(() => {
                            spinner.classList.add('d-none');
                            submitBtn.disabled = false;
                            
                            const alertHtml = `
                                <div class="alert alert-success alert-dismissible fade show" role="alert">
                                    <strong>¡Mensaje enviado!</strong> Tu mensaje ha sido enviado correctamente. Te responderemos pronto.
                                    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                                </div>
                            `;
                            form.insertAdjacentHTML('beforebegin', alertHtml);
                            
                            form.reset();
                            form.classList.remove('was-validated');
                            
                            setTimeout(() => {
                                const alert = form.previousElementSibling;
                                if (alert && alert.classList.contains('alert')) {
                                    const bsAlert = new bootstrap.Alert(alert);
                                    bsAlert.close();
                                }
                            }, 5000);
                        }, 1500);
                    }
                    
                    form.classList.add('was-validated');
                }, false);
            });
        });