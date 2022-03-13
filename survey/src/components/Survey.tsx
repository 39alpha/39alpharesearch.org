import { Component } from 'react';
import { default as Question, QuestionProps } from './Question';
import './Survey.scss';

interface SurveyProps {
    title: string;
    description: string;
    questions: Array<QuestionProps>;
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
                            return (<Question key={index.toString()} {...question} />);
                        })}
                    </div>
                    <input type="submit" className="survey__button" value="Submit" />
                </form>
            </>
        );
    }
}
