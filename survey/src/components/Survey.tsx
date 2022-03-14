import { Component } from 'react';
import { default as Question, QuestionSpec } from './Question';
import './Survey.scss';

interface SurveyProps {
    title: string;
    description: string;
    questions: Array<QuestionSpec>;
}

interface SurveyState {
}

export default class Survey extends Component<SurveyProps, SurveyState> {
    constructor(props: SurveyProps) {
        super(props)
    }

    render() {
        return (
            <>
                <h2>{this.props.title}</h2>
                <p>{this.props.description}</p>
                <form className="survey" onSubmit={(e) => { e.preventDefault(); }}>
                    <div className="survey__questions">
                        {this.props.questions.map((question, index) => {
                            const questionNum = index.toString();
                            return (<Question key={questionNum} questionNum={questionNum} {...question} />);
                        })}
                    </div>
                    <input type="submit" className="survey__button" value="Submit" />
                </form>
            </>
        );
    }
}
