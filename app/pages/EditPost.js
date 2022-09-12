import React, { useContext, useEffect, useState } from "react"
import { useImmerReducer } from "use-immer"
import { useParams, useNavigate, Link } from "react-router-dom"
import Axios from "axios"

import NotFound from "../components/NotFound"
import Page from "../components/Page"
import LoadingIcon from "../components/LoadingIcon"

import StateContext from "../context/StateContext"
import DispatchContext from "../context/DispatchContext"

function EditPost() {
  const navigate = useNavigate()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)

  const initialState = {
    title: {
      value: "",
      hasError: false,
      message: "",
    },
    body: {
      value: "",
      hasError: false,
      message: "",
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
  }
  function ourReducer(draft, action) {
    switch (action.type) {
      case "FETCHCOMPLETE":
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false
        return
      case "TITLECHANGE":
        draft.title.hasError = false
        draft.title.value = action.value
        return
      case "BODYCHANGE":
        draft.body.hasError = false
        draft.body.value = action.value
        return
      case "SUBMITREQUEST":
        if (!draft.title.hasError && !draft.body.hasError) {
          draft.sendCount++
        }
        return
      case "SAVEREQUESTSTARTED":
        draft.isSaving = true
        return
      case "SAVEREQUESTFINISHED":
        draft.isSaving = false
        return
      case "TITLERULES":
        if (!action.value.trim()) {
          draft.title.hasError = true
          draft.title.message = "You must enter something here!"
        }
        return
      case "BODYRULES":
        if (!action.value.trim()) {
          draft.body.hasError = true
          draft.body.message = "You must enter something here!"
        }
        return
      case "NOTFOUND":
        draft.notFound = true
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  const submitHandler = (e) => {
    e.preventDefault()
    dispatch({ type: "TITLERULES", value: state.title.value })
    dispatch({ type: "BODYRULES", value: state.body.value })
    dispatch({ type: "SUBMITREQUEST" })
  }

  // Pre-loaded field
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    const fetchPost = async () => {
      try {
        const response = await Axios.get(`/post/${state.id}`, {
          cancelToken: ourRequest.token,
        })
        if (response.data) {
          dispatch({ type: "FETCHCOMPLETE", value: response.data })
          if (appState.user.username != response.data.author.username) {
            appDispatch({
              type: "FLASHMESSAGE",
              value: "You cannot edit this post!",
            })
            navigate("/")
          }
        } else {
          dispatch({ type: "NOTFOUND" })
        }
      } catch (error) {
        console.log("There was a problem or the request was cancelled.")
      }
    }
    fetchPost()
    return () => {
      ourRequest.cancel()
    }
  }, [])

  // Update Request
  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: "SAVEREQUESTSTARTED" })
      const ourRequest = Axios.CancelToken.source()

      const fetchPost = async () => {
        try {
          const response = await Axios.post(
            `/post/${state.id}/edit`,
            {
              title: state.title.value,
              body: state.body.value,
              token: appState.user.token,
            },
            {
              cancelToken: ourRequest.token,
            }
          )
          dispatch({ type: "SAVEREQUESTFINISHED" })
          appDispatch({
            type: "FLASHMESSAGE",
            value: "Your post is Updated",
          })
          navigate(`/post/${state.id}`)
        } catch (error) {
          console.log("There was a problem or the request was cancelled.")
        }
      }
      fetchPost()
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.sendCount])

  if (state.notFound) {
    return <NotFound />
  }

  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingIcon />
      </Page>
    )

  return (
    <Page title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to post
      </Link>
      <form className="mt-3" onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            value={state.title.value}
            autoFocus
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            onChange={(e) =>
              dispatch({ type: "TITLECHANGE", value: e.target.value })
            }
            onBlur={(e) =>
              dispatch({ type: "TITLERULES", value: e.target.value })
            }
          />
          {state.title.hasError && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            value={state.body.value}
            onChange={(e) =>
              dispatch({ type: "BODYCHANGE", value: e.target.value })
            }
            onBlur={(e) =>
              dispatch({ type: "BODYRULES", value: e.target.value })
            }
          />
          {state.body.hasError && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.body.message}
            </div>
          )}
        </div>

        <button className="btn btn-primary" disabled={state.isSaving}>
          Save Updates
        </button>
      </form>
    </Page>
  )
}

export default EditPost
