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
    } else {
        postsContainer.classList.add('posts-container-adjusted');
        const header = document.querySelector('.header');
        postsContainer.style.top = `${header.offsetHeight}px`;

        // Add animation to the h2 element
        const h2Element = document.querySelector('.header h2');
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
    const newPost = { id: generateUniqueId(), title, content, timestamp: new Date().toISOString(), replies: [] };

    try {
        let { sha, content: fileContent } = await getFileContent();
        fileContent.push(newPost);
        await updateFileContent(fileContent, sha);
        loadPosts();
        document.getElementById('postFormElement').reset();
        togglePostForm(); // Hide the post form after submission
    } catch (error) {
        console.error('Error:', error.message);
    }
}

function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}