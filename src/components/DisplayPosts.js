import React, { Component } from "react";
import { API, graphqlOperation } from "aws-amplify";
import {
  onCreatePost,
  onDeletePost,
  onUpdatePost,
  onCreateComment
} from "../graphql/subscriptions";

import DeletePost from "./DeletePost";
import { listPosts } from "../graphql/queries";
import EditPost from "./EditPost";
import CreateCommentPost from "./CreateCommentPost";

class DisplayPosts extends Component {
  state = {
    posts: [],
  };

  componentDidMount = async () => {
    this.getPosts();

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

    this.createPostCommentListener = API.graphql(graphqlOperation(onCreateComment)).subscribe({
      next: commentData => {
        const createdComment = commentData.value.data.onCreateComment;
        let posts = [ ...this.state.posts];

        for(let post of posts){
          if(createdComment.post.id === post.id){
            post.comments.item.push(createdComment)
          }
        }

      }
    })

  };

  componentWillUnmount() {
    this.createPostListener.unsubscribe();
    this.deletePostListener.unsubscribe();
    this.updatePostListener.unsubscribe();
    this.createPostCommentListener.unsubscribe();
  }

  getPosts = async () => {
    const result = await API.graphql(graphqlOperation(listPosts));

    this.setState({ posts: result.data.listPosts.items });

    // console.log("All Posts: ", result.data.listPosts.items);
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
