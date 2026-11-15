// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        
        // Animate hamburger menu
        const bars = document.querySelectorAll('.bar');
        bars.forEach(bar => bar.classList.toggle('active'));
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navMenu.classList.remove('active');
            const bars = document.querySelectorAll('.bar');
            bars.forEach(bar => bar.classList.remove('active'));
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            const bars = document.querySelectorAll('.bar');
            bars.forEach(bar => bar.classList.remove('active'));
        }
    });

    // Navbar background on scroll
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Benefit card click functionality
    const benefitCards = document.querySelectorAll('.benefit-card[data-interest]');
    benefitCards.forEach(card => {
        card.addEventListener('click', function() {
            const interest = this.getAttribute('data-interest');
            const messageTextarea = document.getElementById('message');
            
            if (messageTextarea) {
                messageTextarea.value = `I'm interested in: ${interest}\n\n`;
                if (!messageTextarea.closest('[hidden]')) {
                    messageTextarea.focus();
                }
                
                // Update character counter
                const charCounter = document.getElementById('char-count');
                if (charCounter) {
                    charCounter.textContent = messageTextarea.value.length;
                }
                
                // Scroll to contact form
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Form handling
    const solarForm = document.getElementById('solar-form');
    if (solarForm) {
        // Character counter for message textarea
        const messageTextarea = document.getElementById('message');
        const charCounter = document.getElementById('char-count');
        
        if (messageTextarea && charCounter) {
            messageTextarea.addEventListener('input', function() {
                const currentLength = this.value.length;
                charCounter.textContent = currentLength;
                
                // Update counter color based on length
                charCounter.parentElement.classList.remove('warning', 'danger');
                if (currentLength > 1800) {
                    charCounter.parentElement.classList.add('danger');
                } else if (currentLength > 1500) {
                    charCounter.parentElement.classList.add('warning');
                }
            });
        }
        
        const quoteContinue = document.getElementById('quote-continue');
        const quoteFollowup = document.getElementById('quote-step-followup');
        const quoteRequired = document.getElementById('quote-step-required');
        const callDate = document.getElementById('call-date');
        const callTime = document.getElementById('call-time');

        const portalBase = (function () {
            const ALLOWED_PORTALS = new Set([
                'https://app.statesolaradvisors.com',
                'http://localhost:3000',
                'http://127.0.0.1:3000'
            ]);
            const rawPortal = (window.STATEADVISORS && window.STATEADVISORS.portalUrl || '').replace(/\/$/, '');
            const allowed = ALLOWED_PORTALS.has(rawPortal) ? rawPortal : '';
            if (rawPortal && !allowed) {
                console.warn('STATEADVISORS.portalUrl rejected — not in allowlist.');
            }
            return allowed;
        })();

        function markValidity(fields) {
            let isValid = true;
            fields.forEach(field => {
                const value = String(field.value || '').trim();
                if (!value) {
                    isValid = false;
                    field.style.borderColor = '#ef4444';
                } else {
                    field.style.borderColor = '#e5e7eb';
                }
            });
            return isValid;
        }

        function nycDateParts(date) {
            const fmt = new Intl.DateTimeFormat('en-US', {
                timeZone: 'America/New_York',
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
            const parts = Object.fromEntries(fmt.formatToParts(date).map(part => [part.type, part.value]));
            return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
        }

        function isoFromParts(parts) {
            const month = String(parts.month).padStart(2, '0');
            const day = String(parts.day).padStart(2, '0');
            return `${parts.year}-${month}-${day}`;
        }

        function addDays(parts, days) {
            const utc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
            utc.setUTCDate(utc.getUTCDate() + days);
            return { year: utc.getUTCFullYear(), month: utc.getUTCMonth() + 1, day: utc.getUTCDate() };
        }

        function weekdayOf(iso) {
            const [year, month, day] = iso.split('-').map(Number);
            return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
        }

        if (callTime) {
            for (let minutes = 9 * 60; minutes <= 18 * 60; minutes += 30) {
                const hour24 = Math.floor(minutes / 60);
                const minute = minutes % 60;
                const suffix = hour24 >= 12 ? 'PM' : 'AM';
                const hour12 = hour24 % 12 || 12;
                const label = `${hour12}:${String(minute).padStart(2, '0')} ${suffix}`;
                const option = document.createElement('option');
                option.value = label;
                option.textContent = label;
                callTime.appendChild(option);
            }
        }

        if (callDate) {
            const today = nycDateParts(new Date());
            callDate.min = isoFromParts(addDays(today, 1));
            callDate.max = isoFromParts(addDays(today, 21));
        }

        function sendLead(fields, crmPayload) {
            const body = new FormData();
            Object.entries(fields).forEach(([key, value]) => {
                if (value !== undefined && value !== null && String(value).trim() !== '') {
                    body.append(key, value);
                }
            });
            const formspreePromise = fetch(solarForm.action, {
                method: 'POST',
                body,
                headers: { 'Accept': 'application/json' }
            });
            const crmPromise = portalBase
                ? fetch(`${portalBase}/api/ingest/website`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(crmPayload)
                }).catch((err) => {
                    console.warn('CRM ingest failed (Formspree may still succeed):', err);
                    return null;
                })
                : Promise.resolve(null);
            return Promise.all([formspreePromise, crmPromise]).then(([formspreeRes, crmRes]) => {
                if ((formspreeRes && formspreeRes.ok) || (crmRes && crmRes.ok)) return;
                throw new Error('Network response was not ok');
            });
        }

        function identityFields() {
            return {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                street: document.getElementById('street').value.trim(),
                town: document.getElementById('town').value.trim(),
                state: document.getElementById('state').value.trim(),
                zipcode: document.getElementById('zipcode').value.trim(),
                website: document.getElementById('website').value
            };
        }

        function showFollowup() {
            quoteRequired.hidden = true;
            quoteFollowup.hidden = false;
            callDate.required = true;
            callTime.required = true;
            const rail = document.getElementById('contact');
            if (rail) rail.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        if (quoteContinue) {
            quoteContinue.addEventListener('click', function () {
                const fields = ['name', 'email', 'street', 'town', 'state', 'zipcode'].map(id => document.getElementById(id));
                if (!markValidity(fields)) {
                    showNotification('Please fill in all required fields marked with *.', 'error');
                    return;
                }
                const who = identityFields();
                const originalText = quoteContinue.textContent;
                quoteContinue.textContent = 'Sending...';
                quoteContinue.disabled = true;
                sendLead({
                    _subject: 'Solar quote request',
                    form_type: 'quote_required',
                    name: who.name,
                    email: who.email,
                    street: who.street,
                    town: who.town,
                    state: who.state,
                    zipcode: who.zipcode,
                    website: who.website
                }, {
                    website: who.website || '',
                    fullName: who.name,
                    email: who.email,
                    street: who.street,
                    city: who.town,
                    state: who.state,
                    zip: who.zipcode,
                    message: 'Required quote details received. Follow-up may arrive separately.',
                    leadSource: 'website_contact'
                }).then(showFollowup).catch(() => {
                    showNotification('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
                    quoteContinue.textContent = originalText;
                    quoteContinue.disabled = false;
                });
            });
        }

        solarForm.addEventListener('submit', function (e) {
            e.preventDefault();
            if (quoteFollowup.hidden) {
                quoteContinue.click();
                return;
            }
            if (!markValidity([callDate, callTime])) {
                showNotification('Choose a date and time for the call.', 'error');
                return;
            }
            if (weekdayOf(callDate.value) === 0) {
                callDate.style.borderColor = '#ef4444';
                showNotification('Choose a Monday through Saturday.', 'error');
                return;
            }
            const who = identityFields();
            const phone = document.getElementById('phone').value.trim();
            const company = document.getElementById('company').value.trim();
            const monthlyBill = document.getElementById('monthly-bill').value.trim();
            const message = document.getElementById('message').value.trim();
            const when = `${callDate.value} at ${callTime.value} (Eastern)`;
            const submitButton = solarForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            sendLead({
                _subject: 'Solar quote follow-up and requested call time',
                form_type: 'quote_followup',
                name: who.name,
                email: who.email,
                street: who.street,
                town: who.town,
                state: who.state,
                zipcode: who.zipcode,
                company,
                phone,
                monthly_bill: monthlyBill,
                message,
                requested_call: when,
                website: who.website
            }, {
                website: who.website || '',
                fullName: who.name,
                email: who.email,
                phone,
                street: who.street,
                city: who.town,
                state: who.state,
                zip: who.zipcode,
                company,
                monthlyBill,
                message: [
                    monthlyBill ? `Monthly bill: ${monthlyBill}` : '',
                    message,
                    `Requested call: ${when}`
                ].filter(Boolean).join('\n'),
                leadSource: 'website_contact_followup'
            }).then(() => {
                showFormPopup();
                solarForm.reset();
                quoteFollowup.hidden = true;
                quoteRequired.hidden = false;
                callDate.required = false;
                callTime.required = false;
                if (charCounter) {
                    charCounter.textContent = '0';
                    charCounter.parentElement.classList.remove('warning', 'danger');
                }
            }).catch(() => {
                showNotification('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
            }).finally(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            });
        });
    }

    const jobForm = document.getElementById('job-form');
    if (jobForm) {
        jobForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const required = ['job-name', 'job-phone', 'job-email', 'job-role'].map(id => document.getElementById(id));
            let valid = true;
            required.forEach(field => {
                if (!String(field.value || '').trim()) {
                    valid = false;
                    field.style.borderColor = '#ef4444';
                } else {
                    field.style.borderColor = '#e5e7eb';
                }
            });
            if (!valid) {
                showNotification('Add your name, phone, email, and the role.', 'error');
                return;
            }
            const button = jobForm.querySelector('button[type="submit"]');
            const original = button.textContent;
            button.disabled = true;
            button.textContent = 'Sending...';
            const body = new FormData();
            body.append('_subject', 'Job inquiry');
            body.append('form_type', 'job_inquiry');
            body.append('name', document.getElementById('job-name').value.trim());
            body.append('phone', document.getElementById('job-phone').value.trim());
            body.append('email', document.getElementById('job-email').value.trim());
            body.append('role', document.getElementById('job-role').value);
            const area = document.getElementById('job-area').value.trim();
            const note = document.getElementById('job-note').value.trim();
            if (area) body.append('area', area);
            if (note) body.append('note', note);
            fetch(jobForm.action, {
                method: 'POST',
                body,
                headers: { 'Accept': 'application/json' }
            }).then(res => {
                if (!res.ok) throw new Error('Job inquiry was not delivered');
                jobForm.reset();
                const done = document.getElementById('job-thanks');
                if (done) done.hidden = false;
            }).catch(() => {
                showNotification('Sorry, we could not send that. Call (347) 308-4256 or email StateSolarAdvisors@gmail.com.', 'error');
            }).finally(() => {
                button.disabled = false;
                button.textContent = original;
            });
        });
    }

    // Notification system
    function showNotification(message, type) {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;

        // Add to page
        document.body.appendChild(notification);

        // Close button functionality
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: 1rem;
            padding: 0;
            line-height: 1;
        }
        
        .notification-content {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
    `;
    document.head.appendChild(style);

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.benefit-card, .solution-card, .step');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });

    // Counter animation for stats
    const stats = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                const isPercentage = finalValue.includes('%');
                const isCurrency = finalValue.includes('$');
                const isThousands = /k/i.test(finalValue);
                const hasPlus = finalValue.includes('+');
                const numericValue = parseFloat(finalValue.replace(/[^0-9.]/g, ''));
                
                let currentValue = 0;
                const increment = numericValue / 50;
                
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= numericValue) {
                        target.textContent = finalValue;
                        clearInterval(timer);
                        return;
                    }
                    
                    if (isCurrency && isThousands) {
                        target.textContent = '$' + Math.floor(currentValue).toLocaleString() + 'K+';
                    } else if (isCurrency) {
                        target.textContent = '$' + Math.floor(currentValue).toLocaleString();
                    } else if (isPercentage) {
                        target.textContent = Math.floor(currentValue) + '%';
                    } else if (hasPlus) {
                        target.textContent = Math.floor(currentValue) + '+';
                    } else {
                        target.textContent = Math.floor(currentValue).toLocaleString();
                    }
                }, 30);
                
                statsObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => statsObserver.observe(stat));

    // Portfolio Carousel
    let currentSlideIndex = 0;
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.dot');
    let slideInterval;

    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Show current slide
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }
    }

    function nextSlide() {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        showSlide(currentSlideIndex);
    }

    function prevSlide() {
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        showSlide(currentSlideIndex);
    }

    function startAutoSlide() {
        slideInterval = setInterval(nextSlide, 7000); // 7 seconds
    }

    function stopAutoSlide() {
        clearInterval(slideInterval);
    }

    // Start auto-slide
    if (slides.length > 0) {
        startAutoSlide();
        
        // Pause on hover
        const carousel = document.querySelector('.portfolio-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', stopAutoSlide);
            carousel.addEventListener('mouseleave', startAutoSlide);
        }
    }

    // Make carousel functions global
    window.changeSlide = function(direction) {
        if (direction > 0) {
            nextSlide();
        } else {
            prevSlide();
        }
        // Reset timer
        stopAutoSlide();
        startAutoSlide();
    };

    window.currentSlide = function(index) {
        currentSlideIndex = index - 1;
        showSlide(currentSlideIndex);
        // Reset timer
        stopAutoSlide();
        startAutoSlide();
    };
});

    // Add hamburger menu animation styles
    const hamburgerStyle = document.createElement('style');
    hamburgerStyle.textContent = `
        .bar.active:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }
        
        .bar.active:nth-child(2) {
            opacity: 0;
        }
        
        .bar.active:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
    `;
    document.head.appendChild(hamburgerStyle);

    // Form popup functions
    function showFormPopup() {
        const popup = document.getElementById('form-popup');
        if (popup) {
            popup.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    function closeFormPopup() {
        const popup = document.getElementById('form-popup');
        if (popup) {
            popup.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    // Close popup when clicking outside
    document.addEventListener('click', function(e) {
        const popup = document.getElementById('form-popup');
        if (popup && e.target === popup) {
            closeFormPopup();
        }
    });

    // Close popup with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeFormPopup();
        }
    });

    // Make functions global
    window.showFormPopup = showFormPopup;
    window.closeFormPopup = closeFormPopup;
    window.scrollToContact = function() {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Solar Calculator Functions
    window.nextStep = function(step) {
        // Hide all steps
        document.querySelectorAll('.calculator-step').forEach(s => s.classList.remove('active'));
        
        // Show current step
        document.getElementById('step' + step).classList.add('active');
        
        // Handle specific step logic
        if (step === 3) {
            // Simulate loading addresses based on zip code
            const zipCode = document.getElementById('zip-input').value;
            const addressSelect = document.getElementById('address-select');
            
            // Clear existing options
            addressSelect.innerHTML = '<option value="">Select your address...</option>';
            
            // Simulate API call delay
            setTimeout(() => {
                const sampleAddresses = [
                    `${zipCode} Main Street`,
                    `${zipCode} Oak Avenue`,
                    `${zipCode} Pine Road`,
                    `${zipCode} Maple Drive`,
                    `${zipCode} Elm Street`
                ];
                
                sampleAddresses.forEach(address => {
                    const option = document.createElement('option');
                    option.value = address;
                    option.textContent = address;
                    addressSelect.appendChild(option);
                });
            }, 500);
        }
    };

    // Add Enter key functionality
    document.addEventListener('DOMContentLoaded', function() {
        const zipInput = document.getElementById('zip-input');
        if (zipInput) {
            zipInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    nextStep(3);
                }
            });
        }
    });

    window.calculateSavings = function() {
        const state = document.getElementById('state-select').value;
        const zipCode = document.getElementById('zip-input').value;
        const billAmount = document.getElementById('bill-input').value;
        const email = document.getElementById('email-input').value;
        const address = document.getElementById('address-input').value || document.getElementById('address-select').value;
        
        if (!state || !zipCode || !billAmount || !email || !address) {
            alert('Please fill in all fields');
            return;
        }
        
        // Simulate calculation delay
        setTimeout(() => {
            // Generate realistic savings based on bill amount
            const bill = parseFloat(billAmount);
            
            // Calculate savings range: 25% to 50% reduction
            const minSavings = Math.floor(bill * 0.25); // 25% reduction
            const maxSavings = Math.floor(bill * 0.50); // 50% reduction
            
            // Calculate 30-year savings using 35% average monthly savings
            const avgMonthlySavings = Math.floor(bill * 0.35); // 35% average
            const thirtyYearSavings = avgMonthlySavings * 1080; // 30 years * 12 months * 3 (for inflation/rate increases)
            
            // Update results
            document.getElementById('monthly-savings-range').textContent = `$${minSavings} - $${maxSavings}`;
            document.getElementById('thirty-year-savings').textContent = `$${thirtyYearSavings.toLocaleString()}`;
            document.getElementById('tax-credits').textContent = `Waiting for missing information`;
            
            // Show results
            document.querySelectorAll('.calculator-step').forEach(s => s.classList.remove('active'));
            document.getElementById('calculator-result').style.display = 'block';
            
            // Store lead data (in real implementation, this would go to your CRM)
            const leadData = { 
                state, 
                zipCode, 
                billAmount, 
                email, 
                address, 
                monthlySavingsRange: `${minSavings} - ${maxSavings}`,
                thirtyYearSavings: thirtyYearSavings,
                avgMonthlySavings: avgMonthlySavings,
                timestamp: new Date().toISOString()
            };
            
            // Save to localStorage as backup
            localStorage.setItem('solarLeadData', JSON.stringify(leadData));
            
            // Log for development
            console.log('Lead captured:', leadData);
        }, 1000);
    };

    window.scheduleCall = function() {
        const phone = document.getElementById('phone-input').value;
        if (!phone) {
            alert('Please enter your phone number');
            return;
        }
        
        // Create schedule modal
        showScheduleModal();
    };

    function showScheduleModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('schedule-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal
        const modal = document.createElement('div');
        modal.id = 'schedule-modal';
        modal.className = 'schedule-modal';
        
        const now = new Date();
        let scheduleOptions = [];
        
        // Generate schedule options for next 3 days, 9 AM to 9 PM
        for (let day = 0; day < 3; day++) {
            const currentDate = new Date(now.getTime() + day * 24 * 60 * 60000);
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            
            for (let hour = 9; hour < 21; hour++) { // 9 AM to 9 PM
                for (let minute = 0; minute < 60; minute += 15) { // 15-minute intervals
                    const slotTime = new Date(currentDate);
                    slotTime.setHours(hour, minute, 0, 0);
                    
                    if (slotTime > now) {
                        const timeString = slotTime.toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                        });
                        scheduleOptions.push({
                            time: slotTime,
                            display: `${dayName} at ${timeString}`,
                            dayName: dayName
                        });
                    }
                }
            }
        }
        
        // Group by day
        const groupedSlots = {};
        scheduleOptions.forEach(slot => {
            if (!groupedSlots[slot.dayName]) {
                groupedSlots[slot.dayName] = [];
            }
            groupedSlots[slot.dayName].push(slot);
        });
        
        // Create modal content
        modal.innerHTML = `
            <div class="schedule-modal-content">
                <div class="schedule-modal-header">
                    <h3>Choose Your Call Time</h3>
                    <button class="schedule-modal-close" onclick="closeScheduleModal()">&times;</button>
                </div>
                <div class="schedule-modal-body">
                    <p>Select a time that works best for you. We'll send a calendar reminder to your email.</p>
                    <div class="schedule-slots">
                        ${Object.keys(groupedSlots).map(day => `
                            <div class="schedule-day">
                                <h4>${day}</h4>
                                <div class="time-slots">
                                    ${groupedSlots[day].slice(0, 8).map(slot => `
                                        <button class="time-slot" onclick="selectTimeSlot('${slot.time.toISOString()}')">
                                            ${slot.display.split(' at ')[1]}
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    function selectTimeSlot(selectedTime) {
        const leadData = JSON.parse(localStorage.getItem('solarLeadData') || '{}');
        const phone = document.getElementById('phone-input').value;
        const email = leadData.email;
        
        // Update lead data
        leadData.phone = phone;
        leadData.callScheduled = true;
        leadData.scheduledTime = selectedTime;
        localStorage.setItem('solarLeadData', JSON.stringify(leadData));
        
        // Close modal
        closeScheduleModal();
        
        // Show confirmation
        const selectedDate = new Date(selectedTime);
        const timeString = selectedDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        const dateString = selectedDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        });
        
        alert(`Perfect! Your call is scheduled for ${dateString} at ${timeString}.\n\nWe'll send a calendar reminder to ${email} and call you at ${phone}.\n\nThank you for choosing StateAdvisors Solar!`);
        
        // In real implementation, send calendar invite and notification
        console.log('Call scheduled:', {
            email: email,
            phone: phone,
            time: selectedTime,
            leadData: leadData
        });
    }

    function closeScheduleModal() {
        const modal = document.getElementById('schedule-modal');
        if (modal) {
            modal.remove();
        }
    }

    window.getFullQuote = function() {
        // Get stored lead data
        const leadData = JSON.parse(localStorage.getItem('solarLeadData') || '{}');
        
        // Scroll to contact form
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Pre-fill contact form with calculator data
        setTimeout(() => {
            // Pre-fill all available fields
            const emailInput = document.querySelector('#contact input[name="email"]');
            const nameInput = document.querySelector('#contact input[name="name"]');
            const streetInput = document.querySelector('#contact input[name="street"]');
            const townInput = document.querySelector('#contact input[name="town"]');
            const stateInput = document.querySelector('#contact input[name="state"]');
            const zipcodeInput = document.querySelector('#contact input[name="zipcode"]');
            const phoneInput = document.querySelector('#contact input[name="phone"]');
            const monthlyBillInput = document.querySelector('#contact input[name="monthly-bill"]');
            const messageInput = document.querySelector('#contact textarea[name="message"]');
            
            if (emailInput && leadData.email) emailInput.value = leadData.email;
            if (streetInput && leadData.address) streetInput.value = leadData.address;
            if (stateInput && leadData.state) stateInput.value = leadData.state;
            if (zipcodeInput && leadData.zipCode) zipcodeInput.value = leadData.zipCode;
            if (phoneInput && leadData.phone) phoneInput.value = leadData.phone;
            if (monthlyBillInput && leadData.billAmount) monthlyBillInput.value = `$${leadData.billAmount}`;
            
            // Pre-fill message with calculator results
            if (messageInput && leadData.monthlySavingsRange) {
                messageInput.value = `I'm interested in solar based on my calculator results:\n\nMonthly Savings Range: $${leadData.monthlySavingsRange}\n30-Year Anticipated Savings: $${leadData.thirtyYearSavings.toLocaleString()}\n\nPlease provide a detailed quote.`;
            }
        }, 1000);
    };

    // Solar monitor: 33 x 400 W (13.2 kW) at Long Island, clear-sky curve for the current New York clock.
    const MONITOR_LAT = 40.79 * Math.PI / 180;
    const MONITOR_DC_KW = 13.2;
    const MONITOR_PR = 0.84;
    const MONITOR_RATE = 0.25;

    function monitorParts(date) {
        const fmt = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/New_York',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23'
        });
        const parts = Object.fromEntries(fmt.formatToParts(date).map(part => [part.type, part.value]));
        return {
            year: Number(parts.year),
            month: Number(parts.month),
            day: Number(parts.day),
            hour: Number(parts.hour) % 24,
            minute: Number(parts.minute)
        };
    }

    function monitorDayOfYear(year, month, day) {
        return Math.floor((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 86400000);
    }

    function monitorClearness(year, month, day) {
        const seed = year * 10000 + month * 100 + day;
        const unit = ((seed * 9301 + 49297) % 233280) / 233280;
        return 0.72 + unit * 0.22;
    }

    function monitorElevation(dayOfYear, hourFraction) {
        const declination = (23.45 * Math.PI / 180) * Math.sin((2 * Math.PI * (284 + dayOfYear)) / 365);
        const hourAngle = (hourFraction - 12) * (15 * Math.PI / 180);
        const sinEl = Math.sin(MONITOR_LAT) * Math.sin(declination) + Math.cos(MONITOR_LAT) * Math.cos(declination) * Math.cos(hourAngle);
        return Math.asin(Math.max(-1, Math.min(1, sinEl)));
    }

    function monitorHourKwh(year, month, day, hour) {
        const elevation = monitorElevation(monitorDayOfYear(year, month, day), hour + 0.5);
        if (elevation <= 0.05) return 0;
        return MONITOR_DC_KW * MONITOR_PR * monitorClearness(year, month, day) * Math.sin(elevation);
    }

    function monitorHourUse(hour) {
        return 0.65
            + 0.85 * Math.exp(-Math.pow(hour - 8, 2) / 3.2)
            + 1.35 * Math.exp(-Math.pow(hour - 18.5, 2) / 4.2);
    }

    function monitorDayKwh(year, month, day, throughHour, minuteFraction) {
        let total = 0;
        const last = throughHour === undefined ? 23 : throughHour;
        for (let hour = 0; hour <= last; hour++) {
            const full = monitorHourKwh(year, month, day, hour);
            if (throughHour !== undefined && hour === throughHour) {
                total += full * minuteFraction;
            } else {
                total += full;
            }
        }
        return total;
    }

    function monitorMoney(kwh) {
        return (kwh * MONITOR_RATE).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    }

    function updateSolarMonitor() {
        const now = monitorParts(new Date());
        const minuteFraction = now.minute / 60;
        const todayKwh = monitorDayKwh(now.year, now.month, now.day, now.hour, minuteFraction);
        let monthKwh = 0;
        for (let day = 1; day < now.day; day++) {
            monthKwh += monitorDayKwh(now.year, now.month, day);
        }
        monthKwh += todayKwh;
        let yearKwh = 0;
        for (let month = 1; month < now.month; month++) {
            const days = new Date(Date.UTC(now.year, month, 0)).getUTCDate();
            for (let day = 1; day <= days; day++) {
                yearKwh += monitorDayKwh(now.year, month, day);
            }
        }
        yearKwh += monthKwh;

        const dailyEl = document.getElementById('daily-production');
        const monthEl = document.getElementById('month-production');
        const todayMoneyEl = document.getElementById('money-today');
        const yearMoneyEl = document.getElementById('money-to-date');
        if (dailyEl) dailyEl.textContent = todayKwh.toFixed(1);
        if (monthEl) monthEl.textContent = Math.round(monthKwh).toLocaleString('en-US');
        if (todayMoneyEl) todayMoneyEl.textContent = monitorMoney(todayKwh);
        if (yearMoneyEl) yearMoneyEl.textContent = monitorMoney(yearKwh);

        updateProductionChart(now);
    }

    function updateProductionChart(now) {
        const canvas = document.getElementById('production-chart');
        if (!canvas) return;
        const parentWidth = (canvas.parentElement && canvas.parentElement.clientWidth) || 800;
        const cssWidth = Math.max(280, parentWidth);
        const cssHeight = Math.max(220, Math.round(cssWidth * 0.38));
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.style.width = '100%';
        canvas.style.height = cssHeight + 'px';
        canvas.width = Math.round(cssWidth * dpr);
        canvas.height = Math.round(cssHeight * dpr);
        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const width = cssWidth;
        const height = cssHeight;
        const chartPadding = { left: 52, right: 16, top: 16, bottom: 36 };
        const chartWidth = width - chartPadding.left - chartPadding.right;
        const chartHeight = height - chartPadding.top - chartPadding.bottom;

        const solarData = [];
        const useData = [];
        let peak = 1;
        for (let hour = 0; hour < 24; hour++) {
            const produced = monitorHourKwh(now.year, now.month, now.day, hour);
            const used = monitorHourUse(hour);
            solarData.push(produced);
            useData.push(used);
            if (hour <= now.hour) peak = Math.max(peak, produced, used);
        }
        const axisMax = Math.max(4, Math.ceil(peak));

        ctx.clearRect(0, 0, width, height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.font = '12px Inter, Arial, sans-serif';
        ctx.textAlign = 'right';
        for (let step = 0; step <= 4; step++) {
            const value = (axisMax * (4 - step)) / 4;
            const y = chartPadding.top + (step / 4) * chartHeight;
            ctx.beginPath();
            ctx.moveTo(chartPadding.left, y);
            ctx.lineTo(width - chartPadding.right, y);
            ctx.stroke();
            ctx.fillText(value.toFixed(0) + ' kW', chartPadding.left - 8, y + 4);
        }

        ctx.textAlign = 'center';
        for (let hour = 0; hour <= 24; hour += 3) {
            const x = chartPadding.left + (hour / 24) * chartWidth;
            const label = hour === 0 || hour === 24 ? '12a' : hour === 12 ? '12p' : hour > 12 ? (hour - 12) + 'p' : hour + 'a';
            ctx.fillText(label, x, height - 10);
            ctx.beginPath();
            ctx.moveTo(x, chartPadding.top);
            ctx.lineTo(x, height - chartPadding.bottom);
            ctx.stroke();
        }

        const timeDisplay = document.getElementById('current-time');
        if (timeDisplay) {
            const suffix = now.hour >= 12 ? 'PM' : 'AM';
            const hour12 = now.hour % 12 || 12;
            timeDisplay.textContent = hour12 + ':' + String(now.minute).padStart(2, '0') + ' ' + suffix;
        }

        const hourWidth = chartWidth / 24;
        const barWidth = hourWidth / 2 - 2;
        for (let hour = 0; hour <= now.hour; hour++) {
            const hourX = chartPadding.left + (hour / 24) * chartWidth;
            const fraction = hour === now.hour ? (now.minute / 60) : 1;
            ctx.fillStyle = '#f59e0b';
            const useHeight = (useData[hour] * fraction / axisMax) * chartHeight;
            ctx.fillRect(hourX + 1, height - chartPadding.bottom - useHeight, barWidth, useHeight);
            ctx.fillStyle = '#10b981';
            const solarHeight = (solarData[hour] * fraction / axisMax) * chartHeight;
            ctx.fillRect(hourX + barWidth + 3, height - chartPadding.bottom - solarHeight, barWidth, solarHeight);
        }

        const hourX = chartPadding.left + (now.hour / 24) * chartWidth;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(hourX, chartPadding.top, hourWidth, chartHeight);
    }

    // Newsletter signup
    document.addEventListener('DOMContentLoaded', function() {
        const newsletterBtn = document.querySelector('.newsletter-btn');
        if (newsletterBtn) {
            newsletterBtn.addEventListener('click', function() {
                const email = document.querySelector('.newsletter-input').value;
                if (email && email.includes('@')) {
                    alert('Thank you for subscribing! You\'ll receive solar insights and updates soon.');
                    document.querySelector('.newsletter-input').value = '';
                } else {
                    alert('Please enter a valid email address.');
                }
            });
        }
        
        // Initialize solar monitor
        updateSolarMonitor();
        setInterval(updateSolarMonitor, 60000);
    });

    // Common questions: only one answer open at a time
    document.addEventListener('DOMContentLoaded', function () {
        const items = document.querySelectorAll('.faq-item');
        items.forEach((item) => {
            item.addEventListener('toggle', () => {
                if (!item.open) return;
                items.forEach((other) => {
                    if (other !== item) other.removeAttribute('open');
                });
            });
        });
    });