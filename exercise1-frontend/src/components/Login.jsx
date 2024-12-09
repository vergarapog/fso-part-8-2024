/* eslint-disable react/prop-types */
import { useEffect, useState } from "react"
import { LOGIN } from "../queries"
import { useMutation } from "@apollo/client"

const Login = ({show, setError, setToken}) => {
 const [username, setUsername] = useState("")
 const [password, setPassword] = useState("")

 const [login, result] = useMutation(LOGIN, {
        onError: (error) => {
            setError(error.graphQLErrors[0].message)
        }
 })

 useEffect(() => {
    if(result.data) {
        const token = result.data.login.value
        setToken(token)
        localStorage.setItem('library-user-token', token)
    }
 }, [result.data, setToken])

 const submit = async (e) => {
    e.preventDefault();

    login({variables: {username, password}})
 }

 if(!show){
    return null
 }


  return (
    <div>
        <form onSubmit={submit}>
            <div>
                <label htmlFor="name">name: </label>
                <input value={username} onChange={(e) => setUsername(e.target.value)} id="name" type="text" />
            </div>
            <div>
                <label htmlFor="password">password: </label>
                <input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" />
            </div>
            <button type="submit">Login</button>
        </form>
    </div>
  )
}

export default Login