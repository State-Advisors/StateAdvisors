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
                // Auto-populate the message field
                messageTextarea.value = `I'm interested in: ${interest}\n\n`;
                messageTextarea.focus();
                
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
        
        solarForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate required fields
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ef4444';
                } else {
                    field.style.borderColor = '#e5e7eb';
                }
            });
            
            if (!isValid) {
                showNotification('Please fill in all required fields marked with *.', 'error');
                return;
            }
            
            // Get form data
            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Show loading state
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Submit to Formspree
            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => {
                if (response.ok) {
                    // Show popup instead of notification
                    showFormPopup();
                    this.reset();
                    // Reset character counter
                    if (charCounter) {
                        charCounter.textContent = '0';
                        charCounter.parentElement.classList.remove('warning', 'danger');
                    }
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Sorry, there was an error sending your message. Please try again or contact us directly.', 'error');
            })
            .finally(() => {
                // Reset button
                submitButton.textContent = originalText;
                submitButton.disabled = false;
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
                const numericValue = parseFloat(finalValue.replace(/[^0-9.]/g, ''));
                
                let currentValue = 0;
                const increment = numericValue / 50;
                
                const timer = setInterval(() => {
                    currentValue += increment;
                    if (currentValue >= numericValue) {
                        currentValue = numericValue;
                        clearInterval(timer);
                    }
                    
                    if (isCurrency) {
                        target.textContent = '$' + Math.floor(currentValue).toLocaleString() + 'K+';
                    } else if (isPercentage) {
                        target.textContent = Math.floor(currentValue) + '%';
                    } else {
                        target.textContent = Math.floor(currentValue) + '+';
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

    // Solar Monitor Functions
    function updateSolarMonitor() {
        const now = new Date();
        const nycTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
        const currentHour = nycTime.getHours();
        
        // Calculate daily production (accumulated) - adaptive to end at 45 kWh
        let dailyProduction = 0;
        if (currentHour >= 6) {
            for (let hour = 6; hour <= Math.min(currentHour, 20); hour++) {
                const distanceFromPeak = Math.abs(hour - 12);
                let hourlyProduction = 35 * Math.exp(-(distanceFromPeak * distanceFromPeak) / 12);
                
                // Higher production during 10AM-4PM
                if (hour >= 10 && hour <= 16) {
                    hourlyProduction = 42 * Math.exp(-(distanceFromPeak * distanceFromPeak) / 12);
                }
                
                // Apply time-based adjustments
                if (hour < 12) {
                    hourlyProduction *= (1 + (hour - 6) * 0.1);
                }
                if (hour > 12) {
                    hourlyProduction *= (1 - (hour - 12) * 0.05);
                }
                
                dailyProduction += hourlyProduction;
            }
        }
        
        // Scale to end at 45 kWh for the full day
        const fullDayProduction = 45; // Target end-of-day total
        const scaledProduction = dailyProduction * (fullDayProduction / (fullDayProduction * 0.8)); // Scale to target
        
        // Update display
        document.getElementById('daily-production').textContent = Math.min(scaledProduction, fullDayProduction).toFixed(1);
        
        // Update chart
        updateProductionChart();
    }

    function updateProductionChart() {
        const canvas = document.getElementById('production-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Get current NYC time
        const now = new Date();
        const nycTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
        const currentHour = nycTime.getHours();
        
        // Update current time display
        const timeDisplay = document.getElementById('current-time');
        if (timeDisplay) {
            timeDisplay.textContent = nycTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
            });
        }
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        
        // Vertical grid lines (hours)
        for (let i = 0; i <= 24; i++) {
            const x = (i / 24) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // Horizontal grid lines (kW)
        for (let i = 0; i <= 10; i++) {
            const y = (i / 10) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Draw hour labels (below the chart)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        for (let i = 0; i <= 24; i += 3) {
            const x = (i / 24) * width;
            const timeLabel = i === 0 ? '12AM' : i === 12 ? '12PM' : i > 12 ? `${i-12}PM` : `${i}AM`;
            ctx.fillText(timeLabel, x, height + 20);
        }
        
        // Draw kWh labels (max 45 kWh) - outside chart boundaries
        ctx.textAlign = 'right';
        for (let i = 0; i <= 9; i += 1) {
            const y = (i / 9) * height;
            const kwhLabel = Math.round((9 - i) * 5) + ' kWh';
            ctx.fillText(kwhLabel, 50, y + 4);
        }
        
        // Solar Production Data (Higher production 10AM-4PM, smoother curve)
        const solarData = [];
        for (let hour = 0; hour < 24; hour++) {
            let production = 0;
            if (hour >= 6 && hour <= 20) {
                const peakHour = 12;
                const distanceFromPeak = Math.abs(hour - peakHour);
                let maxProduction = 35; // kWh (max 45 kWh)
                
                // Higher production during 10AM-4PM
                if (hour >= 10 && hour <= 16) {
                    maxProduction = 42; // Higher peak during peak hours
                }
                
                // Smoother curve with faster rise and more muted peak
                production = maxProduction * Math.exp(-(distanceFromPeak * distanceFromPeak) / 12);
                
                // Faster rise in morning
                if (hour < 12) {
                    production *= (1 + (hour - 6) * 0.1);
                }
                // Slower fade in afternoon
                if (hour > 12) {
                    production *= (1 - (hour - 12) * 0.05);
                }
            }
            solarData.push(production);
        }
        
        // Consumption Data (Bell curve with peaks)
        const consumptionData = [];
        for (let hour = 0; hour < 24; hour++) {
            let consumption = 0;
            // Base consumption
            consumption = 8 + Math.sin((hour - 6) * Math.PI / 12) * 3;
            
            // Morning peak (7-9 AM)
            if (hour >= 7 && hour <= 9) {
                consumption += 8 * Math.exp(-Math.pow(hour - 8, 2) / 2);
            }
            
            // Evening peak (5-8 PM)
            if (hour >= 17 && hour <= 20) {
                consumption += 12 * Math.exp(-Math.pow(hour - 18.5, 2) / 2);
            }
            
            consumptionData.push(consumption);
        }
        
        // Draw bars - side by side for each hour
        const hourWidth = width / 24;
        const barWidth = hourWidth / 2 - 2; // Two bars per hour, thinner
        
        // Draw consumption bars (gold) and solar production (green) - both update with time
        for (let i = 0; i < 24; i++) {
            const hourX = (i / 24) * width;
            
            // Gold consumption bar (left) - show all hours
            ctx.fillStyle = '#f59e0b';
            const consumption = consumptionData[i];
            const consumptionHeight = (consumption / 45) * height; // Max 45 kWh
            ctx.fillRect(hourX + 1, height - consumptionHeight, barWidth, consumptionHeight);
            
            // Green solar production bar (right) - only up to current hour
            if (i <= currentHour) {
                ctx.fillStyle = '#10b981';
                const production = solarData[i];
                const productionHeight = (production / 45) * height; // Max 45 kWh
                ctx.fillRect(hourX + barWidth + 3, height - productionHeight, barWidth, productionHeight);
            }
        }
        
        // Highlight current hour
        if (currentHour >= 0 && currentHour < 24) {
            const hourX = (currentHour / 24) * width;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.strokeRect(hourX, 0, hourWidth, height);
        }
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
        setInterval(updateSolarMonitor, 5000); // Update every 5 seconds
    });