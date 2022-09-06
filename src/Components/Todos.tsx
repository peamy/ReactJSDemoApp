import React, {useState, useEffect} from 'react';
import {useHttpHook} from "./../Hooks/useHttpHook"; // kan ook met https://tanstack.com/query/v4/?from=reactQueryV3&original=https://react-query-v3.tanstack.com/
import { getTodos, getTodo, ITodo, isAnArrayOfTodos, isATodo } from '../Http/requests';
import { Todo } from './Todo';

export const Todos: React.FunctionComponent = () => {

    const [selectedTodo, setSelectedTodo] = useState<number>(197);
    const todos = useHttpHook<ITodo[]>(getTodos, {
        typeCheck: isAnArrayOfTodos, 
        cache: {
            cacheKey: "todos",
            cacheExpireTime: 2000,
            useLocalStorage: true
        }
    });
    const todo = useHttpHook<ITodo>(() => getTodo(selectedTodo), {
        typeCheck: isATodo,
        onError: () => {
            setSelectedTodo(1);
        },
        onSuccess: (val: ITodo) => console.log(val),
    }, [selectedTodo]);

    useEffect(() => {
        let oldValInter = setInterval(() => setSelectedTodo((oldVal: number) => oldVal + 1), 1000);
        return () => clearInterval(oldValInter);
    }, []);

    if (todos.loading) return <p>Loading...</p>

    if (todos.error) return <p>Error...</p>

    return (
        <div>
            <div>
                <b>Selected Todo</b><br/>
                <Todo todo={todo.result} />
            </div>
            <div>
                <b>All Todos</b>
                {todos.result?.slice(0, 5).map( todo => <Todo key={todo.id} todo={todo} onClick={() => setSelectedTodo(todo.id)} />)}
            </div>
        </div>
    );
}
