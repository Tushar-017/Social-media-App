import React, { useContext, useEffect, useState } from "react"
import { Link, useParams, useNavigate } from "react-router-dom"
import Axios from "axios"
import ReactMarkdown from "react-markdown"
import ReactTooltip from "react-tooltip"

import StateContext from "../context/StateContext"
import DispatchContext from "../context/DispatchContext"

import Page from "../components/Page"
import NotFound from "../components/NotFound"
import LoadingIcon from "../components/LoadingIcon"

function ViewSinglePost() {
  const navigate = useNavigate()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPosts] = useState()

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    const fetchPost = async () => {
      try {
        const response = await Axios.get(`/post/${id}`, {
          cancelToken: ourRequest.token,
        })
        setPosts(response.data)
        setIsLoading(false)
      } catch (error) {
        console.log("There was a problem or the request was cancelled.")
      }
    }
    fetchPost()
    return () => {
      ourRequest.cancel()
    }
  }, [id])

  if (!isLoading && !post) {
    return <NotFound />
  }

  if (isLoading)
    return (
      <Page title="...">
        <LoadingIcon />
      </Page>
    )

  const date = new Date(post.createdDate)
  const dateFormatted = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`

  const isOwner = () => {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username
    }
    return false
  }

  const deleteHandler = async () => {
    const areYouSure = window.confirm("Do you really want to delete this post?")
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, {
          data: { token: appState.user.token },
        })
        if (response.data == "Success") {
          appDispatch({
            type: "FLASHMESSAGE",
            value: "Post was successfully deleted!",
          })
          navigate(`/profile/${appState.user.username}`)
        }
      } catch (error) {
        console.log("There is a problem.")
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link
              to={`/post/${post._id}/edit`}
              data-tip="Edit"
              data-for="edit"
              className="text-primary mr-2"
            >
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltip" />{" "}
            <a
              data-tip="Delete"
              data-for="delete"
              className="delete-post-button text-danger"
              onClick={deleteHandler}
            >
              <i className="fas fa-trash"></i>
            </a>
            <ReactTooltip id="delete" className="custom-tooltip" />
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by{" "}
        <Link to={`/profile/${post.author.username}`}>
          {post.author.username}
        </Link>{" "}
        on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown
          children={post.body}
          allowedElement={[
            "p",
            "br",
            "strong",
            "em",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "ul",
            "ol",
            "li",
          ]}
        />
      </div>
    </Page>
  )
}

export default ViewSinglePost
