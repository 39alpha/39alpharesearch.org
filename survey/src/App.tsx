import './App.scss';
import * as config from './config.json';
import axios from 'axios';
import { Component } from 'react';
import Footer from './components/Footer';
import Header from './components/Header';
import { default as Survey, SurveyProps } from './components/Survey';

interface AppProps {
}

interface AppState {
    isPending: boolean;
    notFound: boolean;
    survey_id: string;
    survey: any;
}

export default class App extends Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.state = {
            isPending: true,
            notFound: false,
            survey_id: '',
            survey: undefined,
        };
    }

    componentDidMount() {
        if (window.location.search !== '') {
            const survey_id = window.location.search.replace(/^\?/, '');
            axios
                .get<SurveyProps>(`http://penguin.linux.test/api/v0/surveys/${survey_id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                .then(response => {
                    this.setState(state => {
                        return {
                            isPending: false,
                            survey: response.data,
                            survey_id,
                        };
                    });
                })
                .catch(err => {
                    this.setState(state => {
                        return {
                            isPending: false,
                            notFound: true,
                            survey_id,
                        };
                    });
                });
        }
    }

    render() {
        return (
            <>
                <Header {...config} />
                <main className="page-content" aria-label="Content">
                    <div className="wrapper wrapper--narrow">
                        <article className="post">
                            <div className="post-content">
                                {this.renderContent()}
                            </div>
                        </article>
                    </div>
                </main>
                <Footer {...config} />
            </>
        );
    }

    renderContent() {
        if (window.location.search === '') {
            return (
                <>
                <h2>39Alpha Surveys</h2>
                <p>
                    39Alpha Research hosts a number of research surveys. If you are interested in
                    participating in one, please <a href="/contact-us">contact us</a> and we will
                    send you a link to one that suits your interest and our needs.
                </p>
                </>
            );
        }

        if (this.state.isPending) {
            return (<p>Loading Survey</p>);
        } else if (this.state.notFound || this.state.survey === undefined) {
            return (
                <>
                    <h2>39Alpha Surveys</h2>
                    <p>
                        Sorry, we couldn't find the survey ({this.state.survey_id}) you were looking
                        for. Maybe check the code again?
                    </p>
                </>
            );
        } else {
            return (<Survey {...this.state.survey} />);
        }
    }
}
