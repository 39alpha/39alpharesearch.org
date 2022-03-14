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
                        />
                    );
                });
        }
    }

}
