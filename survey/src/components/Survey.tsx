import { Component } from 'react';

interface SurveyProps {
    title: string;
    description: string;
    questions: Array<any>;
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
                <form className="form" onSubmit={(e) => { e.preventDefault(); }}>
                    <input type="submit" className="form__button" value="Submit" />
                </form>
            </>
        );
    }
}
