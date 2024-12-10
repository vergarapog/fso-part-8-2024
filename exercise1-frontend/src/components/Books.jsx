import { useQuery } from "@apollo/client"
import {  ALL_BOOKS } from "../queries"
import { useState } from "react"

const Books = (props) => {
  const [genre, setGenre] = useState(undefined)

  const result = useQuery(ALL_BOOKS, {variables: {genre: genre}})
  
  // eslint-disable-next-line react/prop-types
  if (!props.show) {
    return null
  }

  if (result.loading) {
    return <div>loading...</div>
  }

  const books = result.data.allBooks;

  const allGenres = [...new Set(books.flatMap(book => book.genres))]

  return (
    <div>
      <h2>books</h2>
      {!genre ? <h4>All genres</h4> : <h4>in genre {genre}</h4>}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <br />
      <div>
      <button  onClick={() => setGenre(null)}>All</button>
      {!genre && allGenres.map((genre) => {
            return <button key={genre} onClick={() => setGenre(genre)}>{genre}</button>
          })}
      </div>
    </div>
  )
}

export default Books
