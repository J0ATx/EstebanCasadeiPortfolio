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
        const scrollPosition = window.scrollY + 180;

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

    const heroSection = document.getElementById('home');
    const heroEditableSelector = '#home [data-hero-editable]';

    if (heroSection) {
        const toolbar = document.createElement('div');
        toolbar.className = 'hero-editor-toolbar';
        toolbar.innerHTML = `
            <button type="button" class="hero-editor-rotate"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M15.25 18.48V15a.75.75 0 1 0-1.5 0v4c0 .97.78 1.75 1.75 1.75h4a.75.75 0 1 0 0-1.5h-2.6a8.75 8.75 0 0 0-2.07-15.53.75.75 0 1 0-.49 1.42 7.25 7.25 0 0 1 .91 13.34zM8.75 5.52V9a.75.75 0 0 0 1.5 0V5c0-.97-.78-1.75-1.75-1.75h-4a.75.75 0 0 0 0 1.5h2.6a8.75 8.75 0 0 0 2.18 15.57.75.75 0 0 0 .47-1.43 7.25 7.25 0 0 1-1-13.37z"></path></svg></button>
            <button type="button" class="hero-editor-delete"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-trash"><path d="M0 0h24v24H0z" stroke="none"/><path d="M4 7h16m-10 4v6m4-6v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg></button>
        `;
        document.body.appendChild(toolbar);

        let selectedEl = null;
        let isDragging = false;
        let isRotating = false;
        let dragPointerStart = { x: 0, y: 0 };
        let dragElStart = { x: 0, y: 0 };
        let rotateCenter = { x: 0, y: 0 };
        let rotateStartAngle = 0;
        let rotateStartDeg = 0;
        let visibilityObserver = null;

        const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

        function ensureHeroId(el) {
            if (!el.dataset.heroId) {
                el.dataset.heroId = `hero-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
            }
            return el.dataset.heroId;
        }

        function getState(el) {
            const x = parseFloat(el.dataset.heroX || '0');
            const y = parseFloat(el.dataset.heroY || '0');
            const r = parseFloat(el.dataset.heroRotate || '0');
            return { x, y, r };
        }

        function normalizeElementForEditing(el) {
            if (el.dataset.heroNormalized === '1') return;

            const heroRect = heroSection.getBoundingClientRect();
            const rect = el.getBoundingClientRect();

            const computed = window.getComputedStyle(el);
            if (!el.dataset.heroBaseRotate) {
                const baseRotate = computed.rotate && computed.rotate !== 'none' ? computed.rotate : '0deg';
                el.dataset.heroBaseRotate = baseRotate;
            }

            if (computed.position === 'static') {
                el.style.position = 'absolute';
            }

            if (el.classList.contains('arrow-down')) {
                el.style.animation = 'none';
            }

            el.style.left = `${rect.left - heroRect.left}px`;
            el.style.top = `${rect.top - heroRect.top}px`;
            el.style.right = '';
            el.style.bottom = '';
            el.style.margin = '0';
            el.style.transform = 'none';
            el.style.transformOrigin = '50% 50%';
            el.dataset.heroNormalized = '1';
        }

        function applyState(el, state) {
            el.dataset.heroX = String(state.x);
            el.dataset.heroY = String(state.y);
            el.dataset.heroRotate = String(state.r);
            el.style.translate = `${state.x}px ${state.y}px`;
            const baseRotate = el.dataset.heroBaseRotate || '0deg';
            el.style.rotate = `calc(${baseRotate} + ${state.r}deg)`;
        }

        function clampTranslationToHero(el, proposedX, proposedY) {
            const baseLeft = parseFloat(el.style.left || '0');
            const baseTop = parseFloat(el.style.top || '0');

            const w = el.offsetWidth || 0;
            const h = el.offsetHeight || 0;

            const maxLeft = heroSection.clientWidth - w;
            const maxTop = heroSection.clientHeight - h;

            const clampedLeft = clamp(baseLeft + proposedX, 0, maxLeft);
            const clampedTop = clamp(baseTop + proposedY, 0, maxTop);

            return {
                x: clampedLeft - baseLeft,
                y: clampedTop - baseTop
            };
        }

        function positionToolbarFor(el) {
            const rect = el.getBoundingClientRect();
            const margin = 10;
            const estimatedWidth = toolbar.offsetWidth || 240;
            const left = clamp(rect.left + rect.width / 2 - estimatedWidth / 2, 8, window.innerWidth - estimatedWidth - 8);
            const top = clamp(rect.bottom + margin, 8, window.innerHeight - 60);
            toolbar.style.left = `${left}px`;
            toolbar.style.top = `${top}px`;
        }

        function showToolbarFor(el) {
            toolbar.style.display = 'flex';
            positionToolbarFor(el);
        }

        function hideToolbar() {
            toolbar.style.display = 'none';
        }

        function deselect() {
            if (selectedEl) {
                selectedEl.classList.remove('hero-edit-selected');
            }
            if (visibilityObserver) {
                visibilityObserver.disconnect();
                visibilityObserver = null;
            }
            selectedEl = null;
            hideToolbar();
        }

        function observeVisibility(el) {
            if (visibilityObserver) {
                visibilityObserver.disconnect();
                visibilityObserver = null;
            }

            if (!('IntersectionObserver' in window)) return;

            visibilityObserver = new IntersectionObserver((entries) => {
                const entry = entries[0];
                if (!entry) return;
                if (!selectedEl) return;
                if (entry.target !== selectedEl) return;

                if (!entry.isIntersecting || entry.intersectionRatio < 0.15) {
                    deselect();
                }
            }, {
                root: null,
                threshold: [0, 0.15, 0.5, 1]
            });

            visibilityObserver.observe(el);
        }

        function select(el) {
            if (selectedEl === el) {
                showToolbarFor(el);
                return;
            }

            deselect();
            selectedEl = el;
            selectedEl.classList.add('hero-edit-selected');
            ensureHeroId(selectedEl);
            normalizeElementForEditing(selectedEl);
            applyState(selectedEl, getState(selectedEl));
            showToolbarFor(selectedEl);
            observeVisibility(selectedEl);
        }

        function startDragFromPointer(ev) {
            if (!selectedEl) return;
            isDragging = true;
            const st = getState(selectedEl);
            dragPointerStart = { x: ev.clientX, y: ev.clientY };
            dragElStart = { x: st.x, y: st.y };
            toolbar.style.pointerEvents = 'none';
            document.body.style.userSelect = 'none';
            
            if (ev.target instanceof Element) {
                ev.target.setPointerCapture(ev.pointerId);
            }
        }

        function startRotateFromPointer(ev) {
            if (!selectedEl) return;
            isRotating = true;
            const rect = selectedEl.getBoundingClientRect();
            rotateCenter = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            const st = getState(selectedEl);
            rotateStartDeg = st.r;
            rotateStartAngle = Math.atan2(ev.clientY - rotateCenter.y, ev.clientX - rotateCenter.x);
            
            toolbar.classList.add('is-rotating');
            document.body.classList.add('is-rotating');
            document.body.style.userSelect = 'none';

            if (ev.target instanceof Element) {
                ev.target.setPointerCapture(ev.pointerId);
            }
        }

        function onPointerMove(ev) {
            if (isDragging && selectedEl) {
                const dx = ev.clientX - dragPointerStart.x;
                const dy = ev.clientY - dragPointerStart.y;
                const st = getState(selectedEl);
                const proposedX = dragElStart.x + dx;
                const proposedY = dragElStart.y + dy;
                const clamped = clampTranslationToHero(selectedEl, proposedX, proposedY);
                applyState(selectedEl, { x: clamped.x, y: clamped.y, r: st.r });
                positionToolbarFor(selectedEl);
            }
            if (isRotating && selectedEl) {
                const angle = Math.atan2(ev.clientY - rotateCenter.y, ev.clientX - rotateCenter.x);
                const delta = angle - rotateStartAngle;
                const deg = rotateStartDeg + (delta * 180) / Math.PI;
                const st = getState(selectedEl);
                applyState(selectedEl, { x: st.x, y: st.y, r: deg });
                positionToolbarFor(selectedEl);
            }
        }

        function onPointerUp(ev) {
            if (isDragging || isRotating) {
                isDragging = false;
                isRotating = false;
                toolbar.style.pointerEvents = '';
                toolbar.classList.remove('is-rotating');
                document.body.classList.remove('is-rotating');
                document.body.style.userSelect = '';
                if (selectedEl) {
                    showToolbarFor(selectedEl);
                }

                if (ev && ev.target instanceof Element && ev.target.hasPointerCapture(ev.pointerId)) {
                    ev.target.releasePointerCapture(ev.pointerId);
                }
            }
        }

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);

        heroSection.addEventListener('pointerdown', (ev) => {
            const target = ev.target;
            if (!(target instanceof Element)) return;
            const editable = target.closest(heroEditableSelector);
            if (!editable) return;
            if (toolbar.contains(target)) return;
            select(editable);
            startDragFromPointer(ev);
            ev.preventDefault();
        });

        document.addEventListener('pointerdown', (ev) => {
            const target = ev.target;
            if (!(target instanceof Element)) return;
            if (toolbar.contains(target)) return;
            const editable = target.closest(heroEditableSelector);
            if (!editable) {
                deselect();
            }
        });

        document.addEventListener('keydown', (ev) => {
            if (!selectedEl) return;
            if (ev.key === 'Escape') {
                deselect();
            }
            if (ev.key === 'Backspace') {
                selectedEl.remove();
                deselect();
            }
        });

        toolbar.querySelector('.hero-editor-delete').addEventListener('click', () => {
            if (!selectedEl) return;
            selectedEl.remove();
            deselect();
        });

        const rotateBtn = toolbar.querySelector('.hero-editor-rotate');
        rotateBtn.addEventListener('pointerdown', (ev) => {
            if (!selectedEl) return;
            startRotateFromPointer(ev);
            ev.preventDefault();
            ev.stopPropagation();
        });

        heroSection.addEventListener('dblclick', (ev) => {
            const target = ev.target;
            if (!(target instanceof Element)) return;
            const editable = target.closest(heroEditableSelector);
            if (!editable) return;
            const textEl = editable.matches('h1,h2,p,span') ? editable : editable.querySelector('h1,h2,p,span');
            if (!textEl) return;
            if (textEl.isContentEditable) return;
            select(editable);
            textEl.contentEditable = 'true';
            textEl.focus();

            const onBlur = () => {
                textEl.contentEditable = 'false';
                textEl.removeEventListener('blur', onBlur);
            };
            textEl.addEventListener('blur', onBlur);
        });

        window.addEventListener('scroll', () => {
            if (selectedEl) positionToolbarFor(selectedEl);
        }, { passive: true });
        window.addEventListener('resize', () => {
            if (selectedEl) positionToolbarFor(selectedEl);
        });
    }
});