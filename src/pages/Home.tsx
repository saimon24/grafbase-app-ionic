import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonAlert,
  useIonLoading,
} from '@ionic/react'
import { useQuery, gql, useMutation } from '@apollo/client'
import { add } from 'ionicons/icons'

export interface TodoList {
  id: string
  title: string
  todos: { edges: { node: Todo }[] }
}

export interface Todo {
  id: string
  title: string
  notes: string
  complete: boolean
}

// Retrieve collection with Live Queries
export const TODOLIST_QUERY = gql`
  query @live {
    todoListCollection(first: 10) {
      edges {
        node {
          id
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
  }
`

const CREATE_LIST_MUTATION = gql`
  mutation CreateList($title: String!) {
    todoListCreate(input: { title: $title, todos: [] }) {
      todoList {
        id
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
const Home: React.FC = () => {
  // Query our collection on load
  const { data, loading, error } = useQuery<{
    todoListCollection: { edges: { node: TodoList }[] }
  }>(TODOLIST_QUERY)
  const [createList] = useMutation(CREATE_LIST_MUTATION)
  const [presentAlert] = useIonAlert()
  const [showLoading, hideLoading] = useIonLoading()

  const addList = () => {
    presentAlert({
      header: 'Please enter a name for your new list',
      buttons: ['Create List'],
      inputs: [
        {
          name: 'name',
          placeholder: 'Tasklist',
          min: 2,
        },
      ],
      onDidDismiss: async (ev: CustomEvent) => {
        await showLoading()
        console.log('run mutation..')

        // Run the mutation
        const res = await createList({
          variables: { title: ev.detail.data.values.name },
        })
        console.log('🚀 ~ file: Home.tsx:97 ~ onDidDismiss: ~ res', res)

        hideLoading()
      },
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>My Todos</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {data && !loading && !error && (
          <>
            {data?.todoListCollection?.edges?.map(({ node }) => (
              <IonCard button routerLink={`/home/${node?.id}`} key={node?.id}>
                <IonCardHeader>
                  <IonCardTitle>{node?.title}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Tasks: {node?.todos?.edges.length ?? 0}
                </IonCardContent>
              </IonCard>
            ))}
          </>
        )}

        <IonButton expand="block" onClick={() => addList()}>
          <IonIcon icon={add} slot="start"></IonIcon>
          Create new List
        </IonButton>
      </IonContent>
    </IonPage>
  )
}

export default Home
