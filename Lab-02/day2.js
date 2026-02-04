const POST_API = "http://localhost:3000/posts";
const COMMENT_API = "http://localhost:3000/comments";

//POSTS

async function LoadData() {
    let res = await fetch(POST_API);
    let posts = await res.json();

    let body = document.getElementById("body_table");
    body.innerHTML = "";

    for (const post of posts) {
        body.innerHTML += `
        <tr style="
            text-decoration:${post.isDeleted ? "line-through" : "none"};
            color:${post.isDeleted ? "gray" : "black"};
        ">
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.views}</td>
            <td>
                <input type="button" value="Delete"
                    onclick="DeletePost('${post.id}')"/>
                <input type="button" value="Comments"
                    onclick="LoadComments('${post.id}')"/>
            </td>
        </tr>`;
    }
}

// Create + Update post
async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;

    // UPDATE
    if (id !== "") {
        await fetch(POST_API + "/" + id, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, views })
        });
    }
    // CREATE (ID tự tăng)
    else {
        let resAll = await fetch(POST_API);
        let posts = await resAll.json();

        let maxId = posts.length
            ? Math.max(...posts.map(p => Number(p.id)))
            : 0;

        let newPost = {
            id: String(maxId + 1),
            title: title,
            views: views,
            isDeleted: false
        };

        await fetch(POST_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newPost)
        });
    }

    LoadData();
    return false;
}

// Xoá mềm post
async function DeletePost(id) {
    await fetch(POST_API + "/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true })
    });

    LoadData();
}

//comments

async function LoadComments(postId) {
    let res = await fetch(`${COMMENT_API}?postId=${postId}`);
    let comments = await res.json();

    let ul = document.getElementById("comment_list");
    ul.innerHTML = "";
    ul.setAttribute("data-postid", postId);

    for (const c of comments) {
        ul.innerHTML += `
        <li style="
            text-decoration:${c.isDeleted ? "line-through" : "none"};
            color:${c.isDeleted ? "gray" : "black"};
        ">
            ${c.text}
            <button onclick="DeleteComment('${c.id}', '${postId}')">X</button>
        </li>`;
    }
}

// Create comment
async function SaveComment() {
    let text = document.getElementById("comment_txt").value;
    let postId = document
        .getElementById("comment_list")
        .getAttribute("data-postid");

    let resAll = await fetch(COMMENT_API);
    let comments = await resAll.json();

    let maxId = comments.length
        ? Math.max(...comments.map(c => Number(c.id)))
        : 0;

    let newComment = {
        id: String(maxId + 1),
        postId: postId,
        text: text,
        isDeleted: false
    };

    await fetch(COMMENT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment)
    });

    document.getElementById("comment_txt").value = "";
    LoadComments(postId);
}

// Xoá mềm comment
async function DeleteComment(id, postId) {
    await fetch(COMMENT_API + "/" + id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true })
    });

    LoadComments(postId);
}

LoadData();
