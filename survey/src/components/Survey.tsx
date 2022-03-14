import { Component, FormEvent } from 'react';
import { default as Question, QuestionSpec } from './Question';
import './Survey.scss';

export interface SurveyProps {
    title: string;
    description: string;
    questions: Array<QuestionSpec>;
}

interface SurveyState {
    responses: Array<any>;
    flagged: Set<number>;
}

function Flash(props: { skippedQuestions: number }) {
    return (
        <p className={'flash' + (props.skippedQuestions === 0 ? ' hidden' : ' flash--error')}>
            It looks like you missed {props.skippedQuestions} question
            {props.skippedQuestions > 1 ? 's' : ''}.

            We'd appreciate it if you would take a few moments to answer the remaining questions.
        </p>
    );
}

export default class Survey extends Component<SurveyProps, SurveyState> {
    constructor(props: SurveyProps) {
        super(props)
        this.submit = this.submit.bind(this);
        this.onAnswerChange = this.onAnswerChange.bind(this);
        this.state = {
            responses: new Array(props.questions.length),
            flagged: new Set(),
        };
    }

    submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        this.setState((state, props) => {
            const flagged = new Set(state.flagged);
            for (let i = 0; i < props.questions.length; ++i) {
                if (state.responses[i] === undefined) {
                    flagged.add(i);
                } else {
                    flagged.delete(i);
                }
            }
            if (flagged.size === 0) {
                console.log(state.responses);
            }
            return { flagged };
        });
    }

    onAnswerChange(questionNum: string, answer: any) {
        this.setState(state => {
            const responses = [...state.responses];
            responses[parseInt(questionNum)] = answer;
            return { responses };
        });
    }

    render() {
        return (
            <>
                <h2>{this.props.title}</h2>
                <p>{this.props.description}</p>
                <Flash skippedQuestions={this.state.flagged.size} />
                <form className="survey" onSubmit={this.submit}>
                    <div className="survey__questions">
                        {this.props.questions.map((question, index) => {
                            const questionNum = index.toString();
                            return (
                                <Question
                                    key={questionNum}
                                    questionNum={questionNum}
                                    isFlagged={this.state.flagged.has(index)}
                                    onAnswerChange={
                                        (answer: any) => this.onAnswerChange(questionNum, answer)
                                    }
                                    {...question}
                                />
                            );
                        })}
                    </div>
                    <input type="submit" className="survey__button" value="Submit" />
                </form>
            </>
        );
    }
}
