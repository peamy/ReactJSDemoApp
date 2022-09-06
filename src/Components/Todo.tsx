import React from 'react';
import { ITodo } from '../Http/requests';

export interface ITodoProps {
    todo?: ITodo;
    onClick?: () => void;
}

export const Todo: React.FunctionComponent<ITodoProps> = (props) => {

    return (
        <div onClick={props.onClick}>
            <div>{props.todo?.id}</div>
            <div>{props.todo?.title}</div>
            <div>{props.todo?.userId}</div>
        </div>
    );
}