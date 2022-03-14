import "./Answer.scss";
import { Component } from 'react';

interface AnswerProps {
    type: string;
    questionNum: string;
    answerNum: string;
    value?: string;
}

interface AnswerState {
}

export default class Answer extends Component<AnswerProps, AnswerState> {
    constructor(props: AnswerProps) {
        super(props);
    }

    render() {
        switch (this.props.type) {
            case 'multiple-choice':
                return (<MultipleChoice {...this.props} />);
            case 'all-that-apply':
                return (<AllThatApply {...this.props} />);
            case 'short-answer':
                return (<ShortAnswer {...this.props} />);
            case 'long-answer':
                return (<LongAnswer {...this.props} />);
            default:
                return (<></>);
        }
    }
}

class MultipleChoice extends Answer {
    render() {
        return (
            <>
                <input
                    type="radio"
                    className="answer__radio"
                    id={"question" + this.props.questionNum + "answer" + this.props.answerNum}
                    name={"question" + this.props.questionNum}
                    value={this.props.value}
                />
                <label htmlFor={"question" + this.props.questionNum + "answer" + this.props.answerNum}>
                    {this.props.value}
                </label>
            </>
        );
    }
}

class AllThatApply extends Answer {
    render() {
        return (
            <>
                <input
                    type="checkbox"
                    className="answer__checkbox"
                    id={"question" + this.props.questionNum + "answer" + this.props.answerNum}
                    name={"question" + this.props.questionNum}
                    value={this.props.value}
                />
                <label htmlFor={"question" + this.props.questionNum + "answer" + this.props.answerNum}>
                    {this.props.value}
                </label>
            </>
        );
    }
}

class ShortAnswer extends Answer {
    render() {
        return (
            <input
                type="text"
                className="answer__text"
                id={"question" + this.props.questionNum + "answer" + this.props.answerNum}
            />
        );
    }
}

class LongAnswer extends Answer {
    render() {
        return (
            <textarea
                className="answer__textarea"
                id={"question" + this.props.questionNum + "answer" + this.props.answerNum}
            ></textarea>
        );
    }
}
