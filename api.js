const owner = "Huamin-Wang";  // 替换为你的 GitHub 用户名
const repo = "aboutme";    // 替换为你的仓库名称
const path = "data/forumData.json";  // 你想要存储数据的路径
const part1 = "ghp_HFIHIxsG2lM";
const part2 = "6q8uHZPkA6iiu6UJNOb1Fz1GC";
const token = part1+part2; // 替换为你的 GitHub 访问令牌

// 获取 GitHub 文件内容
async function getFileContent() {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: { "Authorization": `token ${token}`, "Accept": "application/vnd.github.v3+json" }
    });

    if (response.status === 404) {
        return { sha: null, content: [] };  // 文件不存在，返回空内容
    } else if (!response.ok) {
        throw new Error('Failed to fetch file content');
    }

    const fileData = await response.json();
    let content;
    try {
        content = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));
    } catch (error) {
        content = [];  // 如果解析失败，返回空内容
    }
    return { sha: fileData.sha, content };
}

// 更新 GitHub 文件内容
async function updateFileContent(content, sha) {
    const updatedData = btoa(unescape(encodeURIComponent(JSON.stringify(content))));
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: "PUT",
        headers: {
            "Authorization": `token ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json"
        },
        body: JSON.stringify({ message: "Update forum data", content: updatedData, sha })
    });

    if (!response.ok) {
        throw new Error('Failed to update file content');
    }
}