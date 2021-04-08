import React, { useContext, useState, useRef } from "react";
import gql from "graphql-tag";
import { useQuery, useMutation } from "@apollo/react-hooks";
import moment from "moment";

import {
  Grid,
  Card,
  TextField,
  CardHeader,
  CardContent,
  Typography,
  CardActions,
  Avatar,
  IconButton,
  Badge,
  Button,
} from "@material-ui/core";

import ForumIcon from "@material-ui/icons/Forum";

import { AuthContext } from "../context/auth";
import LikeButton from "../components/dashboard/LikeButton";
import DeleteButton from "../components/dashboard/DeleteButton";

function SinglePost(props, args = {}) {
  const postId = props.match.params.postId;
  const { user } = useContext(AuthContext);
  const commentInputRef = useRef(null);

  const [comment, setComment] = useState("");

  const { data: { getPost } = args } = useQuery(FETCH_POST_QUERY, {
    variables: {
      postId,
    },
  });

  const [submitComment] = useMutation(SUBMIT_COMMENT_MUTATION, {
    update() {
      setComment("");
      commentInputRef.current.blur();
    },
    variables: {
      postId,
      body: comment,
    },
  });

  function deletePostCallback() {
    props.history.push("/");
  }

  let postMarkup;
  if (!getPost) {
    postMarkup = <p>Loading post..</p>;
  } else {
    const {
      id,
      body,
      createdAt,
      username,
      comments,
      likes,
      likeCount,
      commentCount,
    } = getPost;

    postMarkup = (
      <main style={{ marginTop: 100 }}>
        <Grid>
          <Card>
            <CardHeader
              avatar={
                <Avatar
                  aria-label="recipe"
                  src="https://react.semantic-ui.com/images/avatar/large/molly.png"
                />
              }
              title={username}
              subheader={moment(createdAt).fromNow()}
            />
            <CardContent>
              <Typography variant="body2" color="textSecondary" component="p">
                {body}
              </Typography>
            </CardContent>
            <CardActions>
              <LikeButton user={user} post={{ id, likeCount, likes }} />
              <IconButton aria-label="Comment on Post">
                <Badge
                  badgeContent={commentCount}
                  color="secondary"
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "right",
                  }}
                >
                  <ForumIcon />
                </Badge>
              </IconButton>
              {user && user.username === username && (
                <DeleteButton postId={id} callback={deletePostCallback} />
              )}
            </CardActions>
          </Card>
          {user && (
            <Card style={{ marginTop: 30 }}>
              <CardContent>
                <form noValidate autoComplete="off">
                  <h3>Post a comment</h3>
                  <TextField
                    label="Comment..."
                    variant="outlined"
                    name="comment"
                    type="text"
                    onChange={(event) => setComment(event.target.value)}
                    ref={commentInputRef}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={comment.trim() === ""}
                    onClick={submitComment}
                  >
                    Submit
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardHeader
                avatar={
                  <Avatar
                    aria-label="recipe"
                    src="https://react.semantic-ui.com/images/avatar/large/molly.png"
                  />
                }
                title={comment.username}
                subheader={moment(comment.createdAt).fromNow()}
              />
              <CardContent>
                {user && user.username === comment.username && (
                  <DeleteButton postId={id} commentId={comment.id} />
                )}
                <Typography>{comment.body}</Typography>
              </CardContent>
            </Card>
          ))}
        </Grid>
      </main>
    );
  }
  return postMarkup;
}

const SUBMIT_COMMENT_MUTATION = gql`
  mutation($postId: String!, $body: String!) {
    createComment(postId: $postId, body: $body) {
      id
      comments {
        id
        body
        createdAt
        username
      }
      commentCount
    }
  }
`;

const FETCH_POST_QUERY = gql`
  query($postId: ID!) {
    getPost(postId: $postId) {
      id
      body
      createdAt
      username
      likeCount
      likes {
        username
      }
      commentCount
      comments {
        id
        username
        createdAt
        body
      }
    }
  }
`;

export default SinglePost;
