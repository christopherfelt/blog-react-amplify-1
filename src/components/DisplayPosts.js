import React, { Component } from "react";
import { API, Auth, graphqlOperation } from "aws-amplify";
import {
  onCreatePost,
  onDeletePost,
  onUpdatePost,
  onCreateComment,
  onCreateLike,
} from "../graphql/subscriptions";

import DeletePost from "./DeletePost";
import { listPosts } from "../graphql/queries";
import EditPost from "./EditPost";
import CreateCommentPost from "./CreateCommentPost";
import CommentPost from "./CommentPost";

import { FaThumbsUp } from "react-icons";

class DisplayPosts extends Component {
  state = {
    ownerId: "",
    owerUsername: "",
    isHovering: false,
    posts: [],
  };

  componentDidMount = async () => {
    this.getPosts();

    await Auth.currentUserInfo().then((user) => {
      this.setState({
        ownerId: user.attributes.sub,
        ownerUsername: user.username,
      });
    });

    // use subscribe sparingly

    this.createPostListener = API.graphql(
      graphqlOperation(onCreatePost)
    ).subscribe({
      next: (postData) => {
        const newPost = postData.value.data.onCreatePost;
        const prevPosts = this.state.posts.filter(
          (post) => post.id !== newPost.id
        );
        const updatePosts = [newPost, ...prevPosts];

        this.setState({ posts: updatePosts });
      },
    });

    this.deletePostListener = API.graphql(
      graphqlOperation(onDeletePost)
    ).subscribe({
      next: (postData) => {
        const deletedPost = postData.value.data.onDeletePost;
        const updatedPosts = this.state.posts.filter(
          (post) => post.id !== deletedPost.id
        );
        this.setState({ posts: updatedPosts });
      },
    });

    this.updatePostListener = API.graphql(
      graphqlOperation(onUpdatePost)
    ).subscribe({
      next: (postData) => {
        const { posts } = this.state;
        const updatePost = postData.value.data.onUpdatePost;
        const index = posts.findIndex((post) => post.id === updatePost.id);
        const updatePosts = [
          ...posts.slice(0, index),
          updatePost,
          ...posts.slice(index + 1),
        ];
        this.setState({ posts: updatePosts });
      },
    });

    this.createPostCommentListener = API.graphql(
      graphqlOperation(onCreateComment)
    ).subscribe({
      next: (commentData) => {
        const createdComment = commentData.value.data.onCreateComment;
        let posts = [...this.state.posts];

        for (let post of posts) {
          if (createdComment.post.id === post.id) {
            post.comments.item.push(createdComment);
          }
        }
      },
    });

    this.createPostLikeListener = API.graphql(
      graphqlOperation(onCreateLike)
    ).subscribe({
      next: (postData) => {
        const createdLike = postData.value.data.onCreateLike;

        let posts = [...this.state.posts];
        for (let post of posts) {
          if (createdLike.post.id === post.id) {
            post.likes.items.push(createdLike);
          }
        }
        this.setState({ posts });
      },
    });
  };

  componentWillUnmount() {
    this.createPostListener.unsubscribe();
    this.deletePostListener.unsubscribe();
    this.updatePostListener.unsubscribe();
    this.createPostCommentListener.unsubscribe();
    this.createPostLikeListener.unsubscribe();
  }

  getPosts = async () => {
    const result = await API.graphql(graphqlOperation(listPosts));

    this.setState({ posts: result.data.listPosts.items });

    // console.log("All Posts: ", result.data.listPosts.items);
  };

  likedPost = (postId) => {
    for (let post of this.state.posts) {
      if (post.id === postId) {
        if (post.postOwnerId === this.state.ownerId) return true;
        for (let like of post.likes.items) {
          if (like.likeOnwerId === this.state.ownerId) {
            return true;
          }
        }
      }
    }
    return false;
  };

  render() {
    const { posts } = this.state;
    return posts.map((post) => {
      return (
        <div key={post.id} className="posts" style={rowStyle}>
          <h1>{post.postTitle}</h1>
          <span>
            {"Wrote by: "}
            {post.postOwnerUsername}
            <p>{post.postBody}</p>
            <time style={{ fontStyle: "italic", color: "#0ca5e297" }}>
              {" "}
              {new Date(post.createdAt).toDateString()}
            </time>
          </span>

          <br />
          <span>
            <DeletePost data={post} />
            <EditPost {...post} />
          </span>
          <span>
            <CreateCommentPost postId={post.id} />
            {post.comments.items.length > 0 && (
              <span style={{ fontSize: "19px", color: "gray" }}>Comments </span>
            )}
            {post.comments.items.map((comment, index) => (
              <CommentPost key={index} commentData={comment} />
            ))}
          </span>
        </div>
      );
    });
  }
}

const rowStyle = {
  background: "#f4f4f4",
  padding: "10px",
  margin: "14px",
};

export default DisplayPosts;
