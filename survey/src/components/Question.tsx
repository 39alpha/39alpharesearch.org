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
    onAnswerChange: (answer: string) => void;
}

interface QuestionState {
}

export default class Question extends Component<QuestionProps, QuestionState> {
    constructor(props: QuestionProps) {
        super(props);
        this.onAnswerChange = this.onAnswerChange.bind(this);
    }

    onAnswerChange(answer: string) {
        this.props.onAnswerChange(answer);
    }

    render() {
        return this.renderQuestion();
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
