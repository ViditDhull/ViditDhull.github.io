// Card interaction - Works with both hover and click, optimized for touch devices
const cards = document.querySelectorAll('.card');
const detailPanel = document.getElementById('detailPanel');
const detailSections = document.querySelectorAll('.detail-section');

let hideTimeout;
let isClickActive = false;
let activeCard = null;

// Detect if device is touch-enabled
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

cards.forEach(card => {
    // Mouse enter - only for non-touch devices
    if (!isTouchDevice) {
        card.addEventListener('mouseenter', () => {
            if (!isClickActive) {
                clearTimeout(hideTimeout);
                const section = card.dataset.section;
                showDetail(section, card);
            }
        });
        
        card.addEventListener('mouseleave', () => {
            if (!isClickActive) {
                // Delay hiding to allow moving to detail panel
                hideTimeout = setTimeout(() => {
                    hideDetail();
                }, 300);
            }
        });
    }
    
    // Click handler - works for both mouse and touch
    card.addEventListener('click', (e) => {
        e.stopPropagation();
        const section = card.dataset.section;
        
        if (activeCard === card && isClickActive) {
            // Clicking the same active card closes it
            hideDetail();
            isClickActive = false;
            activeCard = null;
        } else {
            // Clicking a different card or activating for first time
            isClickActive = true;
            activeCard = card;
            clearTimeout(hideTimeout);
            showDetail(section, card);
        }
    });
});

// Keep detail panel open when hovering over it (non-touch devices)
if (!isTouchDevice) {
    detailPanel.addEventListener('mouseenter', () => {
        if (!isClickActive) {
            clearTimeout(hideTimeout);
        }
    });

    detailPanel.addEventListener('mouseleave', () => {
        if (!isClickActive) {
            hideDetail();
        }
    });
}

// Close detail panel when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.card') && !e.target.closest('.detail-panel')) {
        if (isClickActive) {
            hideDetail();
            isClickActive = false;
            activeCard = null;
        }
    }
});

function showDetail(section, card) {
    // Remove active class from all cards
    cards.forEach(c => c.classList.remove('active'));
    
    // Add active class to current card
    if (card) {
        card.classList.add('active');
    }
    
    // Hide all detail sections
    detailSections.forEach(s => s.classList.remove('active'));
    
    // Show selected detail section
    const selectedSection = document.querySelector(`[data-detail="${section}"]`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Show detail panel
    detailPanel.classList.add('active');
}

function hideDetail() {
    detailPanel.classList.remove('active');
    detailSections.forEach(s => s.classList.remove('active'));
    cards.forEach(c => c.classList.remove('active'));
}