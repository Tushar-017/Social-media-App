import React, { useEffect, useReducer } from "react"
import ReactDOM from "react-dom/client"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Route, Routes } from "react-router-dom"
import { CSSTransition } from "react-transition-group"
import Axios from "axios"
Axios.defaults.baseURL = "http://localhost:8080"

import Header from "./components/Header"
import Footer from "./components/Footer"
import HomeGuest from "./components/HomeGuest"
import FlashMsg from "./components/FlashMsg"
import Search from "./components/Search"

import About from "./pages/About"
import Terms from "./pages/Terms"
import Home from "./pages/Home"
import CreatePost from "./pages/CreatePost"
import ViewSinglePost from "./pages/ViewSinglePost"
import Profile from "./pages/Profile"
import EditPost from "./pages/EditPost"
import NotFound from "./components/NotFound"
import Chat from "./pages/Chat"

import StateContext from "./context/StateContext"
import DispatchContext from "./context/DispatchContext"

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("appToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("appToken"),
      username: localStorage.getItem("appUsername"),
      avatar: localStorage.getItem("appAvatar"),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case "LOGIN":
        draft.loggedIn = true
        draft.user = action.data
        return
      case "LOGOUT":
        draft.loggedIn = false
        return
      case "FLASHMESSAGE":
        draft.flashMessages.push(action.value)
        return
      case "OPENSEARCH":
        draft.isSearchOpen = true
        return
      case "CLOSESEARCH":
        draft.isSearchOpen = false
        return
      case "TOGGLECHAT":
        draft.isChatOpen = !draft.isChatOpen
        return
      case "CLOSECHAT":
        draft.isChatOpen = false
        return
      case "INCREMENTUNREADCHATCOUNT":
        draft.unreadChatCount++
        return
      case "CLEAR_UNREAD_CHAT_COUNT":
        draft.unreadChatCount = 0
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("appToken", state.user.token)
      localStorage.setItem("appUsername", state.user.username)
      localStorage.setItem("appAvatar", state.user.avatar)
    } else {
      localStorage.removeItem("appToken")
      localStorage.removeItem("appUsername")
      localStorage.removeItem("appAvatar")
    }
  }, [state.loggedIn])

  // Check if token is expired or not
  useEffect(() => {
    if (state.loggedIn) {
      const ourRequest = Axios.CancelToken.source()
      const fetchResult = async () => {
        try {
          const response = await Axios.post(
            "/checkToken",
            { token: state.user.token },
            { cancelToken: ourRequest.token }
          )
          if (!response.data) {
            dispatch({ type: "LOGOUT" })
            dispatch({
              type: "FLASHMESSAGE",
              value: "Your session has expired, Please logIn again",
            })
          }
        } catch (error) {
          console.log("There was a problem or request was cancelled.")
        }
      }
      fetchResult()
      return () => ourRequest.cancel()
    }
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMsg flashMessage={state.flashMessages} />
          <Header />
          <Routes>
            <Route path="/profile/:username/*" element={<Profile />} />
            <Route
              path="/"
              element={state.loggedIn ? <Home /> : <HomeGuest />}
            />
            <Route path="/post/:id" element={<ViewSinglePost />} />
            <Route path="/post/:id/edit" element={<EditPost />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CSSTransition
            timeout={330}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <Search />
          </CSSTransition>
          <Chat />
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

const root = ReactDOM.createRoot(document.querySelector("#app"))
root.render(<Main />)

if (module.hot) {
  module.hot.accept()
}
