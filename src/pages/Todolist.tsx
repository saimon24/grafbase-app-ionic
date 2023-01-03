import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonLoading,
  useIonRouter,
} from '@ionic/react'
import React, { useRef, useState } from 'react'
import { RouteComponentProps } from 'react-router'
import { useQuery, gql, useMutation } from '@apollo/client'
import { checkmarkDoneOutline, trashBinOutline } from 'ionicons/icons'
import { Todo, TODOLIST_QUERY } from './Home'

interface TodolistPageProps
  extends RouteComponentProps<{
    id: string
  }> {}

const TODOLIST_DETAILS_QUERY = gql`
  query GetTodolistDetails($id: ID!) {
    todoList(by: { id: $id }) {
      title
      id
      todos(first: 100) {
        edges {
          node {
            id
            title
            notes
            complete
          }
        }
      }
    }
  }
`

const CREATE_TODO_MUTATION = gql`
  mutation CreateTodo($title: String!) {
    todoCreate(input: { title: $title, complete: false, notes: "" }) {
      todo {
        id
      }
    }
  }
`

const UPDATE_TODOLIST_MUTATION = gql`
  mutation UpdateTodolist($listID: ID!, $todoID: ID!) {
    todoListUpdate(by: { id: $listID }, input: { todos: [{ link: $todoID }] }) {
      todoList {
        title
        todos(first: 100) {
          edges {
            node {
              id
            }
          }
        }
      }
    }
  }
`

const DELETE_TODO_MUTATION = gql`
  mutation DeleteTodo($id: ID!) {
    todoDelete(by: { id: $id }) {
      deletedId
    }
  }
`

const UPDATE_TODO_MUTATION = gql`
  mutation UpdateTodo($id: ID!, $complete: Boolean) {
    todoUpdate(by: { id: $id }, input: { complete: $complete }) {
      todo {
        title
        complete
        id
      }
    }
  }
`

const DELETE_TODOLIST_MUTATION = gql`
  mutation DeleteTodolist($id: ID!) {
    todoListDelete(by: { id: $id }) {
      deletedId
    }
  }
`

const Todolist: React.FC<TodolistPageProps> = ({ match }) => {
  const { data, loading, error } = useQuery<{
    todoList: { id: String; title: String; todos: { edges: { node: Todo }[] } }
  }>(TODOLIST_DETAILS_QUERY, {
    variables: { id: match.params.id },
  })
  const [updateTodolist] = useMutation(UPDATE_TODOLIST_MUTATION)
  const [deleteTodolist] = useMutation(DELETE_TODOLIST_MUTATION)

  const [createTodo] = useMutation(CREATE_TODO_MUTATION)
  const [deleteTodo] = useMutation(DELETE_TODO_MUTATION)
  const [updateTodo] = useMutation(UPDATE_TODO_MUTATION)

  const [title, setTitle] = useState('')
  const listRef = useRef<HTMLIonListElement>(null)
  const inputRef = useRef<HTMLIonInputElement>(null)
  const ionRouter = useIonRouter()

  const [showLoading, hideLoading] = useIonLoading()

  const addTodo = async () => {
    showLoading()
    // Create a todo
    const createTodoResult = await createTodo({
      variables: { title },
    })

    // Access the result ID
    const todoId = createTodoResult.data.todoCreate.todo.id

    // Update the todolikst to include the todo
    await updateTodolist({
      variables: { listID: match.params.id, todoID: todoId },
      refetchQueries: [TODOLIST_DETAILS_QUERY],
    })

    inputRef.current!.value = ''
    hideLoading()
  }

  const deleteTodoById = (id: string) => {
    deleteTodo({
      variables: { id: id },
      refetchQueries: [TODOLIST_DETAILS_QUERY],
    })
  }

  const updateTodoById = async (id: string) => {
    await updateTodo({
      variables: { id: id, complete: true },
      refetchQueries: [TODOLIST_DETAILS_QUERY],
    })
    listRef.current?.closeSlidingItems()
  }

  const deleteList = () => {
    deleteTodolist({
      variables: { id: match.params.id },
      refetchQueries: [TODOLIST_QUERY],
    })
    ionRouter.goBack()
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="secondary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>{data?.todoList.title}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => deleteList()}>
              <IonIcon icon={trashBinOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonItem>
          <IonInput
            ref={inputRef}
            placeholder="Use Grafbase"
            onIonChange={(e: any) => setTitle(e.target.value)}
          ></IonInput>
          <IonButton expand="full" slot="end" onClick={() => addTodo()}>
            Add Task
          </IonButton>
        </IonItem>
        {data && !loading && !error && (
          <IonList ref={listRef}>
            {data?.todoList?.todos?.edges.map(({ node }) => (
              <IonItemSliding key={node.id}>
                <IonItem>
                  <span
                    style={{
                      textDecoration: node.complete ? 'line-through' : '',
                      opacity: node.complete ? 0.4 : 1,
                    }}
                  >
                    {node.title}
                  </span>
                </IonItem>

                <IonItemOptions side="start">
                  {!node.complete && (
                    <IonItemOption
                      color="success"
                      onClick={() => updateTodoById(node.id)}
                    >
                      <IonIcon
                        icon={checkmarkDoneOutline}
                        slot="icon-only"
                      ></IonIcon>
                    </IonItemOption>
                  )}
                </IonItemOptions>

                <IonItemOptions side="end">
                  <IonItemOption
                    color="danger"
                    onClick={() => deleteTodoById(node.id)}
                  >
                    <IonIcon icon={trashBinOutline} slot="icon-only"></IonIcon>
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            ))}
          </IonList>
        )}
        {data && data?.todoList?.todos?.edges.length === 0 && (
          <div
            className="ion-padding"
            style={{ textAlign: 'center', fontSize: 'large' }}
          >
            <IonLabel color="medium">Add your first item now!</IonLabel>
          </div>
        )}
      </IonContent>
    </IonPage>
  )
}

export default Todolist
