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

// const GRAFBASE_API_URL = 'http://127.0.0.1:4000/graphql'
const GRAFBASE_API_URL =
  'https://grafbase-app-ionic-main-saimon24.grafbase.app/graphql'

// Use JWT in a real app
// https://grafbase.com/docs/concepts/api-keys
const API_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2NzI3NDY4MDksImlzcyI6ImdyYWZiYXNlIiwiYXVkIjoiMDFHTlZRTkVBUkFWN0JQMTQyNUQ4WU5GMUYiLCJqdGkiOiIwMUdOVlFORUFSVjA4WjJERlZGNzBNODRTUSIsImVudiI6InByb2R1Y3Rpb24iLCJwdXJwb3NlIjoicHJvamVjdC1hcGkta2V5In0.Kqaj3-g5wSY_RwynN4lkcEfljK52fzJedRyRkX_CG9c'

export const createApolloLink = () => {
  const sseLink = new SSELink({
    uri: GRAFBASE_API_URL,
    headers: {
      'x-api-key': API_KEY,
    },
  })

  const httpLink = new HttpLink({
    uri: GRAFBASE_API_URL,
    headers: {
      'x-api-key': API_KEY,
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
