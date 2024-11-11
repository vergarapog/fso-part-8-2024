/* eslint-disable react/prop-types */
import { useMutation } from "@apollo/client";
import { useState } from "react"
import { EDIT_AUTHOR } from "../queries";

// eslint-disable-next-line react/prop-types
const BornForm = ({authors}) => {
    const [author, setAuthor] = useState('')
    const [born, setBorn] = useState('')

  const [changeBorn] = useMutation(EDIT_AUTHOR);


    const submit = (e) => {
        e.preventDefault()

        changeBorn({ variables: { name: author, setBornTo: parseInt(born) } });

        setBorn('')
    }

  return (
    <div>
        <h1>Set Birthyear</h1>
        <form onSubmit={submit}>
            <div>
                name
                <select onChange={({target}) => setAuthor(target.value)}>
                    <option value="" disabled>Select an author</option>
                    {authors.map((m) => {
                        return <option key={m.id}>{m.name}</option>
                    })}
                </select>
            </div>
            <div>
                number
                <input type="text" value={born} onChange={(e) => setBorn(e.target.value)} />
            </div>
            <button type="submit">Submit</button>
        </form>
    </div>
  )
}

export default BornForm