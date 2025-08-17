/**
 * Fetches and displays the details for a single video.
 */
document.addEventListener('DOMContentLoaded', async () => {
    const videoContainer = document.getElementById('video-container');
    const loadingIndicator = document.getElementById('video-loading');

    // Get the video slug from the URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const videoSlug = urlParams.get('slug');

    if (!videoSlug) {
        videoContainer.innerHTML = '<p class="error-message">No video specified. Please return to the gallery.</p>';
        return;
    }

    try {
        const response = await fetch(`/api/videos/${videoSlug}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Video not found or it has not been published yet.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const video = await response.json();

        // Update the page title
        document.title = video.title;

        // Populate the video container with the video details
        videoContainer.innerHTML = `
            <h1 id="video-title">${video.title}</h1>
            <div class="video-player-wrapper">
                <video id="video-player" src="https://abyss.to/v/${video.video_slug}" controls autoplay muted playsinline>
                    Your browser does not support the video tag.
                </video>
            </div>
            <div class="video-details">
                <h2>Description</h2>
                <p id="video-description">${video.description || 'No description available.'}</p>
                <button id="download-btn" class="download-button">Download Video</button>
            </div>
        `;

        // Add event listener for the download button
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                // 1. Open the ad link in a new tab
                window.open('https://your-ad-link.com', '_blank');

                // 2. Trigger the video file download
                const videoUrl = `https://abyss.to/v/${video.video_slug}`;
                const link = document.createElement('a');
                link.href = videoUrl;
                // Suggest a filename for the download
                link.setAttribute('download', `${video.title.replace(/\s+/g, '_')}.mp4`);
                // Append to the document, click, and then remove
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            });
        }

    } catch (error) {
        console.error('Failed to load video:', error);
        videoContainer.innerHTML = `<p class="error-message">Sorry, we couldn't load the video. ${error.message}</p>`;
    } finally {
        if(loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }
});
