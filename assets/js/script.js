// script.js - updated: handle panel-open class and dynamic detail height + scrollIntoView

// Card interaction - Works with both hover and click, optimized for touch devices
const cards = document.querySelectorAll('.card');
const detailPanel = document.getElementById('detailPanel');
const detailSections = document.querySelectorAll('.detail-section');
const pipelineContainer = document.querySelector('.pipeline-container');
const contentWrapper = document.querySelector('.content-wrapper') || document.body; // fallback

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

window.addEventListener('resize', () => {
    // When window resizes while panel open, recompute heights
    if (detailPanel.classList.contains('active')) {
        recomputeDetailHeight();
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

    // add body class so CSS can adjust layout
    document.body.classList.add('panel-open');

    // compute and set custom active height so panel sits nicely near pipeline
    recomputeDetailHeight();

    // center the active card smoothly in the pipeline container for better UX
    try {
        if (card && typeof card.scrollIntoView === 'function') {
            // prefer centering horizontally in pipeline container
            card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    } catch (err) {
        // ignore if scrollIntoView fails on some environments
        console.warn('scrollIntoView failed: ', err);
    }
}

function hideDetail() {
    detailPanel.classList.remove('active');
    detailSections.forEach(s => s.classList.remove('active'));
    cards.forEach(c => c.classList.remove('active'));
    document.body.classList.remove('panel-open');
    // reset to default variable (optional)
    document.documentElement.style.setProperty('--detail-panel-active-height', 'clamp(220px, 38vh, 320px)');
}

/**
 * recomputeDetailHeight:
 * - measures the vertical space between the bottom of pipeline and viewport bottom
 * - sets --detail-panel-active-height to a sensible value so the panel "hugs" the pipeline on large screens
 */
function recomputeDetailHeight() {
    const pipelineRect = pipelineContainer.getBoundingClientRect();
    const spaceBelowPipeline = Math.max(0, window.innerHeight - pipelineRect.bottom - 18); // 18px cushion
    const spaceAbovePipeline = Math.max(0, pipelineRect.top - 18);

    // Preferred: open panel into the space below pipeline if there's enough room, else cap to a reasonable height
    // We pick a height that is at most the spaceBelowPipeline and at least 220px (your previous min).
    const minH = 220;
    const maxH = 520; // don't exceed this on very tall displays
    let desiredHeight = Math.min(Math.max(minH, spaceBelowPipeline), maxH);

    // If space below is tiny, try using half of viewport or smaller of spaceAbovePipeline
    if (spaceBelowPipeline < minH) {
        // try to use some of the space above pipeline (so it doesn't overlap too far)
        const alt = Math.min(Math.max(minH, Math.floor(window.innerHeight * 0.38)), maxH);
        desiredHeight = Math.min(alt, window.innerHeight - 80); // leave some breathing room
    }

    // set CSS variable used by .detail-panel.active
    document.documentElement.style.setProperty('--detail-panel-active-height', `${desiredHeight}px`);
}
