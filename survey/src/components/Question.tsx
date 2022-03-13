import { Component } from 'react';
import "./Question.scss";

export interface QuestionProps {
    type: string;
    statement: string;
    answers?: Array<any>;
}

interface QuestionState {
}

export default class Question extends Component<QuestionProps, QuestionState> {
    constructor(props: QuestionProps) {
        super(props);
    }

    render() {
        return this.renderQuestion();
    }

    renderQuestion() {
        return (
            <div className="question">
                <p className="question__statement">{this.props.statement}</p>
                <div className="question__answers">
                </div>
            </div>
        );
    }
}
