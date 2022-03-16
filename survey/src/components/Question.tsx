import { Component } from 'react';
import { default as Answer, AnswerSpec } from './Answer';
import "./Question.scss";

export interface QuestionSpec {
    id: number;
    type: string;
    statement: string;
    answers?: Array<AnswerSpec>;
}

interface QuestionProps extends QuestionSpec {
    isFlagged: boolean;
    onResponseChange: (answer: string | Array<string>) => void;
}

interface QuestionState {
}

export default class Question<State = QuestionState> extends Component<QuestionProps, State> {
    constructor(props: QuestionProps) {
        super(props);
        this.onResponseChange = this.onResponseChange.bind(this);
    }

    onResponseChange(answer: string) {
        this.props.onResponseChange(answer);
    }

    render() {
        switch (this.props.type) {
            case 'multiple-choice':
            case 'email':
            case 'short-answer':
            case 'long-answer':
                return this.renderQuestion();
            case 'all-that-apply':
                return (<MultipleResponse {...this.props} />);
            default:
                return (<></>);
        }

    }

    renderQuestion() {
        return (
            <div className={'question' + (this.props.isFlagged ? ' question--flagged' : '')}>
                <p className="question__statement">{this.props.statement}</p>
                <div className={"question__answers question__answers--" + this.props.type}>
                    {this.renderAnswers()}
                </div>
            </div>
        );
    }

    renderAnswers() {
        switch (this.props.type) {
            case 'email':
            case 'short-answer':
            case 'long-answer':
                return (
                    <Answer
                        type={this.props.type}
                        questionId={this.props.id}
                        id={0}
                        onResponseChange={this.onResponseChange}
                    />
                );
            default:
                if (this.props.answers === undefined) {
                    return (<></>);
                }
                return this.props.answers.map((answer, index) => {
                    return (
                        <Answer
                            key={answer.id}
                            type={this.props.type}
                            questionId={this.props.id}
                            id={answer.id}
                            value={answer.value}
                            onResponseChange={this.onResponseChange}
                        />
                    );
                });
        }
    }
}

interface MultipleResponseState {
    selected: Set<string>;
}

class MultipleResponse extends Question<MultipleResponseState> {
    constructor(props: QuestionProps) {
        super(props)
        this.onResponseChange = this.onResponseChange.bind(this);
        this.state = {
            selected: new Set(),
        }
    }

    onResponseChange(answer: string) {
        this.setState((state, props) => {
            const selected = new Set(state.selected);
            if (selected.has(answer)) {
                selected.delete(answer);
            } else {
                selected.add(answer);
            }
            props.onResponseChange([...selected]);
            return { selected };
        });
    }

    render() {
        return this.renderQuestion();
    }
}
