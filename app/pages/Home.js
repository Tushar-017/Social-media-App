import React, { useContext, useEffect } from "react"
import { useImmer } from "use-immer"
import { Link } from "react-router-dom"
import Axios from "axios"
import ReactMarkdown from "react-markdown"

import LoadingIcon from "../components/LoadingIcon"
import Page from "../components/Page"

import StateContext from "../StateContext"

function Home() {
  const appState = useContext(StateContext)
  const [state, setState] = useImmer({
    isLoading: true,
    feed: [],
  })

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    const fetchData = async () => {
      try {
        const response = await Axios.post(
          "/getHomeFeed",
          { token: appState.user.token },
          { cancelToken: ourRequest.token }
        )
        setState((draft) => {
          draft.isLoading = false
          draft.feed = response.data
        })
      } catch (error) {
        console.log("There was a problem or the request was cancelled.")
      }
    }
    fetchData()
    return () => {
      ourRequest.cancel()
    }
  }, [])

  if (state.isLoading) {
    return <LoadingIcon />
  }

  return (
    <Page title="Feed">
      {state.feed.length > 0 && (
        <>
          <p className="text-center mb-4 text-muted">
            The Latest From Those You Follow.
          </p>
          <div className="list-group">
            {state.feed.map((post) => {
              const date = new Date(post.createdDate)
              const dateFormatted = `${
                date.getMonth() + 1
              }/${date.getDate()}/${date.getFullYear()}`
              return (
                <div key={post._id}>
                  <Link
                    to={`/post/${post._id}`}
                    className="list-group-item list-group-item-action"
                  >
                    <img className="avatar-tiny" src={post.author.avatar} />{" "}
                    <strong>{post.title}</strong>{" "}
                    <span className="text-muted small">
                      by {post.author.username} on {dateFormatted}{" "}
                    </span>
                    <hr />
                    <div
                      style={{
                        background:
                          "linear-gradient(0deg, rgba(172,240,255,0.2763699229691877) 0%, rgba(173,243,254,0.31278448879551823) 100%)",
                      }}
                      className="p-3 mb-2"
                    >
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
                  </Link>
                  <br />
                </div>
              )
            })}
          </div>
        </>
      )}
      {state.feed.length == 0 && (
        <>
          <h2 className="text-center">
            Hello <strong>{appState.user.username}</strong>, your feed is empty.
          </h2>
          <p className="lead text-muted text-center">
            Your feed displays the latest posts from the people you follow. If
            you don&rsquo;t have any friends to follow that&rsquo;s okay; you
            can use the &ldquo;Search&rdquo; feature in the top menu bar to find
            content written by people with similar interests and then follow
            them.
          </p>
        </>
      )}
    </Page>
  )
}

export default Home
