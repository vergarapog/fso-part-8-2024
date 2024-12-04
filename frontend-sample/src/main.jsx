import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('phonenumbers-user-token')
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}`: null,
      }
    }
})

const httpLink = createHttpLink({
  uri: 'http://localhost:4000',
})


const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: authLink.concat(httpLink)
})


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>    
      <App />
    </ApolloProvider>
  </StrictMode>,
)
