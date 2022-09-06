import {Sarvis} from "sarvis";

export const s = new Sarvis({
    base_url: "https://jsonplaceholder.typicode.com"
});

export interface ITodo {
	userId: number;
	id: number;
	title: string;
	completed: Boolean;
}

export const isATodo = (obj: any): obj is ITodo => {
    return 'id' in obj && 'title' in obj;
}

export const isAnArrayOfTodos = (obj: any): obj is ITodo[] => {
    let isTodos = true;
    if (!Array.isArray(obj)) isTodos = false;
    obj.forEach( (todo: any) => {
        if (!isATodo(todo)) {isTodos = false};
    })
    return isTodos;
}

export const getTodos = (): Promise<ITodo[]> => {
    return s.get('/todos');
}

export const getTodo = (id: number): Promise<ITodo> => {
    return s.get(`/todos/${id}`);
}