import React, { useContext, useEffect } from "react"
import { useImmer } from "use-immer"
import Axios from "axios"
import { Link } from "react-router-dom"

import DispatchContext from "../context/DispatchContext"
import Post from "./Post"

function Search() {
  const appDispatch = useContext(DispatchContext)

  const [state, setState] = useImmer({
    searchTerm: "",
    result: [],
    show: "neither",
    requestCount: 0,
  })

  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler)

    return () => document.addEventListener("keyup", searchKeyPressHandler)
  }, [])

  // Search term dely
  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState((draft) => {
        draft.show = "loading"
      })
      const delay = setTimeout(() => {
        setState((draft) => {
          draft.requestCount++
        })
      }, 750)

      return () => clearTimeout(delay)
    } else {
      setState((draft) => {
        draft.show = "neither"
      })
    }
  }, [state.searchTerm])

  //  run on request count
  useEffect(() => {
    if (state.requestCount) {
      const ourRequest = Axios.CancelToken.source()
      const fetchResult = async () => {
        try {
          const response = await Axios.post(
            "/search",
            { searchTerm: state.searchTerm },
            { cancelToken: ourRequest.token }
          )
          setState((draft) => {
            draft.result = response.data
            draft.show = "results"
          })
        } catch (error) {
          console.log("There was a problem or request was cancelled.")
        }
      }
      fetchResult()
      return () => ourRequest.cancel()
    }
  }, [state.requestCount])

  function searchKeyPressHandler(e) {
    if (e.keyCode == 27) {
      appDispatch({ type: "CLOSESEARCH" })
    }
  }

  function handleInput(e) {
    const value = e.target.value
    setState((draft) => {
      draft.searchTerm = value
    })
  }

  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input
            onChange={handleInput}
            autoFocus
            type="text"
            autoComplete="off"
            id="live-search-field"
            className="live-search-field"
            placeholder="What are you interested in?"
          />
          <span
            onClick={() => appDispatch({ type: "CLOSESEARCH" })}
            className="close-live-search"
          >
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div
            className={`${
              state.show == "loading" ? "circle-loader--visible" : ""
            } circle-loader`}
          ></div>
          <div
            className={`${
              state.show == "results" ? "live-search-results--visible" : ""
            } live-search-results`}
          >
            {Boolean(state.result.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong> ({state.result.length}{" "}
                  {state.result.length > 1 ? "items" : "item"} found)
                </div>
                {state.result.map((post) => {
                  return (
                    <Post
                      post={post}
                      key={post._id}
                      onClick={() => appDispatch({ type: "CLOSESEARCH" })}
                    />
                  )
                })}
              </div>
            )}
            {!Boolean(state.result.length) && (
              <p className="alert alert-danger text-center shadow-sm">
                Sorry, we cannot find any results for that.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
