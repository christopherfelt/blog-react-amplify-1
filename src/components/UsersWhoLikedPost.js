import React, { Component } from "react";

export default class UsersWhoLikedPost extends Component {
  render() {
    const allUsers = this.props.data;
    return allUsers.map((user, index) => {
      if (user === "") {
        return "";
      } else {
        return (
          <div key={index}>
            <span style={{ fontStyle: "bold", color: "#ged" }}>{user}</span>
          </div>
        );
      }
    });
  }
}
