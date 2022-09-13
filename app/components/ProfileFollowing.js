import React, { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import Axios from "axios"

import LoadingIcon from "./LoadingIcon"

function ProfileFollowing() {
  const { username } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    const fetchPosts = async () => {
      try {
        const response = await Axios.get(`/profile/${username}/following`, {
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
      {posts.map((following, index) => {
        return (
          <Link
            key={index}
            to={`/profile/${following.username}`}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={following.avatar} />{" "}
            {following.username}
          </Link>
        )
      })}
    </div>
  )
}

export default ProfileFollowing
