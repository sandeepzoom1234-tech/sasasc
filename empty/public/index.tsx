/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

interface Video {
    id: number;
    title: string;
    description: string;
    video_slug: string;
    created_at: string;
}

const galleryContainer = document.getElementById('video-gallery') as HTMLElement;
const loadingIndicator = document.getElementById('loading-indicator') as HTMLElement;

/**
 * Creates an HTML element for a single video card.
 * @param {Video} video The video data object.
 * @returns {HTMLElement} The created video card element.
 */
function createVideoCard(video: Video): HTMLElement {
    const card = document.createElement('div');
    card.className = 'video-card';

    // Link to the video detail page with the slug as a query parameter.
    const anchor = document.createElement('a');
    anchor.href = `video.html?slug=${video.video_slug}`;
    anchor.dataset.slug = video.video_slug;
    anchor.setAttribute('aria-label', `Watch ${video.title}`);
    
    anchor.innerHTML = `
        <div class="video-thumbnail" aria-hidden="true"></div>
        <div class="video-info">
            <h3>${video.title}</h3>
            <p>${video.description || 'No description available.'}</p>
        </div>
    `;
    
    card.appendChild(anchor);
    return card;
}

/**
 * Fetches published videos from the API and populates the gallery.
 */
async function loadVideos() {
    if (!galleryContainer || !loadingIndicator) {
        console.error('Required gallery or loading elements not found in the DOM.');
        return;
    }

    loadingIndicator.classList.remove('hidden');

    try {
        const response = await fetch('/api/videos');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const videos: Video[] = await response.json();

        // Clear previous content and screen reader announcement area
        galleryContainer.innerHTML = ''; 

        if (videos.length === 0) {
            galleryContainer.innerHTML = '<p>No videos have been published yet. Check back soon!</p>';
        } else {
            videos.forEach(video => {
                const videoCard = createVideoCard(video);
                galleryContainer.appendChild(videoCard);
            });
        }
    } catch (error) {
        console.error('Failed to fetch videos:', error);
        galleryContainer.innerHTML = '<p>Sorry, we couldn\'t load the videos right now. Please try again later.</p>';
    } finally {
        loadingIndicator.classList.add('hidden');
    }
}

// Initial load when the DOM is ready
document.addEventListener('DOMContentLoaded', loadVideos);