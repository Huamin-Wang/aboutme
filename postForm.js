// postForm.js

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('postButton').addEventListener('click', togglePostForm);
    document.getElementById('postFormElement').addEventListener('submit', submitPost);
});

function togglePostForm() {
    const postForm = document.getElementById('postForm');
    const postsContainer = document.getElementById('posts');
    const isFormVisible = postForm.style.display === 'block';

    postForm.style.display = isFormVisible ? 'none' : 'block';
    if (isFormVisible) {
        postsContainer.classList.remove('posts-container-adjusted');
        postsContainer.style.top = '0'; // Reset top position when form is hidden
        document.querySelector('.header h2').style.display = 'none'; // Hide h2 when form is hidden
    } else {
        postsContainer.classList.add('posts-container-adjusted');
        const header = document.querySelector('.header');
        postsContainer.style.top = `${header.offsetHeight}px`;

        // Show and add animation to the h2 element
        const h2Element = document.querySelector('.header h2');
        h2Element.style.display = 'block';
        h2Element.classList.add('highlight-animation');
    }

    // Adjust the position of the pagination element
    const pagination = document.getElementById('pagination');
    pagination.style.position = 'relative';
    pagination.style.top = postForm.style.display === 'block' ? '20px' : '0';
}

async function submitPost(event) {
    event.preventDefault();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const imageFile = document.getElementById('postImage').files[0];
    const newPost = { id: generateUniqueId(), title, content, timestamp: new Date().toISOString(), replies: [] };

    // Show loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    if (imageFile) {
        const reader = new FileReader();
        reader.onload = async function(e) {
            newPost.image = e.target.result;
            await savePost(newPost);
        };
        reader.readAsDataURL(imageFile);
    } else {
        await savePost(newPost);
    }
}

async function savePost(newPost) {
    try {
        let { sha, content: fileContent } = await getFileContent();
        fileContent.push(newPost);
        await updateFileContent(fileContent, sha);
        loadPosts();
        document.getElementById('postFormElement').reset();
        togglePostForm(); // Hide the post form after submission
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        // Hide loading indicator
        const loadingIndicator = document.getElementById('loadingIndicator');
        loadingIndicator.style.display = 'none';
    }
}

function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}