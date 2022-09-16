import React, { useContext } from "react"
import { Link, useNavigate } from "react-router-dom"
import ReactTooltip from "react-tooltip"

import DispatchContext from "../DispatchContext"
import StateContext from "../StateContext"

function HeaderLoggedIn() {
  const navigate = useNavigate()
  const appDispatch = useContext(DispatchContext)
  const appState = useContext(StateContext)

  const handleLogout = () => {
    appDispatch({ type: "LOGOUT" })
    appDispatch({
      type: "FLASHMESSAGE",
      value: "You have successfully SignOut.",
    })
    navigate("/")
  }
  const handleSearchIcon = (e) => {
    e.preventDefault(appDispatch({ type: "OPENSEARCH" }))
  }
  return (
    <div className="flex-row my-3 my-md-0">
      <a
        data-for="search"
        data-tip="Search"
        href="#"
        onClick={handleSearchIcon}
        className="text-white mr-2 header-search-icon"
      >
        <i className="fas fa-search"></i>
      </a>
      <ReactTooltip place="bottom" id="search" className="custom-tooltip" />{" "}
      <span
        data-for="chat"
        data-tip="Chat"
        className={`${
          appState.unreadChatCount ? "text-danger" : "text-white"
        } mr-2 header-chat-icon`}
        onClick={() => appDispatch({ type: "TOGGLECHAT" })}
      >
        <i className="fas fa-comment" style={{ fontSize: "20px" }}></i>
        {appState.unreadChatCount ? (
          <span className="chat-count-badge text-white">
            {appState.unreadChatCount < 10 ? appState.unreadChatCount : "9+"}
          </span>
        ) : (
          ""
        )}
      </span>
      <ReactTooltip place="bottom" id="chat" className="custom-tooltip" />{" "}
      <Link
        data-for="profile"
        data-tip="Profile"
        to={`/profile/${appState.user.username}`}
        className="mr-2"
      >
        <img className="small-header-avatar" src={appState.user.avatar} />
      </Link>
      <ReactTooltip place="bottom" id="profile" className="custom-tooltip" />{" "}
      <Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>{" "}
      <button onClick={handleLogout} className="btn btn-sm btn-secondary">
        Sign Out
      </button>
    </div>
  )
}

export default HeaderLoggedIn
