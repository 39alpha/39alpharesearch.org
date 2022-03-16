import axios from 'axios';
import { Component, FormEvent } from 'react';
import { default as Question, QuestionSpec } from './Question';
import './Survey.scss';

export interface SurveySpec {
    id: string;
    title: string;
    description: string;
    questions: Array<QuestionSpec>;
}

interface SurveyProps {
    id: string | undefined;
}

type ResponseValue = string | Array<string>;

interface Response {
    id: number;
    response: ResponseValue;
}

interface SurveyState {
    isPending: boolean;
    notFound: boolean;
    submitted: boolean;
    submissionFailed: boolean;
    survey: SurveySpec | undefined;
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
            isPending: true,
            notFound: false,
            submitted: false,
            submissionFailed: false,
            survey: undefined,
            responses: [],
            flagged: new Set(),
        };
    }

    componentDidMount() {
        axios
            .get<SurveySpec>(`http://penguin.linux.test/api/v0/surveys/${this.props.id}`)
            .then(response => {
                this.setState(state => {
                    return {
                        isPending: false,
                        notFound: false,
                        survey: response.data,
                    };
                });
            })
            .catch(err => {
                this.setState(state => {
                    return {
                        isPending: false,
                        notFound: true,
                        survey: undefined,
                    };
                });
            });
    }

    submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (this.state.survey === undefined) {
            this.setState({
                isPending: false,
                notFound: true,
            });
            return;
        }

        const flagged = new Set(this.state.flagged);
        for (let i = 0; i < this.state.survey.questions.length; ++i) {
            if (this.state.responses[i] === undefined) {
                flagged.add(i);
            } else {
                flagged.delete(i);
            }
        }

        if (flagged.size !== 0) {
            this.setState({ flagged });
            return;
        }

        axios.post(`http://penguin.linux.test/api/v0/surveys/${this.props.id}/responses`, {
            responses: this.flattenResponses(this.state.responses),
        })
        .then(() => {
            this.setState({
                submitted: true,
                flagged,
            });
        })
        .catch(err => {
            this.setState({
                submissionFailed: true,
            });
        });
    }

    onResponseChange(questionNum: number, questionId: number, response: ResponseValue) {
        this.setState(state => {
            const flagged = new Set(state.flagged);
            const responses = [...state.responses];
            if (response.length === 0) {
                delete responses[questionNum];
            } else {
                responses[questionNum] = { id: questionId, response };
                flagged.delete(questionNum);
            }
            return { responses, flagged };
        });
    }

    render() {
        if (this.state.isPending) {
            return this.Loading();
        } else if (this.state.submissionFailed) {
            return this.SubmissionFailed();
        } else if (this.state.submitted) {
            return this.Submitted();
        } else if (this.state.notFound || this.state.survey === undefined) {
            return this.NotFound();
        }

        return (
            <>
                <h2>{this.state.survey.title}</h2>
                <p>{this.state.survey.description}</p>
                <Flash skippedQuestions={this.state.flagged.size} />
                <form className="survey" autoComplete="on" onSubmit={this.submit}>
                    <div className="survey__questions">
                        {this.state.survey.questions.map((question, index) => {
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

    Loading() {
        return (
            <>
                <h2>39Alpha Surveys</h2>
                <p>Loading survey {this.props.id}...</p>
            </>
        );
    }

    Submitted() {
        return (
            <>
                <h2>39Alpha Surveys</h2>
                <p>
                    Thank you so much for your contribution. If you'd like to help further the
                    39Alpha mission in other ways, consider <a href="/donate">donating</a> or <a
                    href="/contact-us">contact us</a> for suggestions.
                </p>
            </>
        );
    }

    SubmissionFailed() {
        return (
            <>
                <h2>39Alpha Surveys</h2>
                <p>
                    It seems we're having issues submitting your survey responses. Please try again
                    in a few minutes. If the problem persists, please <a href="/contact-us">
                    contact us</a>.
                </p>
            </>
        );
    }

    NotFound() {
        return (
            <>
                <h2>39alpha Surveys</h2>
                <p>
                    Sorry, we couldn't find the survey ({this.props.id}) you were looking for.
                    Maybe check the code again?
                </p>
            </>
        );
    }

    flattenResponses(responses: Array<Response>): Array<Response> {
        const flat = [];
        for (const response of responses) {
            if (typeof response.response === 'string') {
                flat.push(response);
            } else {
                for (const subresponse of response.response) {
                    flat.push({
                        id: response.id,
                        response: subresponse,
                    });
                }
            }
        }
        return flat;
    }
}
