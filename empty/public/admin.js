document.addEventListener('DOMContentLoaded', () => {
    const adminPanel = document.getElementById('admin-panel');
    const uploadForm = document.getElementById('upload-form');
    const videoListContainer = document.getElementById('video-list-container');

    // --- Simple Password Protection ---
    // IMPORTANT: This is NOT secure for a real production environment.
    // It's a basic gatekeeper for this example.
    const ADMIN_PASSWORD = 'password123'; 

    function checkPassword() {
        const password = prompt('Please enter the admin password:');
        if (password !== ADMIN_PASSWORD) {
            adminPanel.innerHTML = '<p class="error-message">Access Denied. Incorrect password.</p>';
            return false;
        }
        adminPanel.style.display = 'block'; // Show content if password is correct
        return true;
    }

    // --- API Functions ---

    /**
     * Fetches all videos from the admin API and displays them.
     */
    async function loadAdminVideos() {
        try {
            const response = await fetch('/api/admin/videos');
            if (!response.ok) throw new Error('Failed to fetch videos');
            const videos = await response.json();
            
            displayVideos(videos);
        } catch (error) {
            console.error('Error loading videos:', error);
            videoListContainer.innerHTML = '<p class="error-message">Could not load video list.</p>';
        }
    }

    /**
     * Handles the form submission for uploading new video metadata.
     * @param {Event} e The form submission event.
     */
    async function handleUpload(e) {
        e.preventDefault();
        const formData = new FormData(uploadForm);
        const uploadBtn = document.getElementById('upload-btn');
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';

        try {
            const response = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            alert('Video metadata uploaded successfully!');
            uploadForm.reset();
            loadAdminVideos(); // Refresh the list
        } catch (error) {
            console.error('Error uploading video:', error);
            alert(`Upload failed: ${error.message}`);
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload Video';
        }
    }
    
    /**
     * Publishes a video when a 'Publish' button is clicked.
     * @param {Event} e The click event.
     */
    async function handlePublishClick(e) {
        if (e.target.classList.contains('publish-btn')) {
            const videoId = e.target.dataset.id;
            if (!confirm(`Are you sure you want to publish video ID ${videoId}?`)) {
                return;
            }

            e.target.disabled = true;
            e.target.textContent = 'Publishing...';
            
            try {
                const response = await fetch(`/api/admin/publish/${videoId}`, {
                    method: 'PUT',
                });

                if (!response.ok) throw new Error('Failed to publish');

                alert('Video published successfully!');
                loadAdminVideos(); // Refresh the list
            } catch (error) {
                console.error('Error publishing video:', error);
                alert('Publishing failed. Please try again.');
                e.target.disabled = false; // Re-enable on failure
                e.target.textContent = 'Publish';
            }
        }
    }

    // --- UI Functions ---

    /**
     * Renders the list of videos in the DOM.
     * @param {Array} videos Array of video objects.
     */
    function displayVideos(videos) {
        if (videos.length === 0) {
            videoListContainer.innerHTML = '<p>No videos have been uploaded yet.</p>';
            return;
        }

        const videoTable = `
            <table class="video-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Slug</th>
                        <th>Created At</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${videos.map(video => `
                        <tr>
                            <td>${video.title}</td>
                            <td>
                                <span class="status ${video.is_published ? 'status-published' : 'status-unpublished'}">
                                    ${video.is_published ? 'Published' : 'Unpublished'}
                                </span>
                            </td>
                            <td>${video.video_slug}</td>
                            <td>${new Date(video.created_at).toLocaleString()}</td>
                            <td>
                                ${!video.is_published ? 
                                    `<button class="publish-btn" data-id="${video.id}">Publish</button>` : 
                                    '<span>-</span>'
                                }
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        videoListContainer.innerHTML = videoTable;
    }

    // --- Initializer ---
    function init() {
        adminPanel.style.display = 'none'; // Hide content initially
        if (!checkPassword()) {
            return;
        }

        uploadForm.addEventListener('submit', handleUpload);
        videoListContainer.addEventListener('click', handlePublishClick);
        loadAdminVideos();
    }

    init();
});