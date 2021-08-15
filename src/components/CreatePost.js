import React, { Component } from "react";
import { API, Auth, graphqlOperation } from "aws-amplify";
import { createPost } from "../graphql/mutations";

class CreatePost extends Component {
  state = {
    postOwnerId: "",
    postOwnerUsername: "",
    postTitle: "",
    postBody: "",
  };

  componentDidMount = async () => {
    // Todo: TBA
    await Auth.currentUserInfo()
              .then(user => {
                this.setState({
                  postOwnerId: user.attributes.sub,
                  postOwnerUsername: user.username,
                })
                console.log("Curr: User: ", user.username);
                // console.log("Attr.Sub: User: ", user.attributes.sub);
              })
  };

  handleChangePost = (event) =>
    this.setState({ [event.target.name]: event.target.value });

  handleAddPost = async (event) => {
    event.preventDefault();
    const input = {
      postOwnerId: this.state.postOwnerId, 
      postOwnerUsername: this.state.postOwnerUsername,
      postTitle: this.state.postTitle,
      postBody: this.state.postBody,
      createdAt: new Date().toISOString(),
    };
    await API.graphql(graphqlOperation(createPost, { input }));
    this.setState({ postTitle: "", postBody: "" });
  };

  render() {
    return (
      <form className="add-post" onSubmit={this.handleAddPost}>
        <input
          type="text"
          style={{ font: "19px" }}
          placeholder="Title"
          name="postTitle"
          value={this.state.postTitle}
          onChange={this.handleChangePost}
        />
        <textarea
          type="text"
          name="postBody"
          id=""
          cols="40"
          rows="3"
          placeholder="New blog post"
          required
          value={this.state.postBody}
          onChange={this.handleChangePost}
        ></textarea>
        <input type="submit" className="btn" style={{ fontSize: "19px" }} />
      </form>
    );
  }
}

export default CreatePost;
