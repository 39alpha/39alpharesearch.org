import { Component, FormEvent } from 'react';
import { default as Question, QuestionSpec } from './Question';
import './Survey.scss';

export interface SurveyProps {
    id: string;
    title: string;
    description: string;
    questions: Array<QuestionSpec>;
}

type ResponseValue = string | Array<string>;

interface Response {
    id: number;
    response: ResponseValue;
}

interface SurveyState {
    responses: Array<Response>;
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
        this.onResponseChange = this.onResponseChange.bind(this);
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

    onResponseChange(questionNum: number, questionId: number, response: ResponseValue) {
        this.setState(state => {
            const responses = [...state.responses];
            responses[questionNum] = { id: questionId, response };
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
                            return (
                                <Question
                                    key={question.id}
                                    isFlagged={this.state.flagged.has(index)}
                                    onResponseChange={
                                        (response: ResponseValue) => {
                                            return this.onResponseChange(
                                                index,
                                                question.id,
                                                response
                                            );
                                        }
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
