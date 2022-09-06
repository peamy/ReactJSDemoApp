import React, {useState, useEffect} from 'react';
import { getTodos, ITodo } from '../Http/requests';

export const Todos2: React.FunctionComponent = () => {

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error>();
    const [todos, setTodos] = useState<ITodo[]>();
    const [drink, setDrink] = useState<string>("Milk");

    useEffect(() => {
        fetchTodos();
    }, []);

    const fetchTodos = async (): Promise<void> => {
        try {
            const result = await getTodos();
            if (result) {
                setTodos(result);
                setError(undefined);
                setLoading(false);
            }
        }
        catch(e) {
            setTodos(undefined);
            setError(e as Error);
            setLoading(false);
        }
    }

    if (loading) return <p>Loading...</p>

    if (error) return <p>Error...</p>

    return (
        <div>
            {todos?.map( todo => <p key={todo.id}>{todo.title}</p>)}

            <div>{drink}</div>
            <button onClick={() => setDrink("Beer")}>Change drink!</button>
        </div>
    );
}