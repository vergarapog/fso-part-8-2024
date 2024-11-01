import { gql, useQuery } from "@apollo/client";

const ALL_PERSONS = gql`
  query {
    allPersons {
      name
      phone
      id
    }
  }
`;

function App() {
  const result = useQuery(ALL_PERSONS);

  if (result.loading) {
    return <div>Loading....</div>;
  }

  return <div>{result.data.allPersons.map((p) => p.name).join(", ")}</div>;
}

export default App;
