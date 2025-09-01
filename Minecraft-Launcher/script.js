particlesJS('particles-js', {
    particles: {
        number: {
            value: 60,
            density: {
                enable: true,
                value_area: 800
            }
        },
        color: {
            value: '#ffffff'
        },
        shape: {
            type: 'circle'
        },
        opacity: {
            value: 0.8,
            random: true
        },
        size: {
            value: 4,
            random: true
        },
        line_linked: {
            enable: false
        },
        move: {
            enable: true,
            speed: 2,
            direction: 'bottom',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
            onhover: {
                enable: false
            },
            onclick: {
                enable: false
            },
            resize: true
        }
    },
    retina_detect: true
});

let versionsData = [];
let latestVersion = null;

const downloadBtn = document.getElementById('download-btn');
const viewAllBtn = document.getElementById('view-all-btn');
const popupOverlay = document.getElementById('popup-overlay');
const closePopupBtn = document.getElementById('close-popup');
const loadingMessage = document.getElementById('loading-message');
const versionsList = document.getElementById('versions-list');
const tiltImage = document.getElementById('tilt-image');

document.addEventListener('DOMContentLoaded', function() {
    loadVersions();
    
    downloadBtn.addEventListener('click', downloadLatest);
    viewAllBtn.addEventListener('click', showPopup);
    closePopupBtn.addEventListener('click', hidePopup);
    
    popupOverlay.addEventListener('click', function(e) {
        if (e.target === popupOverlay) {
            hidePopup();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && popupOverlay.classList.contains('show')) {
            hidePopup();
        }
    });
    
    initTiltEffect();
});

async function loadVersions() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/Plutana-eng/Roblox-Exucuter/refs/heads/main/Updates.json');
        
        if (!response.ok) {
            throw new Error(`Failed to load versions`);
        }
        
        const versions = await response.json();
        
        if (!Array.isArray(versions) || versions.length === 0) {
            throw new Error('No versions found');
        }

        versions.forEach(v => {
            v._parsedDate = new Date(v.ReleaseDate);
        });
        
        versions.sort((a, b) => b._parsedDate - a._parsedDate);
        
        versionsData = versions;
        latestVersion = versions[0];
        
        downloadBtn.disabled = false;
        
    } catch (error) {
        console.error('Error loading versions:', error);
        downloadBtn.textContent = 'Download (Unavailable)';
        downloadBtn.disabled = true;
    }
}

function downloadLatest() {
    if (!latestVersion || !latestVersion.DownloadUrl) {
        alert('Download not available');
        return;
    }
    
    window.open(latestVersion.DownloadUrl, '_blank');
}

function showPopup() {
    popupOverlay.classList.add('show');
    
    if (versionsData.length === 0) {
        loadingMessage.textContent = 'No versions available';
        return;
    }
    
    loadingMessage.style.display = 'none';
    versionsList.style.display = 'block';
    
    versionsList.innerHTML = '';
    
    versionsData.forEach((version, index) => {
        const versionItem = document.createElement('div');
        versionItem.className = 'version-item';
        if (index === 0) versionItem.classList.add('latest');
        
        versionItem.innerHTML = `
            <div class="version-header">
                <div class="version-info">
                    <h3>Version ${version.Version}</h3>
                    <div class="version-date">Released: ${formatDate(version.ReleaseDate)}</div>
                </div>
                ${index === 0 ? '<span class="latest-badge">LATEST</span>' : ''}
            </div>
            <div class="version-description">${version.Description || 'No description available'}</div>
            <button class="version-download-btn" onclick="downloadVersion('${version.DownloadUrl}')" ${!version.DownloadUrl ? 'disabled' : ''}>
                ${version.DownloadUrl ? 'Download' : 'Unavailable'}
            </button>
        `;
        
        versionsList.appendChild(versionItem);
    });
}

function hidePopup() {
    popupOverlay.classList.remove('show');
}

function downloadVersion(url) {
    if (!url) {
        alert('Download not available');
        return;
    }
    
    window.open(url, '_blank');
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

function initTiltEffect() {
    if (!tiltImage) return;
    
    tiltImage.addEventListener('mousemove', function(e) {
        const rect = tiltImage.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        const rotateX = (mouseY / rect.height) * -30;
        const rotateY = (mouseX / rect.width) * 30;
        
        tiltImage.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    
    tiltImage.addEventListener('mouseleave', function() {
        tiltImage.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
}
