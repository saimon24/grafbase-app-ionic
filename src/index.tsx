import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'
import reportWebVitals from './reportWebVitals'
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  split,
  HttpLink,
} from '@apollo/client'
import { isLiveQuery, SSELink } from '@grafbase/apollo-link'
import { getOperationAST } from 'graphql'
import { SignJWT } from 'jose'

// Example of genreating a JWT:
// const secret = new Uint8Array(
//   'mysupersecretk3y!'.split('').map((c) => c.charCodeAt(0)),
// )

// const getToken = () => {
//   return new SignJWT({ sub: 'user_1234', groups: [] })
//     .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
//     .setIssuer('https://devdactic.com')
//     .setIssuedAt()
//     .setExpirationTime('2h')
//     .sign(secret)
// }

// const GRAFBASE_API_URL = 'http://127.0.0.1:4000/graphql'
const GRAFBASE_API_URL =
  'https://grafbase-app-ionic-main-saimon24.grafbase.app/graphql'

// Use JWT in a real app or API Key for testing with x-api-key
const JWT_TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMzQiLCJncm91cHMiOltdLCJpc3MiOiJodHRwczovL2RldmRhY3RpYy5jb20iLCJpYXQiOjE2NzMyNzE3MDIsImV4cCI6MTY3MzI3ODkwMn0.UTeRkRNd_e5J6rnqJmeFKN-MN9F3_PcYqp_cthsGp_E'
export const createApolloLink = () => {
  const sseLink = new SSELink({
    uri: GRAFBASE_API_URL,
    headers: {
      authorization: JWT_TOKEN,
    },
  })

  const httpLink = new HttpLink({
    uri: GRAFBASE_API_URL,
    headers: {
      authorization: JWT_TOKEN,
    },
  })

  return split(
    ({ query, operationName, variables }) =>
      isLiveQuery(getOperationAST(query, operationName), variables),
    sseLink,
    httpLink,
  )
}

const link = createApolloLink()

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
})

const container = document.getElementById('root')
const root = createRoot(container!)
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister()

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
