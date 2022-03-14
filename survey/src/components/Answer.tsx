import "./Answer.scss";
import { ChangeEvent, Component } from 'react';

interface AnswerProps {
    type: string;
    questionNum: string;
    answerNum: string;
    value?: string;
    onAnswerChange: (answer: string) => void;
}

interface AnswerState {
}

export default class Answer extends Component<AnswerProps, AnswerState> {
    constructor(props: AnswerProps) {
        super(props);
        this.onAnswerChange = this.onAnswerChange.bind(this);
    }

    onAnswerChange(e: ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) {
        this.props.onAnswerChange(e.target.value);
    }

    render() {
        switch (this.props.type) {
            case 'multiple-choice':
                return (<MultipleChoice {...this.props} />);
            case 'all-that-apply':
                return (<AllThatApply {...this.props} />);
            case 'email':
                return (<Email {...this.props} />);
            case 'short-answer':
                return (<ShortAnswer {...this.props} />);
            case 'long-answer':
                return (<LongAnswer {...this.props} />);
            default:
                return (<></>);
        }
    }

    className() {
        return "answer answer--" + this.props.type;
    }
}

class MultipleChoice extends Answer {
    render() {
        return (
            <div className={this.className()}>
                <input
                    type="radio"
                    className="answer__radio"
                    id={"question" + this.props.questionNum + "answer" + this.props.answerNum}
                    name={"question" + this.props.questionNum}
                    value={this.props.value}
                    onChange={this.onAnswerChange}
                />
                <label htmlFor={"question" + this.props.questionNum + "answer" + this.props.answerNum}>
                    {this.props.value}
                </label>
            </div>
        );
    }
}

class AllThatApply extends Answer {
    render() {
        return (
            <div className={this.className()}>
                <input
                    type="checkbox"
                    className="answer__checkbox"
                    id={"question" + this.props.questionNum + "answer" + this.props.answerNum}
                    name={"question" + this.props.questionNum}
                    value={this.props.value}
                    onChange={this.onAnswerChange}
                />
                <label htmlFor={"question" + this.props.questionNum + "answer" + this.props.answerNum}>
                    {this.props.value}
                </label>
            </div>
        );
    }
}

class Email extends Answer {
    render() {
        return (
            <div className={this.className()}>
                <input
                    type="email"
                    className="answer__email"
                    id={"question" + this.props.questionNum + "answer" + this.props.answerNum}
                    onChange={this.onAnswerChange}
                />
            </div>
        );
    }
}

class ShortAnswer extends Answer {
    render() {
        return (
            <div className={this.className()}>
                <input
                    type="text"
                    className="answer__text"
                    id={"question" + this.props.questionNum + "answer" + this.props.answerNum}
                    onChange={this.onAnswerChange}
                />
            </div>
        );
    }
}

class LongAnswer extends Answer {
    render() {
        return (
            <div className={this.className()}>
                <textarea
                    className="answer__textarea"
                    id={"question" + this.props.questionNum + "answer" + this.props.answerNum}
                    onChange={this.onAnswerChange}
                ></textarea>
            </div>
        );
    }
}
