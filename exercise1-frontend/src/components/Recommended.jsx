/* eslint-disable react/prop-types */

import { useQuery } from "@apollo/client"
import { ALL_BOOKS, ME } from "../queries"

const Recommended = ({show}) => {
  const result = useQuery(ME)

  const userFavoriteGenre = result?.data?.me?.favoriteGenre

  const resultBooks = useQuery(ALL_BOOKS, {variables: {genre: userFavoriteGenre}, skip: !userFavoriteGenre})


  const favoriteBooks = resultBooks?.data?.allBooks

  if (!show) {
    return null
  }

  return (
    <div>
      <h1>Recommended</h1>
      <p>Books in your favorite Genre: <b>{userFavoriteGenre}</b></p>  
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {favoriteBooks?.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommended