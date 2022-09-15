import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import Axios from "axios"

import LoadingIcon from "./LoadingIcon"
import Post from "./Post"

function ProfilePosts() {
  const { username } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    const fetchPosts = async () => {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, {
          cancelToken: ourRequest.token,
        })
        setPosts(response.data)
        setIsLoading(false)
      } catch (error) {
        console.log("There was a problem or the request was cancelled.")
      }
    }
    fetchPosts()
    return () => {
      ourRequest.cancel()
    }
  }, [username])

  if (isLoading) return <LoadingIcon />

  return (
    <div className="list-group">
      {posts.map((post) => {
        return <Post selfAuthor={true} post={post} key={post._id} />
      })}
    </div>
  )
}

export default ProfilePosts
