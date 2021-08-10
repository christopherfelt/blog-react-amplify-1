import React, { Component } from "react";

class CreatePost extends Component {
  state = {
    postOwnerId: "",
    postOwnerUsername: "",
    postTitle: "",
    postBody: "",
  };

  componentDidMount = async () => {
    // Todo: TBA
  };

  handleAddPost = async (event) => {
    event.preventDefault();
    const input = {
      postOwnerId: this.state.postOwnerId,
      postOwnerUsername: this.state.postOwnerUsername,
      postTitle: this.state.postTitle,
      postBody: this.state.postBody,
      createAt: new Date().toISOString(),
    };
  };

  render() {
    return (
      <form className="add-post" onSubmit={this.handleAddPost}>
        <input
          type="text"
          style={{ font: "19px" }}
          placeholder="Title"
          name="postTitle"
        />
        <textarea
          type="text"
          name="postBody"
          id=""
          cols="40"
          rows="3"
          placeholder="New blog post"
          required
        ></textarea>
        <input type="submit" className="btn" style={{ fontSize: "19px" }} />
      </form>
    );
  }
}

export default CreatePost;
