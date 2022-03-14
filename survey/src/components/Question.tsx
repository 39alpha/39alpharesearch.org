import { Component } from 'react';
import Answer from './Answer';
import "./Question.scss";

export interface QuestionSpec {
    type: string;
    statement: string;
    answers?: Array<string>;
}

interface QuestionProps extends QuestionSpec {
    questionNum: string;
    isFlagged: boolean;
    onAnswerChange: (answer: any) => void;
}

interface QuestionState {
}

export default class Question<State = QuestionState> extends Component<QuestionProps, State> {
    constructor(props: QuestionProps) {
        super(props);
        this.onAnswerChange = this.onAnswerChange.bind(this);
    }

    onAnswerChange(answer: string) {
        this.props.onAnswerChange(answer);
    }

    render() {
        switch (this.props.type) {
            case 'multiple-choice':
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
            case 'short-answer':
            case 'long-answer':
                return (
                    <Answer
                        type={this.props.type}
                        questionNum={this.props.questionNum}
                        answerNum="0"
                        onAnswerChange={this.onAnswerChange}
                    />
                );
            default:
                if (this.props.answers === undefined) {
                    return (<></>);
                }
                return this.props.answers.map((answer, index) => {
                    return (
                        <Answer
                            key={index.toString()}
                            type={this.props.type}
                            questionNum={this.props.questionNum}
                            answerNum={index.toString()}
                            value={answer}
                            onAnswerChange={this.onAnswerChange}
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
        this.onAnswerChange = this.onAnswerChange.bind(this);
        this.state = {
            selected: new Set(),
        }
    }

    onAnswerChange(answer: string) {
        this.setState((state, props) => {
            const selected = new Set(state.selected);
            if (selected.has(answer)) {
                selected.delete(answer);
            } else {
                selected.add(answer);
            }
            props.onAnswerChange([...selected]);
            return { selected };
        });
    }

    render() {
        return this.renderQuestion();
    }
}
