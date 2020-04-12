import React from 'react';
import {withAuthenticator} from 'aws-amplify-react';
import { API, graphqlOperation } from 'aws-amplify';
import {createTodo,deleteTodo,updateTodo} from './graphql/mutations';
import {listTodos} from './graphql/queries';
import {onCreateTodo,onDeleteTodo,onUpdateTodo} from './graphql/subscriptions';

class App extends React.Component {
  state = {
    id :'',
    todo: '',
    todos: [{
      id:1,
      name: "Hello Word",
      description:"Hello world Description"

    }]
  }

  componentDidMount(){
   this.getTodo();
   this.createTodoListner=API.graphql(graphqlOperation(onCreateTodo)).subscribe({
     next: todoData =>{
      const newTodo=todoData.value.data.onCreateTodo;
      const prevTodo=this.state.todos.filter(todo => todo.id !==newTodo.id);
      const updatedTodos =[...prevTodo,newTodo];
      this.setState({todos:updatedTodos});
     }
   });

   this.onDeleteTodoListner = API.graphql(graphqlOperation(onDeleteTodo)).subscribe({
     next: todoData =>{
       const deletedTodo =todoData.value.data.onDeleteTodo;
       const updatedTodo= this.state.todos.filter(todo => todo.id !==deletedTodo.id);
       this.setState({todos:updatedTodo});
     }
   });

   this.onUpdateTodoListner = API.graphql(graphqlOperation(onUpdateTodo)).subscribe({
    next: todoData =>{
      const updateTodo =todoData.value.data.onUpdateTodo;
    
    
      const index=this.state.todos.findIndex(todo =>todo.id===updateTodo.id);
 
      const updateTodos= [
         ...this.state.todos.slice(0,index),
         updateTodo,
         ...this.state.todos.slice(index+1)
      ]
      this.setState({todos:updateTodos, todo:"",id:""});
    }
  });
  }
  componentWillUnmount(){
    this.createTodoListner.unsubscribe();
    this.onUpdateTodoListner.unsubscribe();
    this.onDeleteTodoListner.unsubscribe();
  }

  getTodo = async  ()=>{
    const result=await API.graphql(graphqlOperation(listTodos));
    this.setState({todos:result.data.listTodos.items});
  }

  hasExistTodo(){
    const {todos,id}=this.state;
    if(id){
      const isTodo= todos.findIndex(todo => todo.id ===id)> -1;
      return isTodo;
    }
    return false;
  }

  handleQAddTodo = async event =>{
    event.preventDefault();

    if(this.hasExistTodo()){
      console.log('Todos Upated');
      this.handleUpdateTodo();
    }else{
      const {todo,todos} =this.state;
      const input = {
        name:todo,
        description:"Hello world from client app"
      };
       await API.graphql(graphqlOperation(createTodo,{input:input}));
     // const newNode=result.data.createTodo;
    //  const updateNode=[newNode,...todos];
    //  this.setState({todos:updateNode, todo:""});
    this.setState({ todo:""});
    }
  }
    handleUpdateTodo = async ()=> {
      const {todos,todo,id}=this.state;
      const input ={id,name:todo,description:"Updated description"};

     const result= await API.graphql(graphqlOperation(updateTodo,{input}));
     //const updatedTodo=result.data.updateTodo;
     //const index=todos.findIndex(todo =>todo.id===updatedTodo.id);

     //const updateTodos= [
     //   ...todos.slice(0,index),
     //   updatedTodo,
     //   ...todos.slice(index+1)
   //  ]
     //this.setState({todos:updateTodos, todo:"",id:""});

    }
   
  

  
  handleOnChange =event =>{
    this.setState({todo:event.target.value});
    console.log(this.state.todo);
  }
  handleDelete = async todoId =>{
   const {todos} =this.state;
   const input ={id:todoId};
   await API.graphql(graphqlOperation(deleteTodo,{input:input}));
   //const deleteTodoId=result.data.deleteTodo.id;
   //const updateTodos= todos.filter(todo=>(
   //  todo.id !==deleteTodoId
 //  ));
  // this.setState({todos:updateTodos});
  }

  handleSetTodo = ({name,id})=>{
    this.setState({todo:name,id})
  }

  render(){
    const {todo} = this.state;
    return (
      <div className="flex flex-column items-center justify-center pa3 bg-washed-red">
         <h1 className="code f2-l"> Amplify Notetaker     
         </h1>
         <form onSubmit={this.handleQAddTodo} className="mb3">
            <input type="text" className="pa2 f4" onChange={this.handleOnChange} placeholder="write your note" value ={todo}></input>
            <button type="submit" className="pa2 f4">

              {this.state.id? "Update Note":"Add Note"}
            </button>
         </form>
         <div>
            {this.state.todos.map(item =>(
                <div key={item.id} className="flex items-center">
                    <li onClick={()=>this.handleSetTodo(item)} className="list pa1 f3">
                      {item.name}
                      <button onClick= {()=> this.handleDelete(item.id)} className="bg-transparent bn f4" >
                        <span>&times;</span>
                      </button>
                    </li>
                </div> 
            ))}
         </div>
      </div>
    );
  }
 
}

export default withAuthenticator(App,{includeGreetings:true});
