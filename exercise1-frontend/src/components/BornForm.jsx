import { useMutation } from "@apollo/client";
import { useState } from "react"
import { EDIT_AUTHOR } from "../queries";

const BornForm = () => {
    const [author, setAuthor] = useState('')
    const [born, setBorn] = useState('')

  const [changeBorn] = useMutation(EDIT_AUTHOR);


    const submit = (e) => {
        e.preventDefault()

        changeBorn({ variables: { name: author, setBornTo: parseInt(born) } });

        setAuthor('')
        setBorn('')
    }


  return (
    <div>
        <h1>Set Birthyear</h1>
        <form onSubmit={submit}>
            <div>
                name
                <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
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